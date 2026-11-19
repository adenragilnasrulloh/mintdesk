# MintDesk — Product Steering

MintDesk is a solo-builder ops console for BSC free-mint triage. It stitches
three things that do not normally live together into one app (Frankenstein
category, Kiroween 2026):

1. **Deterministic BSC contract verification** — bytecode, name/symbol/
   totalSupply/owner, Sourcify source match, owner-controlled function scan,
   fixed 0–100 risk score, verdict SAFE / CAUTION / DANGEROUS.
2. **Jira-style triage tickets** — every verification becomes a ticket with
   priority (P0–P3), status (queue → investigating → ready / skipped / done),
   a checklist and notes. Tickets persist in localStorage.
3. **A Kiro Crew watch agent** — a crew spec (see `.kiro/crew/watch-agent.md`)
   that polls the watchlist and re-runs the same deterministic checks. It
   reads only; it never transacts.

## Who it is for

One person (Eaglee) juggling many free mints and claims on BSC, who needs
a verdict she can trust *before* minting — and a queue so nothing verified
gets forgotten.

## Non-goals

- No wallet connection, no signing, no transactions, no token/NFT sales.
- No price predictions, no rarity promises, no "guaranteed safe" claims.
  A SAFE verdict means "low risk by these checks", nothing more.
- No backend, no accounts, no secrets. All data lives in the browser.
