# Claude Code setup for this project

This folder pins the team's shared Claude Code toolchain so everyone works with
the same plugins and skills. Most of it is picked up automatically when you open
this repo in Claude Code; one piece is a global install you run once.

## What's here

- **`settings.json`** — enables the project plugins and declares the two
  external marketplaces. Claude Code reads this on open and will offer to install
  any plugin you don't have yet.
- **`skills/`** — 12 design/engineering skills vendored directly into the repo,
  so they're available immediately with no extra install:
  `impeccable`, `taste-skill`, `motion-framer`, `emil-design-eng`,
  `agent-browser`, and the `ui-ux-pro-max` bundle
  (`ui-ux-pro-max`, `design`, `design-system`, `ui-styling`, `brand`,
  `banner-design`, `slides`).

## Plugins (auto-prompted from `settings.json`)

| Plugin | Marketplace |
|--------|-------------|
| `superpowers` | `claude-plugins-official` |
| `frontend-design` | `claude-plugins-official` |
| `context-mode` | `mksglu/context-mode` |
| `claude-mem` | `thedotmack/claude-mem` |

If they don't auto-install, run from the repo root:

```bash
claude plugin install superpowers@claude-plugins-official --scope project
claude plugin install frontend-design@claude-plugins-official --scope project
claude plugin marketplace add mksglu/context-mode --scope project
claude plugin install context-mode@context-mode --scope project
claude plugin marketplace add thedotmack/claude-mem --scope project
claude plugin install claude-mem@thedotmack --scope project
```

## One global install (not in this repo)

**get-shit-done** (spec-driven workflow + 67 skills + hooks) installs to your
`~/.claude`, so it isn't committed here. Run it once per machine:

```bash
npx get-shit-done-cc --claude --global
```

## Notes

- `agent-browser` (visual QA / browser automation) needs its engine once per
  machine: `npm i -g agent-browser && agent-browser install`.
- `ui-ux-pro-max`'s live search CLI needs a `src/` payload not vendored here; its
  rules in `SKILL.md` work as a checklist regardless.
- Personal/local overrides go in `.claude/settings.local.json` (gitignored).
