# Kiro Crew — MintDesk Watch Agent

> Crew agent *definition* (code + docs only). This agent polls; it never
> transacts, never signs, never connects a wallet.

## Role

Watch the MintDesk watchlist (localStorage key `mintdesk.watchlist.v1`)
and re-run the deterministic verification for each entry on a schedule.

## Schedule

Every 6 hours while the hackathon submission period runs, plus on demand
when the user presses "Re-check now" in the UI (the MVP implements the
on-demand path; the scheduled path is this spec).

## Job (per watchlist entry)

1. Call `verifyContract(address)` from `src/verifier.js` (same module the
   browser uses — no duplicated logic).
2. Update the stored entry: `riskScore`, `verdict`, `name`, `updatedAt`.
3. If the new score crossed a threshold upward into DANGEROUS (was not
   DANGEROUS before), create a P0 ticket via `ticketFromVerification()`
   with the note "Watch agent: score crossed into DANGEROUS on re-check".
4. If the RPC or Sourcify call fails, record the failure on the entry
   and retry at the next run. Never delete an entry on failure.

## Guardrails (hard)

- Read-only: `eth_getCode`, `eth_call`, HTTPS GET to Sourcify only.
- No wallet connection, no private key, no seed phrase, no signing.
- No automatic minting, claiming, or any on-chain write — ever.
- No notifications to anyone except the local ticket queue.

## Kiro features used

- **Crew:** this agent definition, scheduled runs, shared memory of
  watchlist state across runs.
- **Specs:** requirements/design/tasks in `.kiro/specs/mintdesk-mvp/`.
- **Steering:** product/tech/structure docs in `.kiro/steering/`.
- **Hooks:** `run-tests.json` runs `npm test && npm run build` on save.
- **MCP:** `bsc-read` fetch helper (read-only, no credentials).
