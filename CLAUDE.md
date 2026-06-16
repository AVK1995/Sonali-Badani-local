# The One Partner Reset — working rules

## Self-review before handoff (agent-browser)

**Rule:** For any visual/UI change, do NOT tell the user "ready to review" until you
have looked at it yourself and are **>95% confident** it is correct and looks great.

The loop:
1. Make the change in localhost.
2. Use **agent-browser** to drive a real browser and capture screenshots at the
   viewports that matter — **desktop (≈1440px) and mobile (≈390px)** at minimum.
   Scroll to and capture every section you touched.
3. Review the screenshots yourself. Check: layout/alignment, spacing, palette
   fidelity (navy / coral / cream / gold only), image fit/crop, responsive
   behavior, text legibility, motion/reveal, no overflow or clipping.
4. If anything is below bar, fix and re-capture. **Iterate until you are >95%
   confident.**
5. Only then surface it to the user for review, and say what you verified.

agent-browser install (user-writable prefix, since `/usr/local` is not writable):
```bash
npm config set prefix ~/.npm-global
npm i -g agent-browser && export PATH="$HOME/.npm-global/bin:$PATH"
agent-browser install
agent-browser skills get core   # workflow reference
```

## Design constraints (locked)

- **Palette:** navy `#203F5C`, coral `#F59075` / coral-dark `#E5795C`, cream
  `#FBF7F1` page base, warm sand `#F8ECE0` (`.bg-warm`) for alternating sections,
  gold `#C2A36B` family for decorative flourishes only (sparkles, seals, hairlines).
  No new hues. Coral is the action colour; gold is never a CTA.
- **Type:** serif (`--font-serif`) for display headings/wordmark only; `font-body`
  (Gangjiem → humanist fallback) for everything else.
- **Copy:** no em dashes or en dashes in visible copy. Copy lives in `lib/content.ts`;
  do not change approved copy without being asked.
- **Photos:** frame real photography in our palette (rounded card, soft shadow,
  hairline ring, optional gold sparkle). Use `next/image`. Section/hero photos are
  3:2 (1536×1024) and sit in a `aspect-[3/2]` frame with no crop.
- **Motion:** CSS `.reveal` + IntersectionObserver, per-word `WordReveal`, Lenis
  smooth scroll. Respect `prefers-reduced-motion`.

## Project

Next.js 14 App Router + Tailwind + Framer Motion + Lenis. Landing + checkout funnel
for Sonali Badani's "The One Partner Reset". Run locally: `npm run dev`.
