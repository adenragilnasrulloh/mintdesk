# MintDesk MVP — Requirements (EARS style)

## Introduction

MintDesk is a solo-builder ops console for Kiroween 2026 (Frankenstein
category). It stitches deterministic BSC contract verification, Jira-style
triage tickets, and a Kiro Crew watch agent into one static web app. All
on-chain interaction is read-only.

## Glossary

- **Verification:** a deterministic, rule-based assessment of one BSC
  contract address, producing facts, checks, a 0–100 risk score and a
  verdict (SAFE / CAUTION / DANGEROUS).
- **Ticket:** a triage work item with priority, status, checklist, notes.
- **Watchlist:** a list of contract addresses to re-check later.

## Requirements

### Contract verification

- **REQ-1:** WHEN a user submits a BSC contract address, THE MintDesk
  verifier SHALL read on-chain bytecode (`eth_getCode`), `name()`,
  `symbol()`, `totalSupply()`, `owner()` via `eth_call`, and the Sourcify
  v2 source-match status, all read-only.
- **REQ-2:** WHEN the address has no bytecode, THE verifier SHALL report
  verdict DANGEROUS with score 100 and state that the address is an EOA.
- **REQ-3:** WHEN the submitted address is not a valid 0x + 40 hex address,
  THE verifier SHALL reject it with a clear error and make no RPC call.
- **REQ-4:** WHEN source is verified, THE verifier SHALL scan the verified
  source for owner-controlled functions (setBaseURI, setURI, withdraw,
  mint, pause, unpause, transferOwnership, renounceOwnership, setRoyalty,
  setMinter, blacklist) and list any found.
- **REQ-5:** THE risk score SHALL be computed by the fixed rule engine
  (no-code +100, unverified +50, owner EOA +15, owner contract +10,
  owner unreadable +5, each risky function +8 capped at +24, unreadable
  supply +5, unreadable name/symbol +5), clamped to 0–100.
- **REQ-6:** THE verdict SHALL be SAFE for score < 35, CAUTION for
  35–69, and DANGEROUS for ≥ 70.

### Agent ID verification

- **REQ-7:** WHEN a user submits a handle and a wallet address, THE
  Agent ID checker SHALL call `handleOf(address)` (selector 0xc50a1514)
  on registry 0x60B9262456dE011F7d15a54CdD8c48bAaa8B022F, read-only, and
  report verified / mismatch / no-agent-id / error.
- **REQ-8:** THE Agent ID checker SHALL NOT connect a wallet, sign, or
  transact.

### Triage tickets

- **REQ-9:** WHEN a verification completes, THE user SHALL be able to
  create a triage ticket from it, with priority derived from the verdict
  (DANGEROUS → P0, CAUTION → P1, SAFE → P2) and a checklist derived
  from the failing checks.
- **REQ-10:** THE user SHALL be able to create manual tickets, change a
  ticket's status and priority, toggle checklist items, edit notes, and
  delete tickets.
- **REQ-11:** Tickets SHALL persist in `localStorage` and survive reload.
- **REQ-12:** On first run only, THE app SHALL seed three tickets clearly
  labelled DEMO.

### Watchlist

- **REQ-13:** THE user SHALL be able to add a verified contract to the
  watchlist, re-run verification for any watchlist entry, and remove
  entries. The watchlist SHALL persist in `localStorage`.

### Safety and scope

- **REQ-14:** THE app SHALL NOT request, display, log, or store any seed
  phrase, private key, or keystore, and SHALL NOT include any wallet
  connect, sign, or send-transaction capability.
- **REQ-15:** THE app SHALL be a static site with no backend and no
  secrets (no `.env` file).
