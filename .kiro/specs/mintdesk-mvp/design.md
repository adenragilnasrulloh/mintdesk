# MintDesk MVP — Design

## Architecture

Static Vite app, vanilla JS modules, no framework, no backend.

```
index.html (shell)
  └─ src/main.js        UI wiring, localStorage, rendering
       ├─ src/verifier.js   verifyContract() — facts + checks + score
       ├─ src/agentid.js    verifyAgentId() — handleOf() registry read
       ├─ src/triage.js     ticket model + priority mapping + demo seed
       └─ src/bsc.js        shared RPC + ABI decode helpers
```

Separation of concerns: on-chain logic never lives in `main.js`, so the
same modules are imported by `test/smoke.mjs` and exercised in Node.

## Verification flow

1. Validate address format (regex) — reject early, no RPC call.
2. `eth_getCode` → hasCode / bytecode length.
3. Parallel `eth_call`s: `owner()`, `totalSupply()`, `name()`, `symbol()`
   (each individually `.catch(() => null)` so one failing call cannot
   kill the whole verification).
4. `eth_getCode(owner)` → ownerIsContract.
5. Sourcify v2 status; if verified, fetch sources and scan for risky
   owner-controlled functions (regex on `function <name>(`).
6. Fixed rule engine → score (clamped 0–100) → verdict thresholds.

## Agent ID flow

`handleOf(address)` on the registry, selector 0xc50a1514, ABI-encoded
address argument. Decode the returned dynamic string and compare
case-insensitively with the claimed handle (`.ai` suffix stripped).

## Triage model

Ticket: `{ id, title, contract, verdict, riskScore, priority, status,
createdAt, notes, checklist[{label, done}], demo }`. Priority mapping:
DANGEROUS → P0, CAUTION → P1, SAFE → P2. Checklist items are generated
from the verification result (unverified source, risky functions,
EOA owner, dangerous verdict). Storage: `localStorage`
(`mintdesk.tickets.v1`, `mintdesk.watchlist.v1`).

## Kiro Crew watch agent

Defined in `.kiro/crew/watch-agent.md`. It is a *specification* for a
crew agent: on a schedule it re-runs `verifyContract()` for each
watchlist entry, updates the stored score/verdict, and (only for a score
that crossed into DANGEROUS) creates a P0 ticket. It reads only and
never transacts; in the MVP the same re-check is available as a manual
button in the watchlist UI.

## UI

Dark "lab" theme, green accent, spooky-but-readable. Four sections:
verify → Agent ID → triage queue → watchlist. No copyrighted assets,
no music, no external fonts.
