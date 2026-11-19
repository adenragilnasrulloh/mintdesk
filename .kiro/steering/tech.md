# MintDesk — Tech Steering

- **Stack:** Vite 6 + vanilla JavaScript (ES modules), static single-page
  app. No framework, no backend, no database.
- **Run:** `npm install`, `npm run dev` (local), `npm run build` (→ `dist/`),
  `npm test` (Node smoke test, no browser needed).
- **On-chain reads only:** public BSC RPC endpoints
  (`bsc-dataseed1` / `bsc-dataseed2`), 15s timeout per endpoint, fail over
  to the next endpoint. Sourcify v2 API for source verification
  (`https://sourcify.dev/server/v2/contract/56/<address>`).
- **Function selectors** (first 4 bytes of keccak256):
  `owner()` 0x8da5cb5b, `totalSupply()` 0x18160ddd, `name()` 0x06fdde03,
  `symbol()` 0x95d89b41, Agent ID `handleOf(address)` 0xc50a1514.
- **Scoring:** fixed rule engine in `src/verifier.js`. Thresholds:
  SAFE < 35, CAUTION 35–69, DANGEROUS ≥ 70. Never tune the score to flatter
  a result; if a rule is wrong, change the rule and its test together.
- **State:** `localStorage` keys `mintdesk.tickets.v1` and
  `mintdesk.watchlist.v1`. Demo tickets are seeded once and labelled DEMO.
- **Security rules (hard):** never request, log, or store a seed phrase,
  private key, or keystore. Never add a wallet connect button. Every
  network call is a read (`eth_getCode`, `eth_call`, HTTPS GET).
- **Kiro usage:** spec-driven development — requirements/design/tasks live
  in `.kiro/specs/mintdesk-mvp/`; steering docs in `.kiro/steering/`;
  the watch agent is defined in `.kiro/crew/watch-agent.md`; the hook in
  `.kiro/hooks/run-tests.json` runs build+test on save; MCP is configured
  in `.kiro/settings/mcp.json` (fetch helper only, no credentials).
