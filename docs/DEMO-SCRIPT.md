# MintDesk — Demo Video Script (target 1:45–2:15, hard cap <3:00)

Narration in English (Devpost materials must be in English). Record
the screen at 1080p, show the app actually working — no slides-only
video. Reuse the MintGuard demo pattern (screen + voiceover).

## 0:00–0:15 — Problem
"Solo builders chasing free mints on BSC check a contract in one tab,
track safety in a spreadsheet, and remember next steps in their head.
MintDesk stitches all three into one desk."

## 0:15–0:50 — Verify a contract (live)
- Paste PIXIU `0x5777c2f59c65003ddebb018517b09f7ba0691202`, click Verify.
- Point at facts as they load: name, symbol, supply 613, owner,
  Sourcify perfect.
- "Score 39 — CAUTION. The contract is verified, but the owner is a
  single key with owner-controlled functions, so it lands in triage,
  not in the mint queue."

## 0:50–1:20 — Triage ticket (the Frankenstein stitch)
- Show the auto-created ticket: priority from the verdict, checklist
  built from the failed checks.
- Tick one checklist item, add a note, change status.
- "Verification becomes a ticket. Tickets become a queue. Nothing
  gets minted blind."

## 1:20–1:45 — Agent ID + watchlist
- Verify Agent ID `astrajingga0704` against the demo wallet — show
  "verified" from the on-chain registry, read-only, no signing.
- Add PIXIU to the watchlist, hit Re-check.

## 1:45–2:05 — How Kiro built it
- Quick scroll through `.kiro/specs/mintdesk-mvp/` (requirements,
  design, tasks), steering docs, hooks, and the Crew watch-agent
  definition. "Spec first, then code — that's why the score is
  deterministic and testable."

## 2:05–2:15 — Close
"MintDesk — verify before you mint. Built with Kiro for Kiroween 2026."
Show repo URL + live app URL on screen.

## Checklist before recording
- [ ] `npm run build` passes; serve `dist/` (vite preview) so the
  demo uses the production build.
- [ ] Live RPC reachable (PIXIU check returns 39 CAUTION in rehearsal).
- [ ] Clear demo tickets/watchlist first, so the recording starts clean
      (or use a fresh browser profile).
- [ ] No copyrighted music, no third-party trademarks on screen.
- [ ] Upload to YouTube as Public, keep the link for the Devpost form.
