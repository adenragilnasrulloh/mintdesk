// Jira-style triage tickets for MintDesk.
// A ticket is what a verification *becomes*: a tracked piece of work with
// a priority, a status, and a checklist — instead of a verdict that gets
// forgotten. Tickets and the watchlist live in localStorage only; there
// is no server and no account.

export const PRIORITIES = ["P0", "P1", "P2", "P3"];
export const STATUSES = ["queue", "investigating", "ready", "skipped", "done"];

export const PRIORITY_LABELS = {
  P0: "P0 · Critical",
  P1: "P1 · High",
  P2: "P2 · Normal",
  P3: "P3 · Low",
};

export const STATUS_LABELS = {
  queue: "Queue",
  investigating: "Investigating",
  ready: "Ready to mint",
  skipped: "Skipped",
  done: "Done",
};

/** Map a verification verdict to a triage priority. */
export function priorityForVerdict(verdict) {
  if (verdict === "DANGEROUS") return "P0";
  if (verdict === "CAUTION") return "P1";
  return "P2";
}

function uid() {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 8)
  ).toUpperCase();
}

function checklistFor(result) {
  const items = [];
  const { facts, verdict } = result;
  if (!facts.verified) {
    items.push({ label: "Ask for / find verified source before minting", done: false });
  }
  if (facts.riskyFunctions?.length) {
    items.push({
      label: `Review owner functions: ${facts.riskyFunctions.join(", ")}`,
      done: false,
    });
  }
  if (facts.owner && !facts.ownerIsContract) {
    items.push({ label: "Check who holds the owner key (single EOA?)", done: false });
  }
  if (verdict === "DANGEROUS") {
    items.push({ label: "DO NOT mint until every check above is cleared", done: false });
  } else {
    items.push({ label: "Re-check on-chain facts right before minting", done: false });
  }
  return items;
}

/** Build a ticket from a verification result. */
export function ticketFromVerification(result) {
  const { facts, riskScore, verdict } = result;
  const title = facts.name
    ? `${facts.name} (${facts.symbol || "?"}) — ${verdict} ${riskScore}`
    : `Contract ${facts.address.slice(0, 10)}… — ${verdict} ${riskScore}`;
  return {
    id: uid(),
    title,
    contract: facts.address,
    verdict,
    riskScore,
    priority: priorityForVerdict(verdict),
    status: verdict === "DANGEROUS" ? "queue" : "investigating",
    createdAt: new Date().toISOString(),
    notes: `Auto-created from verification. Score ${riskScore}/100, verdict ${verdict}. Sourcify: ${facts.sourcifyStatus}. Owner: ${facts.owner || "unknown"}.`,
    checklist: checklistFor(result),
    demo: false,
  };
}

/** Build a manually entered ticket. */
export function manualTicket({ title, contract, priority = "P2", notes = "" }) {
  return {
    id: uid(),
    title: title.trim(),
    contract: (contract || "").trim(),
    verdict: null,
    riskScore: null,
    priority,
    status: "queue",
    createdAt: new Date().toISOString(),
    notes,
    checklist: [{ label: "Run a contract verification first", done: false }],
    demo: false,
  };
}

/** Three clearly-labelled demo tickets, seeded only on first run. */
export function demoTickets() {
  const now = new Date().toISOString();
  return [
    {
      id: "DEMO-1",
      title: "DEMO — PIXIU Agents (verified, low risk)",
      contract: "0x5777c2f59c65003ddebb018517b09f7ba0691202",
      verdict: "CAUTION",
      riskScore: 39,
      priority: "P1",
      status: "ready",
      createdAt: now,
      notes: "Demo ticket — example of a verified contract that still has owner powers to review.",
      checklist: [
        { label: "Review owner functions: mint, transferOwnership", done: true },
        { label: "Re-check on-chain facts right before minting", done: false },
      ],
      demo: true,
    },
    {
      id: "DEMO-2",
      title: "DEMO — Unverified drop (do not mint blind)",
      contract: "0x0000000000000000000000000000000000000000",
      verdict: "DANGEROUS",
      riskScore: 100,
      priority: "P0",
      status: "queue",
      createdAt: now,
      notes: "Demo ticket — placeholder address, shows how a no-code / unverified result becomes a P0.",
      checklist: [{ label: "DO NOT mint until every check above is cleared", done: false }],
      demo: true,
    },
    {
      id: "DEMO-3",
      title: "DEMO — KIJIN (verified, check rarity first)",
      contract: "0x625188954784D2f8c542FE8206050fF540Ae3B20",
      verdict: "CAUTION",
      riskScore: 39,
      priority: "P1",
      status: "investigating",
      createdAt: now,
      notes: "Demo ticket — example triage note for a verified free mint.",
      checklist: [{ label: "Re-check on-chain facts right before minting", done: false }],
      demo: true,
    },
  ];
}
