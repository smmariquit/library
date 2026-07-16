# Cursor skills used on this project

Credits for what shaped this repo. Not a generic "built with AI" sticker.

## Skills that mattered

Links included so reviewers (or future you) can steal them.

### [Hallmark](https://github.com/Nutlope/hallmark) · UI design anti-slop

**What it is:** Nutlope's open-source design skill for Cursor / Claude Code / Codex. Fifty-seven slop-test gates for the stuff every LLM defaults to: purple-gradient heroes, Inter-everywhere, glow orbs, side-stripe cards, ALL-CAPS eyebrows, `transition: all`, the whole SaaS-template fingerprint.

**What it did here:** Drove the entire `chore/de-slop-frontend` branch ([PR #1](https://github.com/smmariquit/library/pull/1)):

- Removed decorative grid backgrounds and glow-orb atmospheres
- Flattened gradient fills on book cards (dropped the side-stripe gimmick)
- Killed all-caps eyebrow labels (`YOUR SHELF` → normal case)
- Reworked the landing hero and broke the stock three-column feature grid
- Tightened globals.css (~130 lines of decorative CSS gone)

Install: `npx skills add nutlope/hallmark`

### [no-ai-slop](https://github.com/realrossmanngroup/no_ai_slop_writing_rules) · Rossmann prose anti-slop

**What it is:** Louis Rossmann / realrossmanngroup's portable writing rules. Strips the statistical fingerprints of AI prose: puffery, "Furthermore", "It's important to note", dramatic headings, negative parallelism, fabricated vagueness.

**What it did here:** README, docs, email copy, and PR descriptions. Concrete facts over glaze. Service URLs with ports, explicit tradeoffs, no "paradigm shift" language in the setup guide.

Local skill path: `~/.cursor/skills/no-ai-slop/` (upstream: [realrossmanngroup/no_ai_slop_writing_rules](https://github.com/realrossmanngroup/no_ai_slop_writing_rules))

### fuck-slop · mechanical text de-slop pass

**What it is:** A local Agent Skill that scans prose with regex against a fixed tell catalog: "not X but Y", em-dash abuse, rule-of-three, puffery vocabulary. Then rewrites and re-scans in a loop until clean.

**What it did here:** Same territory as no-ai-slop, applied as a pass on user-facing copy. Hallmark catches the UI. Rossmann and fuck-slop catch the words.

Local skill path: `~/.agents/skills/fuck-slop/`

---

## Product sense

The spec asks for an app that gets out of the way: sign up, verify, upload, read, reset password, no guessing.

Concrete choices, not a philosophy essay:

- **Mailpit on the pending screens.** Verification and reset pages tell you where to click instead of failing silently or needing a dev API route.
- **Empty library state.** First visit explains what to do; not a blank grid.
- **Errors that name the problem.** Form and API failures surface as sentences, not `Error` or a spinner with no context.
- **Reader is boring on purpose.** Native PDF in an iframe. No fake toolbar chrome.
- **Dark mode that matches.** Same layout, not a second theme pasted on top.

Hallmark and the prose skills removed the template feel. The flows above are what make a stranger able to finish without someone standing next to them.

---

## Workspace rules

| Rule | What it blocks |
| --- | --- |
| **Lucide icons only** | Hand-drawn SVG paths (`<path d="…">`, long Bézier chains). Use [Lucide](https://lucide.dev) like the rest of the app. |
| **No em-dash slop** | Em dashes in prose (an AI tell). Use a period, comma, colon, or parentheses instead. |
| **Learning-first (`AGENTS.md`)** | Auth boundaries, schema split, user isolation as checklist items, not vibes. |

---

## Verification and tooling

| Tool / skill | Role on this project |
| --- | --- |
| **Spec compliance audit** | Line-by-line take-home check. Caught Next.js API routes before submission. |
| **`scripts/e2e-check.sh`** | 35 HTTP checks against the live Docker stack |
| **`scripts/ui-e2e/` (Playwright)** | 3 browser scenarios: login → PDF reader → signup verify → password reset |
| **Next.js / Better Auth guidance** | Frontend-only Next.js; auth isolated in Hono |

## Skipped

- Bugbot / Security Review (manual audit instead)
- CI / babysit (no GitHub Actions yet)
- Cloud deploy skills (local Docker only)

## Re-run verification

```sh
# HTTP (35 checks)
./scripts/e2e-check.sh

# Browser (3 Playwright scenarios)
cd scripts/ui-e2e && npm install && npx playwright install chromium && npm run walkthrough
```

Hallmark made it not look AI-generated. Rossmann and fuck-slop made it not read AI-generated. The checks above made sure it worked.
