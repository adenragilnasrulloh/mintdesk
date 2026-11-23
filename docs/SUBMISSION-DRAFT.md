# MintDesk — Kiroween 2026 Submission Draft (DO NOT SUBMIT YET)

Status: draft updated 23 Nov 2026 ~19:30 WIB. Repo pushed (remote
main a5ff421), live app VERIFIED at
https://adenragilnasrulloh.github.io/mintdesk/, demo video READY
(local file, not yet uploaded to YouTube). Still TODO: YouTube demo
link (upload by Eaglee), blog-post URL (optional). Nothing here has
been submitted to Devpost.

## Category
Frankenstein — stitch together a chimera of technologies into one app.

## Bonus prizes to tick
- Best Kiro Crew App ($1,000) — repo includes a Kiro Crew watch-agent
  definition (`.kiro/crew/watch-agent.md`).
- Bonus Blog Prize (2,000 Kiro credits, top 100) — publish a public blog
  post about Kiro + MintDesk during the submission period, add URL.
- Best Demo ($1,000) — no extra steps; all eligible submissions considered.
- NOT ticking: Best Startup (not a founder submission), Best Student
  (not a student), Best Ghost of Kiroween Past (did not register 2025),
  Social Blitz (optional; needs a public post starting with
  #KiroweenHackathon26 — X is suspended, LinkedIn/IG/TikTok possible).

## Title
MintDesk — Frankenstein Lab for BSC Mint Triage

## Tagline
One desk that stitches on-chain contract verification, Jira-style triage,
and a Kiro Crew watch agent — so a solo builder never mints blind.

## Description (Devpost text)
Solo builders chasing free mints on BNB Smart Chain juggle three tools
that never talk to each other: a block explorer to check a contract, a
spreadsheet to track what is safe, and a to-do list to remember what to
check next. MintDesk stitches them into one desk.

Paste a BSC contract address and MintDesk runs deterministic, read-only
checks live: bytecode presence, Sourcify source verification, owner
address and owner type, owner-controlled functions found in verified
source, totalSupply, name/symbol. Each check feeds a 0–100 risk score
with a SAFE / CAUTION / DANGEROUS verdict. A second check verifies an
Agent ID handle against the on-chain registry with a read-only
handleOf() call — no wallet connection, no signing, no transaction.

Every verification auto-creates a Jira-style triage ticket: priority
from the verdict, a checklist built from the failed checks, notes, and
status. A watchlist re-checks saved contracts. A Kiro Crew watch-agent
definition in the repo describes the agent that keeps the watchlist
fresh on a schedule.

Built with Kiro (spec-driven: requirements → design → tasks in
`.kiro/specs/mintdesk-mvp/`), steering docs, a test/build hook, and an
MCP config. The app is a static Vite site; all verification runs in
the browser against public BSC RPC endpoints and Sourcify.

## How Kiro was used (write-up for judges)
- Kiro CLI 3.5.0 installed and used from the terminal; spec-driven
  workflow: the MVP spec was written first
  (`.kiro/specs/mintdesk-mvp/requirements.md` in EARS notation,
  `design.md`, `tasks.md`), then implemented task by task.
- Steering docs (`.kiro/steering/product.md`, `tech.md`,
  `structure.md`) kept the build on-stack: Vite + vanilla JS, no
  backend, no secrets, read-only on-chain reads.
- Agent hook (`.kiro/hooks/run-tests.json`) runs `npm test` + build on
  save, so regressions are caught by the agent itself.
- MCP (`.kiro/settings/mcp.json`): a fetch-only MCP server, no
  credentials, extending Kiro with live BSC/Sourcify reads.
- Kiro Crew: `.kiro/crew/watch-agent.md` defines the watch agent
  (schedule, memory, read-only polling of the watchlist).
- What Kiro changed: the spec forced the risk rules to be written
  down before code existed, so the score is deterministic and
  testable — the smoke test asserts real live results (PIXIU 39
  CAUTION, KIJIN 44 CAUTION, EOA 100 DANGEROUS).

## Links
- Public GitHub repo: https://github.com/adenragilnasrulloh/mintdesk
  (public, main branch; `.kiro` at root, Apache-2.0 license.
  Remote main = a5ff421 as of 23 Nov — includes the demo video
  (f9211e9) and the Vite base fix for Pages.)
- Live app URL: https://adenragilnasrulloh.github.io/mintdesk/
  — VERIFIED LIVE 23 Nov: HTTP 200, title "MintDesk — Frankenstein
  Lab for BSC Mint Triage", JS + CSS assets 200.
- Demo video (<3 min, public YouTube): TODO — upload
  `demo-video.mp4` (local path below) to Eaglee's YouTube channel as
  Public, then paste the link here.
  - READY: `~/workspace/kiroween/mintdesk/demo-video.mp4` —
    105 s (1:45), 1920×1080, h264 + AAC, 5.7 MB. Recorded 23 Nov 2026
    from the production build served locally: live PIXIU verification
    (CAUTION 39/100), auto triage ticket + checklist/note/status,
    Agent ID `astrajingga0704` verified on-chain, watchlist re-check,
    and the real `.kiro` spec on the public GitHub repo. English
    voiceover, no music, no third-party trademarks.
  - Pushed to remote main 23 Nov (commit f9211e9).
- Blog post URL (Bonus Blog): TODO (optional)

## Deploy — DONE 23 Nov (GitHub Pages, gh-pages branch)
- Live: https://adenragilnasrulloh.github.io/mintdesk/ (HTTP 200
  verified 23 Nov; JS + CSS assets 200; title correct).
- Method: the built `dist/` (Vite, base `/mintdesk/`) is published
  on branch `gh-pages` (commit daf5ea6, built from main a5ff421);
  Pages source = gh-pages branch, path `/`, build_type legacy.
  Re-deploy after any app change by rebuilding and re-pushing the
  `gh-pages` branch (script: /tmp/push_gh_pages.py — not in repo).
- Blocker found 23 Nov: the GitHub API credential used from this VM
  has NO `workflow` scope, so `.github/workflows/pages.yml` CANNOT
  be pushed via the Data API (create-tree and Contents API both
  return 404 for paths under `.github/workflows/`), and plain HTTPS
  `git push` also fails ("Password authentication is not supported
  for Git operations"). The workflow file is kept locally at
  `.github/workflows/pages.yml` (untracked) — add it via the GitHub
  web UI (logged in as adenragilnasrulloh) if auto-deploy on push
  to main is wanted; until then, redeploy via the gh-pages branch.
- `firebase` CLI is NOT installed on this VM and no Firebase login
  is available here, so Firebase Hosting (the MintGuard route) would
  need Eaglee to install + log in with her Google account
  (takt9748) — not needed now that Pages is live.

## Pre-existing code disclosure
MintDesk is a new codebase written fresh for Kiroween 2026 (30 Oct–
4 Dec 2026 submission period). Verification *patterns* (RPC selectors,
Sourcify v2 shape, score thresholds) were learned from the author's
prior MintGuard verifier; no MintGuard source files were copied.
No other pre-existing code is incorporated beyond Vite and standard
libraries listed in package.json.
