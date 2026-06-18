/**
 * Sonali Badani CRM — Meta Conversions API engine (Apps Script).
 *
 * Bound to the "Sonali Badani CRM" Google Sheet. It fires FOUR server-side Meta
 * CAPI events for each lead:
 *
 *   AUTO (fired ~1 min after Pabbly adds the row, via a time-driven trigger):
 *     • Purchase  (standard)  — the tripwire sale, value = amount
 *     • sales     (custom)    — same sale, mirror signal, value = amount
 *
 *   MANUAL (fired the moment the sales team sets a dropdown to TRUE, via onEdit):
 *     • QualifiedLead     (custom) — no value
 *     • HighTicketPurchase(custom) — value = contracted_value
 *
 * Why a time trigger for the AUTO events: Pabbly writes the row through the
 * Sheets API, and installable onEdit does NOT reliably fire on programmatic
 * writes. A 1-minute poll that scans for un-fired rows is the robust pattern.
 * The MANUAL events come from a human picking a dropdown, so onEdit is reliable.
 *
 * Secrets (pixel id, token) live in Script Properties — never hardcoded.
 * Browser-side firing (Meta Pixel "PageView" + the _fbc/_fbp cookies that make
 * these server events high-EMQ) lives in the Next.js app, not here.
 *
 * Canonical unique key = purchase_event_id (col Q, the Razorpay pay_xxx id).
 * lead_id (col A) is intentionally NOT used as the key — it is empty for
 * organic / non-ad traffic.
 */

/* ============================================================
   Configuration
   ============================================================ */

const MAIN_SHEET_NAME_DEFAULT = 'Sheet1';
const ERROR_SHEET_NAME = '_Errors';
const COL_COUNT = 36;
const GRAPH_API_VERSION_DEFAULT = 'v21.0';
const MAX_RETRIES = 3;
const CURRENCY = 'INR';

// Column index map (1-indexed; A..AJ).
const COL = {
  // --- A..W: auto-filled by Pabbly (the 23 capture fields) ---
  LEAD_ID:            1,  // A
  CREATED_AT:         2,  // B
  FIRST_NAME:         3,  // C
  LAST_NAME:          4,  // D
  EMAIL:              5,  // E
  PHONE:              6,  // F
  CITY:               7,  // G
  COUNTRY_CODE:       8,  // H  (dial code, e.g. "91" — NOT ISO)
  FBC:                9,  // I
  FBP:                10, // J
  CLIENT_IP_ADDRESS:  11, // K
  CLIENT_USER_AGENT:  12, // L
  EXTERNAL_ID:        13, // M  (raw email; we hash it for CAPI)
  EVENT_SOURCE_URL:   14, // N
  AMOUNT:             15, // O
  IS_TEST:            16, // P
  PURCHASE_EVENT_ID:  17, // Q  ← canonical key (pay_xxx)
  UTM_SOURCE:         18, // R
  UTM_MEDIUM:         19, // S
  UTM_CAMPAIGN:       20, // T
  UTM_CONTENT:        21, // U
  UTM_TERM:           22, // V
  FBCLID:             23, // W

  // --- X..AA: AUTO events, written by Apps Script ---
  PURCHASE_CAPI_EVENT_ID: 24, // X
  PURCHASE_CAPI_SENT:     25, // Y
  SALES_CAPI_EVENT_ID:    26, // Z
  SALES_CAPI_SENT:        27, // AA

  // --- AB..AE: QualifiedLead (manual trigger) ---
  QUALIFIED_LEAD:         28, // AB  dropdown TRUE/FALSE (sales team)
  QUALIFIED_LEAD_TIME:    29, // AC  datetime (sales team)
  QL_CAPI_EVENT_ID:       30, // AD  Apps Script
  QL_CAPI_SENT:           31, // AE  Apps Script

  // --- AF..AJ: HighTicketPurchase (manual trigger) ---
  HIGH_TICKET:            32, // AF  dropdown TRUE/FALSE (sales team)
  CONTRACTED_VALUE:       33, // AG  number (sales team) — fill BEFORE setting TRUE
  HIGH_TICKET_TIME:       34, // AH  datetime (sales team)
  HT_CAPI_EVENT_ID:       35, // AI  Apps Script
  HT_CAPI_SENT:           36, // AJ  Apps Script
};

// AUTO events — fired together for every new paid row (time-driven).
const AUTO_EVENTS = [
  {
    eventName: 'Purchase',            // Meta STANDARD event
    eventIdCol: COL.PURCHASE_CAPI_EVENT_ID,
    sentCol: COL.PURCHASE_CAPI_SENT,
    eventIdSuffix: '',                // = purchase_event_id verbatim (pay_xxx)
    includeValue: true,
    valueCol: COL.AMOUNT,
  },
  {
    eventName: 'sales',               // CUSTOM event
    eventIdCol: COL.SALES_CAPI_EVENT_ID,
    sentCol: COL.SALES_CAPI_SENT,
    eventIdSuffix: 'sales',
    includeValue: true,
    valueCol: COL.AMOUNT,
  },
];

// MANUAL events — fired on a sales-team dropdown flip to TRUE (onEdit).
const MANUAL_EVENTS = {
  QUALIFIED_LEAD: {
    eventName: 'QualifiedLead',       // CUSTOM
    triggerCol: COL.QUALIFIED_LEAD,
    timeCol: COL.QUALIFIED_LEAD_TIME,
    eventIdCol: COL.QL_CAPI_EVENT_ID,
    sentCol: COL.QL_CAPI_SENT,
    eventIdSuffix: 'qualifiedlead',
    includeValue: false,
  },
  HIGH_TICKET: {
    eventName: 'HighTicketPurchase',  // CUSTOM
    triggerCol: COL.HIGH_TICKET,
    timeCol: COL.HIGH_TICKET_TIME,
    eventIdCol: COL.HT_CAPI_EVENT_ID,
    sentCol: COL.HT_CAPI_SENT,
    eventIdSuffix: 'htpurchase',
    includeValue: true,
    valueCol: COL.CONTRACTED_VALUE,
  },
};

/* ============================================================
   AUTO path — time-driven: fire Purchase + sales for new rows
   ============================================================ */

/**
 * Runs every minute (installed by setupTriggers). Scans the sheet for paid rows
 * whose Purchase/sales events have not been sent yet, and fires them. A lock
 * prevents overlapping runs from double-firing.
 */
function processNewRows() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30 * 1000)) {
    console.log('processNewRows: another run holds the lock, skipping');
    return;
  }
  try {
    const sheet = getMainSheet();
    if (!sheet) return;

    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return;

    const data = sheet.getRange(2, 1, lastRow - 1, COL_COUNT).getValues();
    let fired = 0;

    for (let i = 0; i < data.length; i++) {
      const row = i + 2;
      const rowData = data[i];

      // Gate: must be a real purchase (has the Razorpay id) and not a test order.
      const purchaseId = stringAt(rowData, COL.PURCHASE_EVENT_ID);
      if (!purchaseId) continue;
      if (isTruthy(stringAt(rowData, COL.IS_TEST)) && !getTestEventCode()) continue;

      for (const cfg of AUTO_EVENTS) {
        if (isTruthy(rowData[cfg.sentCol - 1])) continue; // already sent
        const ok = fireEvent(sheet, row, rowData, cfg);
        if (ok) fired++;
        // Re-read the row so the second AUTO event sees the freshly-stamped flag.
        rowData[cfg.sentCol - 1] = sheet.getRange(row, cfg.sentCol).getValue();
        Utilities.sleep(300);
      }
    }
    if (fired) console.log('processNewRows: fired ' + fired + ' auto event(s)');
  } catch (err) {
    console.error('processNewRows fatal: ' + err.message + '\n' + (err.stack || ''));
  } finally {
    lock.releaseLock();
  }
}

/* ============================================================
   MANUAL path — onEdit: fire QualifiedLead / HighTicketPurchase
   ============================================================ */

function onSheetEdit(e) {
  try {
    if (!e || !e.range) return;
    const sheet = e.range.getSheet();
    if (sheet.getName() !== getMainSheetName()) return;

    const row = e.range.getRow();
    if (row === 1) return;
    const col = e.range.getColumn();

    let cfg = null;
    for (const key of Object.keys(MANUAL_EVENTS)) {
      if (MANUAL_EVENTS[key].triggerCol === col) { cfg = MANUAL_EVENTS[key]; break; }
    }
    if (!cfg) return;
    if (!isTruthy(e.value)) return; // only on flip TO true

    const rowData = sheet.getRange(row, 1, 1, COL_COUNT).getValues()[0];
    if (isTruthy(rowData[cfg.sentCol - 1])) {
      console.log('Row ' + row + ': ' + cfg.eventName + ' already sent, skipping');
      return;
    }
    fireEvent(sheet, row, rowData, cfg);
  } catch (err) {
    console.error('onSheetEdit fatal: ' + err.message + '\n' + (err.stack || ''));
  }
}

/* ============================================================
   Real-time path — Web App doPost
   Pabbly pings this the instant it adds the row, so Purchase + sales
   fire in ~seconds instead of waiting for the 1-min poll. Reuses
   fireEvent(); the poll stays as a safety net. Protected by a shared
   secret (Script Property WEBAPP_SECRET) since Web App URLs are public.
   Expects: purchase_event_id + token (query params OR JSON body).
   ============================================================ */

function doPost(e) {
  try {
    const params = (e && e.parameter) || {};
    let body = {};
    if (e && e.postData && e.postData.contents) {
      try { body = JSON.parse(e.postData.contents); } catch (_) { body = {}; }
    }

    const secret = PropertiesService.getScriptProperties().getProperty('WEBAPP_SECRET') || '';
    const token = String(params.token || body.token || '');
    if (!secret || token !== secret) return jsonOut({ ok: false, error: 'unauthorized' });

    const purchaseId = String(params.purchase_event_id || body.purchase_event_id || '').trim();
    if (!purchaseId) return jsonOut({ ok: false, error: 'missing purchase_event_id' });

    const sheet = getMainSheet();
    if (!sheet) return jsonOut({ ok: false, error: 'sheet not found' });

    const lock = LockService.getScriptLock();
    lock.tryLock(30 * 1000);
    try {
      const row = findRowByPurchaseId_(sheet, purchaseId);
      if (!row) return jsonOut({ ok: false, error: 'row not found yet (poll will catch it)', purchase_event_id: purchaseId });

      const rowData = sheet.getRange(row, 1, 1, COL_COUNT).getValues()[0];
      if (isTruthy(stringAt(rowData, COL.IS_TEST)) && !getTestEventCode()) {
        return jsonOut({ ok: true, skipped: 'is_test', row: row });
      }

      const fired = [];
      for (const cfg of AUTO_EVENTS) {
        if (isTruthy(rowData[cfg.sentCol - 1])) continue;
        if (fireEvent(sheet, row, rowData, cfg)) fired.push(cfg.eventName);
        rowData[cfg.sentCol - 1] = sheet.getRange(row, cfg.sentCol).getValue();
      }
      return jsonOut({ ok: true, row: row, fired: fired });
    } finally {
      lock.releaseLock();
    }
  } catch (err) {
    return jsonOut({ ok: false, error: String((err && err.message) || err) });
  }
}

/** Browser health check: GET the /exec URL → {ok:true,...}. */
function doGet() {
  return jsonOut({ ok: true, service: 'sonali-crm-capi' });
}

/** Newest-first scan of the purchase_event_id column. Returns 1-indexed row, or 0. */
function findRowByPurchaseId_(sheet, purchaseId) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return 0;
  const ids = sheet.getRange(2, COL.PURCHASE_EVENT_ID, lastRow - 1, 1).getValues();
  for (let i = ids.length - 1; i >= 0; i--) {
    if (String(ids[i][0]).trim() === purchaseId) return i + 2;
  }
  return 0;
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/* ============================================================
   Core: build payload, POST to Meta, stamp the row
   ============================================================ */

function fireEvent(sheet, row, rowData, cfg) {
  const purchaseId = stringAt(rowData, COL.PURCHASE_EVENT_ID);
  const email = stringAt(rowData, COL.EMAIL);
  if (!purchaseId) { logError(row, cfg.eventName, 0, 'Missing purchase_event_id', 0); return false; }
  if (!email)      { logError(row, cfg.eventName, 0, 'Missing email', 0); return false; }

  // Deterministic event_id: <pay_xxx> or <pay_xxx>_<suffix>. Stable across retries.
  const eventId = cfg.eventIdSuffix ? purchaseId + '_' + cfg.eventIdSuffix : purchaseId;

  // event_time: prefer the sales-team time column (manual events); else created_at; else now.
  const eventTime = resolveEventTime(rowData, cfg);

  const userData = buildUserData(rowData);

  const customData = { currency: CURRENCY };
  if (cfg.includeValue) {
    const value = Number(rowData[cfg.valueCol - 1]);
    if (!isFinite(value) || value <= 0) {
      logError(row, cfg.eventName, 0, 'Invalid value in col ' + cfg.valueCol + ': "' + rowData[cfg.valueCol - 1] + '"', 0);
      return false;
    }
    customData.value = value;
  }
  copyIfPresent(customData, 'utm_source',   stringAt(rowData, COL.UTM_SOURCE));
  copyIfPresent(customData, 'utm_medium',   stringAt(rowData, COL.UTM_MEDIUM));
  copyIfPresent(customData, 'utm_campaign', stringAt(rowData, COL.UTM_CAMPAIGN));
  copyIfPresent(customData, 'utm_content',  stringAt(rowData, COL.UTM_CONTENT));
  copyIfPresent(customData, 'utm_term',     stringAt(rowData, COL.UTM_TERM));

  const eventSourceUrl =
    stringAt(rowData, COL.EVENT_SOURCE_URL) ||
    PropertiesService.getScriptProperties().getProperty('EVENT_SOURCE_URL_DEFAULT') || '';

  const eventBody = {
    event_name: cfg.eventName,
    event_time: eventTime,
    event_id: eventId,
    action_source: 'website',
    event_source_url: eventSourceUrl,
    user_data: userData,
    custom_data: customData,
  };

  const payload = { data: [eventBody] };
  const testCode = getTestEventCode();
  if (testCode) payload.test_event_code = testCode;

  const result = postToMetaCapi(payload);

  if (result.ok) {
    sheet.getRange(row, cfg.eventIdCol).setValue(eventId);
    sheet.getRange(row, cfg.sentCol).setValue('TRUE');
    console.log('Row ' + row + ' ' + cfg.eventName + ' OK | event_id=' + eventId
      + ' attempts=' + (result.retryCount + 1));
    return true;
  }
  logError(row, cfg.eventName, result.status, result.body, result.retryCount);
  return false;
}

/* ============================================================
   user_data — hashing + normalization (per Meta's spec)
   Hashed:    em, ph, fn, ln, ct, country, external_id
   Not hashed: fbc, fbp, client_ip_address, client_user_agent
   ============================================================ */

function buildUserData(rowData) {
  const out = {};

  const emailNorm = stringAt(rowData, COL.EMAIL).toLowerCase();
  if (emailNorm) {
    const emHash = sha256Hex(emailNorm);
    out.em = [emHash];
    out.external_id = [emHash]; // reinforce the email match (matches browser advanced-matching)
  }

  const phoneNorm = (digitsOf(stringAt(rowData, COL.COUNTRY_CODE)) + digitsOf(stringAt(rowData, COL.PHONE)));
  if (phoneNorm) out.ph = [sha256Hex(phoneNorm)];

  const fn = stringAt(rowData, COL.FIRST_NAME).toLowerCase();
  if (fn) out.fn = [sha256Hex(fn)];

  const ln = stringAt(rowData, COL.LAST_NAME).toLowerCase();
  if (ln) out.ln = [sha256Hex(ln)];

  const ct = stringAt(rowData, COL.CITY).toLowerCase().replace(/[^a-z]/g, '');
  if (ct) out.ct = [sha256Hex(ct)];

  // country ISO: the sheet only stores a dial code, so default to the configured
  // single-country value (India funnel → "in"). Override per-row by mapping a
  // real ISO column if you ever go multi-country.
  const country = (PropertiesService.getScriptProperties().getProperty('DEFAULT_COUNTRY') || 'in').toLowerCase();
  if (country) out.country = [sha256Hex(country)];

  // Raw, never hashed.
  copyRaw(out, 'fbc', stringAt(rowData, COL.FBC));
  copyRaw(out, 'fbp', stringAt(rowData, COL.FBP));
  copyRaw(out, 'client_ip_address', stringAt(rowData, COL.CLIENT_IP_ADDRESS));
  copyRaw(out, 'client_user_agent', stringAt(rowData, COL.CLIENT_USER_AGENT));

  return out;
}

/* ============================================================
   HTTP — POST to Meta with retry/backoff on 0/429/5xx
   ============================================================ */

function postToMetaCapi(payload) {
  const props = PropertiesService.getScriptProperties();
  const pixelId = props.getProperty('META_PIXEL_ID');
  const token = props.getProperty('META_CAPI_ACCESS_TOKEN');
  const apiVersion = props.getProperty('META_GRAPH_API_VERSION') || GRAPH_API_VERSION_DEFAULT;

  if (!pixelId || !token) {
    return { ok: false, status: 0, body: 'Missing META_PIXEL_ID or META_CAPI_ACCESS_TOKEN in Script Properties', retryCount: 0 };
  }

  const url = 'https://graph.facebook.com/' + apiVersion + '/' + pixelId + '/events'
    + '?access_token=' + encodeURIComponent(token);
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  };

  let lastStatus = 0, lastBody = '';
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    let status = 0, body = '';
    try {
      const res = UrlFetchApp.fetch(url, options);
      status = res.getResponseCode();
      body = res.getContentText();
    } catch (err) {
      status = 0; body = 'UrlFetchApp threw: ' + err.message;
    }
    lastStatus = status; lastBody = body;
    if (status >= 200 && status < 300) return { ok: true, status: status, body: body, retryCount: attempt };

    const retryable = (status === 0 || status === 429 || status >= 500);
    if (retryable && attempt < MAX_RETRIES - 1) { Utilities.sleep(Math.pow(2, attempt) * 1000); continue; }
    break;
  }
  return { ok: false, status: lastStatus, body: lastBody, retryCount: MAX_RETRIES };
}

/* ============================================================
   Error logging
   ============================================================ */

function logError(row, eventType, status, body, retryCount) {
  try {
    const ss = getSpreadsheet_();
    const errSheet = ss.getSheetByName(ERROR_SHEET_NAME);
    if (!errSheet) {
      console.error('Cannot log to _Errors: tab missing. Header: timestamp | row_number | event_type | http_status | response_body | retry_count');
      return;
    }
    const ts = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'Asia/Kolkata', "yyyy-MM-dd'T'HH:mm:ssXXX");
    const safeBody = (body == null ? '' : String(body)).substring(0, 500);
    errSheet.appendRow([ts, row, eventType, status, safeBody, retryCount]);
    console.warn('Row ' + row + ' ' + eventType + ' FAILED | status=' + status + ' | body=' + safeBody);
  } catch (err) {
    console.error('Failed to log to _Errors: ' + err.message);
  }
}

/* ============================================================
   Setup — run once after pasting the file in
   ============================================================ */

function setupTriggers() {
  const triggers = ScriptApp.getProjectTriggers();
  let removed = 0;
  for (const t of triggers) {
    const fn = t.getHandlerFunction();
    if (fn === 'onSheetEdit' || fn === 'processNewRows') { ScriptApp.deleteTrigger(t); removed++; }
  }
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  // Manual events — installable onEdit (sales-team dropdowns).
  ScriptApp.newTrigger('onSheetEdit').forSpreadsheet(ss).onEdit().create();
  // Auto events — time-driven poll (Pabbly inserts don't fire onEdit).
  ScriptApp.newTrigger('processNewRows').timeBased().everyMinutes(1).create();

  const msg = 'setupTriggers OK — removed ' + removed + ', installed onSheetEdit + processNewRows(1 min)';
  console.log(msg);
  SpreadsheetApp.getActive().toast(msg, 'Sonali CRM', 5);
}

/**
 * Recovery — re-fire any event whose flag is unset. AUTO events re-fire for any
 * paid row; MANUAL events re-fire only where the trigger dropdown is TRUE.
 * Meta dedupes by event_id within 48h, so replays are safe.
 */
function replayPendingEvents() {
  const sheet = getMainSheet();
  if (!sheet) return;
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;
  const data = sheet.getRange(2, 1, lastRow - 1, COL_COUNT).getValues();
  let replayed = 0;

  for (let i = 0; i < data.length; i++) {
    const row = i + 2;
    const rowData = data[i];
    if (!stringAt(rowData, COL.PURCHASE_EVENT_ID)) continue;

    for (const cfg of AUTO_EVENTS) {
      if (!isTruthy(rowData[cfg.sentCol - 1])) {
        if (fireEvent(sheet, row, rowData, cfg)) replayed++;
        rowData[cfg.sentCol - 1] = sheet.getRange(row, cfg.sentCol).getValue();
        Utilities.sleep(500);
      }
    }
    for (const key of Object.keys(MANUAL_EVENTS)) {
      const cfg = MANUAL_EVENTS[key];
      if (isTruthy(rowData[cfg.triggerCol - 1]) && !isTruthy(rowData[cfg.sentCol - 1])) {
        if (fireEvent(sheet, row, rowData, cfg)) replayed++;
        Utilities.sleep(500);
      }
    }
  }
  console.log('replayPendingEvents — replayed ' + replayed);
  SpreadsheetApp.getActive().toast('Replayed ' + replayed + ' event(s)', 'Sonali CRM', 5);
}

/* ============================================================
   Helpers
   ============================================================ */

function getMainSheetName() {
  return PropertiesService.getScriptProperties().getProperty('MAIN_SHEET_NAME') || MAIN_SHEET_NAME_DEFAULT;
}
/** Open the bound spreadsheet by id so it also works in the Web App (doPost)
 *  context, where getActiveSpreadsheet() is null. Falls back to the active
 *  spreadsheet for editor/trigger runs if SPREADSHEET_ID is not set. */
function getSpreadsheet_() {
  const id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  // Let openById errors (bad id / not-authorized scope) surface, so the caller
  // returns a precise message instead of a generic "sheet not found".
  if (id) return SpreadsheetApp.openById(id);
  return SpreadsheetApp.getActiveSpreadsheet();
}
function getMainSheet() {
  const ss = getSpreadsheet_();
  if (!ss) throw new Error('No spreadsheet. Set SPREADSHEET_ID in Script Properties (a Web App has no active spreadsheet).');
  const name = getMainSheetName();
  const sheet = ss.getSheetByName(name);
  if (!sheet) {
    const tabs = ss.getSheets().map(function (s) { return s.getName(); }).join(', ');
    throw new Error('Tab "' + name + '" not found. Tabs in this spreadsheet: [' + tabs + ']. If your CRM tab is not "Sheet1", set the MAIN_SHEET_NAME property.');
  }
  return sheet;
}
function getTestEventCode() {
  return PropertiesService.getScriptProperties().getProperty('META_TEST_EVENT_CODE') || '';
}
function resolveEventTime(rowData, cfg) {
  const candidates = [cfg.timeCol ? rowData[cfg.timeCol - 1] : null, rowData[COL.CREATED_AT - 1]];
  for (const c of candidates) {
    if (c instanceof Date && !isNaN(c.getTime())) return Math.floor(c.getTime() / 1000);
    if (typeof c === 'string' && c) { const d = new Date(c); if (!isNaN(d.getTime())) return Math.floor(d.getTime() / 1000); }
  }
  return Math.floor(Date.now() / 1000);
}
function isTruthy(v) { return v === true || v === 'TRUE' || v === 'True' || v === 'true'; }
function stringAt(rowData, col1) { const v = rowData[col1 - 1]; return (v == null) ? '' : String(v).trim(); }
function digitsOf(s) { return (s || '').replace(/\D/g, ''); }
function copyIfPresent(obj, key, value) { if (value) obj[key] = value; }
function copyRaw(obj, key, value) { if (value) obj[key] = value; }
function sha256Hex(value) {
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, value, Utilities.Charset.UTF_8);
  let hex = '';
  for (let i = 0; i < bytes.length; i++) { let b = bytes[i]; if (b < 0) b += 256; const h = b.toString(16); hex += (h.length === 1 ? '0' : '') + h; }
  return hex;
}
