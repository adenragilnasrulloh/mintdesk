# MintDesk 🧪

A solo-builder ops console for Kiroween 2026 (Frankenstein category).
It stitches three incompatible things into one app:

1. **Deterministic BSC contract verification** — bytecode, name/symbol/
   totalSupply/owner, Sourcify source match, owner-controlled function
   scan, fixed 0–100 risk score, verdict SAFE / CAUTION / DANGEROUS.
2. **Jira-style triage tickets** — every verification becomes a ticket
   (priority P0–P3, status, checklist, notes), persisted in localStorage.
3. **A Kiro Crew watch agent** — a crew spec (`.kiro/crew/watch-agent.md`)
   that polls the watchlist and re-runs the same checks. Read-only; it
   never transacts.

**Read-only by design:** no wallet connection, no signing, no
transactions, no seed phrase / private key anywhere. All on-chain reads
use public BSC RPC endpoints and Sourcify.

## Run

```bash
npm install
npm run dev      # local dev server
npm run build    # production build → dist/
npm test         # Node smoke test (live BSC RPC + Sourcify)
```

## How Kiro was used

- **Spec-driven development:** requirements (EARS), design, and tasks in
  `.kiro/specs/mintdesk-mvp/`.
- **Steering docs:** product, tech, and structure in `.kiro/steering/`.
- **Hooks:** `.kiro/hooks/run-tests.json` runs `npm test && npm run build`
  on save.
- **MCP:** `.kiro/settings/mcp.json` — a fetch-only helper for read-only
  BSC/Sourcify lookups, no credentials.
- **Crew:** `.kiro/crew/watch-agent.md` defines the watch agent.
- **CLI:** Kiro CLI 3.5.0 installed on the build VM
  (`~/.local/bin/kiro-cli`); login is a manual step for the owner
  (device flow in her own browser).

## Disclosure

Built fresh for Kiroween 2026 (submission period 30 Oct – 4 Dec 2026).
Verification *patterns* (RPC selectors, Sourcify v2, score thresholds)
were inspired by the author's earlier MintGuard project — no MintGuard
code was copied; every file here was written new for MintDesk. The demo
example (Agent ID `astrajingga0704`, wallet
`0x822854cfDb5A8a8e57e62F0F2214D8d974D4B562`, PIXIU contract) is public
on-chain data used as a prefilled example only, not a credential.

## License

Apache-2.0 — see `LICENSE`.
