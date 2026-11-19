# MintDesk — Verification Log

## Build

- **Date:** 2026-11-19 ~21:39 WIB (14:39 UTC)
- **Kiro CLI:** 3.5.0 (`~/.local/bin/kiro-cli`, installed via
  `curl -fsSL https://cli.kiro.dev/install | bash`). No login performed —
  login is a manual step for the owner.
- **Node:** v24.22.1, npm 10.9.4
- **`npm install`:** 13 packages, exit 0.
- **`npm run build`:** exit 0, 8 modules, `dist/` produced in 505 ms.
- **Preview check:** `vite preview` serves HTTP 200, correct
  `<title>MintDesk — Frankenstein Lab for BSC Mint Triage</title>`.

## Smoke test (`npm test` → `node test/smoke.mjs`) — 2026-11-19T14:39:11Z

Live BSC RPC (bsc-dataseed1/2) + Sourcify v2. All 11 checks PASS.

| Case | Result |
|---|---|
| PIXIU `0x5777c2f59c65003ddebb018517b09f7ba0691202` | 貔貅 Agents (PIXIU), supply 613, owner `0x23f5cdd233925ea83369a495b95f825ed710fbaa`, Sourcify **perfect**, score **39**, verdict **CAUTION** |
| KIJIN `0x625188954784D2f8c542FE8206050fF540Ae3B20` | KIJIN (KIJIN), totalSupply unreadable (null), owner `0xe9a232aefaa230a38bc9fec961eea19134903308`, Sourcify **perfect**, score **44**, verdict **CAUTION** |
| EOA (demo wallet) `0x822854cfDb5A8a8e57e62F0F2214D8d974D4B562` | no code, score **100**, verdict **DANGEROUS** |
| Invalid address `not-an-address` | Clean error: "Invalid BSC contract address (expected 0x followed by 40 hex characters)." — no RPC call |
| Agent ID `astrajingga0704` + demo wallet | **verified** — registry confirms the wallet owns `astrajingga0704.ai` |

Notes: KIJIN scores 44 (vs PIXIU 39) because its `totalSupply()` is not
readable (+5). Both are verified (perfect match) and CAUTION, driven
mainly by EOA owner (+15) plus owner-controlled functions found in
verified source. Scores are deterministic from the fixed rule engine in
`src/verifier.js`; re-running later may differ only if on-chain state
changes.
