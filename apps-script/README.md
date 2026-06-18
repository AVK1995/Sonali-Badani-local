# Sonali Badani CRM — Meta CAPI Apps Script

Apps Script bound to the **Sonali Badani CRM** Google Sheet. It fires four
server-side Meta Conversions API events:

| When | Event (Meta) | Type | Value |
|---|---|---|---|
| ~1 min after Pabbly adds a paid row | `Purchase` | standard | `amount` (col O) |
| ~1 min after Pabbly adds a paid row | `sales` | custom | `amount` (col O) |
| Sales team sets `qualified_lead` (AB) → TRUE | `QualifiedLead` | custom | — |
| Sales team sets `high_ticket` (AF) → TRUE | `HighTicketPurchase` | custom | `contracted_value` (AG) |

`Purchase` + `sales` fire automatically from a **time-driven trigger (every 1
min)** because Pabbly's "Add Row" is a programmatic write that does **not** fire
`onEdit`. The two downstream events fire instantly on a human dropdown edit.

The browser side (Meta Pixel `PageView` + the `_fbc`/`_fbp` cookies that make
these server events high-EMQ) lives in the **Next.js app**, not here. The two
systems share the same pixel id + token but only meet through the Sheet.

---

## Sheet schema — 36 columns, A..AJ

**A..W (auto-filled by Pabbly — the 23 capture fields):**
```
lead_id | created_at | first_name | last_name | email | phone | city | country_code | fbc | fbp | client_ip_address | client_user_agent | external_id | event_source_url | amount | is_test | purchase_event_id | utm_source | utm_medium | utm_campaign | utm_content | utm_term | fbclid
```

**X..AJ (events — Apps Script + sales team):**
| Col | Field | Written by | Notes |
|---|---|---|---|
| X | `purchase_capi_event_id` | Apps Script | = `purchase_event_id` (pay_xxx) |
| Y | `purchase_capi_sent` | Apps Script | `TRUE` after Purchase fires |
| Z | `sales_capi_event_id` | Apps Script | = `pay_xxx_sales` |
| AA | `sales_capi_sent` | Apps Script | `TRUE` after sales fires |
| AB | `qualified_lead` | Sales team | **Dropdown** TRUE/FALSE (blank default) |
| AC | `qualified_lead_time` | Sales team | datetime (IST) |
| AD | `ql_capi_event_id` | Apps Script | = `pay_xxx_qualifiedlead` |
| AE | `ql_capi_sent` | Apps Script | `TRUE` after fire |
| AF | `high_ticket` | Sales team | **Dropdown** TRUE/FALSE (blank default) |
| AG | `contracted_value` | Sales team | Plain integer INR. **Fill BEFORE setting TRUE.** |
| AH | `high_ticket_time` | Sales team | datetime (IST) |
| AI | `ht_capi_event_id` | Apps Script | = `pay_xxx_htpurchase` |
| AJ | `ht_capi_sent` | Apps Script | `TRUE` after fire |

Use **Data Validation dropdowns** (values `TRUE`,`FALSE`, blank default) for
AB and AF — not checkboxes (a checkbox renders as FALSE on Pabbly's row insert,
which muddies "never touched" vs "explicitly FALSE").

Also create a hidden **`_Errors`** tab, row 1:
`timestamp | row_number | event_type | http_status | response_body | retry_count`

Set the spreadsheet timezone to **Asia/Kolkata** (File → Settings).

---

## Deploy (~10 min)

1. **Sheet → Extensions → Apps Script.** Delete the default `Code.gs`, paste in
   this folder's [`Code.gs`](./Code.gs). Save.
2. Gear icon → tick **"Show appsscript.json manifest"** → open `appsscript.json`,
   replace with this folder's [`appsscript.json`](./appsscript.json). Save.
3. Gear icon → **Script Properties** → add:

   | Property | Value |
   |---|---|
   | `META_PIXEL_ID` | the pixel id (same value as Vercel `NEXT_PUBLIC_META_PIXEL_ID`) |
   | `META_CAPI_ACCESS_TOKEN` | the CAPI access token (**secret**) |
   | `EVENT_SOURCE_URL_DEFAULT` | `https://www.sonalibadani.com/welcome` |
   | `SPREADSHEET_ID` | the CRM sheet's id (from its URL: `docs.google.com/spreadsheets/d/`**`<this>`**`/edit`). **Required for the Web App** — `getActiveSpreadsheet()` is null inside `doPost`. |

   Optional:
   | Property | Default | Use when |
   |---|---|---|
   | `MAIN_SHEET_NAME` | `Sheet1` | main tab renamed |
   | `DEFAULT_COUNTRY` | `in` | non-India funnel (2-letter ISO) |
   | `META_GRAPH_API_VERSION` | `v21.0` | pin a different Graph version |
   | `META_TEST_EVENT_CODE` | — | **set during smoke testing** so events route to Meta → Test Events. Clear for production. |
   | `WEBAPP_SECRET` | — | **required for real-time firing** (below) — a random string Pabbly must send as `token`. |

4. Function dropdown → `setupTriggers` → **Run** → authorize. Expect:
   `setupTriggers OK — removed 0, installed onSheetEdit + processNewRows(1 min)`.

> ⚠️ Do not hardcode the pixel id / token in `Code.gs` — they are read from
> Script Properties. The pixel id must match Vercel's `NEXT_PUBLIC_META_PIXEL_ID`.

---

## Real-time firing (Web App + Pabbly) — fire Purchase/sales in ~seconds

The 1-min `processNewRows` poll is reliable but not instant. To fire the moment a
sale lands, deploy this same script as a **Web App** and have **Pabbly ping it
right after "Add Row."** `doPost` finds the just-added row and reuses `fireEvent`
(same payload, same EMQ), then stamps it so the poll skips it. The poll stays as
a safety net; `event_id` dedup means there is never a double count.

**1. Set the secret.** Script Properties → add `WEBAPP_SECRET` = a long random
string (e.g. from a password generator). This is the only thing protecting the
public Web App URL.

**2. Deploy as a Web App.** Apps Script editor → **Deploy → New deployment** →
gear → **Web app**:
- Description: `CAPI realtime`
- Execute as: **Me** (the sheet owner)
- Who has access: **Anyone**
- **Deploy** → authorize → copy the **Web app URL** (ends in `/exec`).

Health-check it: open the `/exec` URL in a browser → you should see
`{"ok":true,"service":"sonali-crm-capi"}`.

> Re-deploy after any `Code.gs` change: **Deploy → Manage deployments → (edit) →
> Version: New version → Deploy.** The `/exec` URL stays the same.

**3. Add the Pabbly ping.** In the Pabbly workflow, **after** the Google Sheets
"Add Row" step, add an action → **"API by Pabbly Connect"** (or any
HTTP/Webhook action):
- Method: **POST**
- URL: your `/exec` Web App URL
- Send these as query params (or JSON body):
  - `token` = the `WEBAPP_SECRET` value
  - `purchase_event_id` = map the Razorpay payment id from the trigger (the same
    value that goes into column Q)

That's it — Add Row writes the record, the next step pings the Web App, and
Purchase + sales fire within seconds.

**4. Test.** Set `META_TEST_EVENT_CODE`, run the Pabbly workflow once (or re-run
the last task). Within seconds: `Purchase` + `sales` appear in Meta → Test
Events, and cols X–AA stamp `TRUE`. Then clear the test code for production.

---

## Smoke test (against Meta Test Events)

1. Set `META_TEST_EVENT_CODE` to the code from **Events Manager → Test Events**.
2. **Purchase + sales:** wait up to 1 min after a real (or pasted) paid row — or
   run `processNewRows` manually. Both should appear in Test Events; cols X–AA
   stamp. With `fbc`,`fbp`,`email`,`phone`,`ip`,`ua` all populated, EMQ should be 9+.
3. **QualifiedLead:** fill `qualified_lead_time` (AC), set `qualified_lead` (AB)
   → TRUE. Event appears; AD/AE stamp.
4. **HighTicketPurchase:** fill `contracted_value` (AG, e.g. `60000`) and
   `high_ticket_time` (AH), then set `high_ticket` (AF) → TRUE. Event appears
   with `value: 60000, currency: INR`; AI/AJ stamp.
5. **Clear `META_TEST_EVENT_CODE`** before going live.

`is_test = true` rows are skipped in production (only fire when a test code is set).

---

## Ops

- **Dedup:** per-row `*_sent` flag + deterministic `event_id` (`pay_xxx[_suffix]`).
  Meta dedupes same `event_name`+`event_id` within 48h.
- **Errors:** non-200 → `_Errors` tab, flag left unset, row retry-able. Bulk
  recover with `replayPendingEvents`.
- **Why a 1-min poll for Purchase/sales:** installable `onEdit` does not fire on
  Pabbly's API row writes. The poll is the reliable path; ~1-min latency is
  irrelevant to Meta attribution.
- **Token rotation:** update `META_CAPI_ACCESS_TOKEN`; no redeploy needed.

---

## Deviations from the reference SOP (intentional, for this funnel)

1. `Purchase` + `sales` fire from **Apps Script**, not a backend route — TagMango
   hosts the checkout, so there is no backend payment-verify hook here.
2. Those two use a **time-driven trigger**, not `onEdit`.
3. **Two** downstream events (`QualifiedLead`, `HighTicketPurchase`), not three.
4. Canonical key is **`purchase_event_id`** (col Q), not `lead_id` (col A is empty
   on organic traffic).
5. `country` is defaulted to `DEFAULT_COUNTRY` (`in`) — the sheet only stores a
   dial code, not an ISO country.
