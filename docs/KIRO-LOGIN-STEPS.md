# Kiro login — manual steps for Eaglee (Muse cannot do these)

Kiro CLI 3.5.0 is already installed on the VM at
`~/.local/bin/kiro-cli` (not yet on PATH — use the full path, or add
`export PATH="$HOME/.local/bin:$PATH"` to `~/.bashrc`).

## 1. Log in (pick ONE)
- On this VM, in a terminal: `~/.local/bin/kiro-cli login`
  (browser OAuth — needs a browser that can reach the sign-in page).
- Or device flow, if no browser is handy on the VM:
  `~/.local/bin/kiro-cli login --use-device-flow` — it prints a URL
  + one-time code; open the URL on your own device and enter the code.
- Sign in with your GitHub or Google account (or AWS Builder ID).
  That account becomes your Kiro account and gives you your Kiro
  user ID (needed for the credit form and for Devpost).
- Verify: `~/.local/bin/kiro-cli whoami` shows you are signed in.
- Find your Kiro user ID: see the guide linked from the Devpost
  Resources tab (kiro.dev — "how to find your Kiro user ID").

## 2. Join the hackathon (Devpost, your account)
- Open https://kiroween.devpost.com/ and click Join Hackathon.
  Your Devpost account is already active.
- No code, no repo needed to join — joining only registers you.

## 3. Credits: your call (deadline Wed 2 Dec 2026 03:00 WIB to request)
- Option A — request 4,000 free credits: fill the form on the
  Devpost Resources tab with your Kiro user ID + category
  (Frankenstein). It requires ID verification via Didit: a selfie +
  a photo of a government ID (KTP/passport). Your Devpost profile
  name must match the ID exactly. Review takes up to 48 business
  hours; redeem the code by Sat 5 Dec 05:00 WIB; redeemed credits
  expire 31 Dec 2026.
- Option B — skip credits: Kiro Free gives 50 credits/month, no ID
  check. The MVP is already built, so credits are only needed if
  we keep iterating heavily in Kiro.
- Credits are NOT required to enter or win.

## 4. Publish the repo (after you decide the repo name)
- Create a PUBLIC repo on GitHub (suggested name: `mintdesk` under
  adenragilnasrulloh), then push the local repo:
  `git remote add origin <repo-url>` + `git push -u origin main`.
- Check the repo page shows the `.kiro` folder at the root and a
  license in About. Do NOT add `.kiro` to .gitignore.
- Never commit secrets: there is no .env in this repo.
