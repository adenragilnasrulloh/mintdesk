# MintDesk — Structure Steering

```
mintdesk/
├── index.html            # App shell: verify / Agent ID / triage / watchlist
├── package.json          # vite, scripts: dev / build / test
├── vite.config.js
├── README.md
├── LICENSE               # Apache-2.0
├── VERIFICATION.md       # Dated smoke-test results (updated per test run)
├── .gitignore            # node_modules, dist — NEVER .kiro
├── src/
│   ├── main.js           # UI wiring only (no on-chain logic)
│   ├── bsc.js            # Shared read-only RPC + ABI decode helpers
│   ├── verifier.js       # Deterministic contract verification + scoring
│   ├── agentid.js        # Agent ID handleOf() check (read-only)
│   ├── triage.js         # Ticket model, priorities, demo seed data
│   └── styles.css        # Dark lab UI, green accent
├── test/
│   └── smoke.mjs         # Node smoke test (PIXIU, KIJIN, EOA, invalid)
└── .kiro/
    ├── steering/         # product.md, tech.md, structure.md (this file)
    ├── specs/mintdesk-mvp/
    │   ├── requirements.md
    │   ├── design.md
    │   └── tasks.md
    ├── hooks/run-tests.json
    ├── settings/mcp.json
    └── crew/watch-agent.md
```

Rules:
- On-chain logic lives only in `src/verifier.js` / `src/agentid.js` /
  `src/bsc.js` — never inside `main.js`.
- `main.js` may only call those modules and render results.
- `test/smoke.mjs` imports the same modules the browser uses, so a
  passing smoke test means the shipped logic was exercised.
- `.kiro/` is part of the repo and is never gitignored (Kiroween rules).
