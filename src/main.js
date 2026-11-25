// MintDesk UI — wires the verifier, Agent ID check, triage tickets and
// watchlist together. All state except the live verification lives in
// localStorage (keys below). No network call here ever writes on-chain.

import { verifyContract } from "./verifier.js";
import { verifyAgentId } from "./agentid.js";
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  demoTickets,
  manualTicket,
  ticketFromVerification,
} from "./triage.js";
import { isAddress } from "./bsc.js";
import { ensureKey, explainResult } from "./openrouter.js";

const TICKETS_KEY = "mintdesk.tickets.v1";
const WATCH_KEY = "mintdesk.watchlist.v1";

// Demo example only — Eaglee's own public handle/wallet, prefilled as a
// convenience example. It is not a credential and is never used silently:
// the check only runs when the user presses "Verify Agent ID".
const DEMO_HANDLE = "astrajingga0704";
const DEMO_WALLET = "0x822854cfDb5A8a8e57e62F0F2214D8d974D4B562";
const DEMO_CONTRACT = "0x5777c2f59c65003ddebb018517b09f7ba0691202"; // PIXIU

const $ = (id) => document.getElementById(id);

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

let tickets = load(TICKETS_KEY, null);
if (!tickets) {
  tickets = demoTickets();
  save(TICKETS_KEY, tickets);
}
let watchlist = load(WATCH_KEY, []);
let lastResult = null;

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));

// ---------- Verification ----------
$("verify-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const address = $("contract-input").value.trim();
  const btn = $("verify-btn");
  btn.disabled = true;
  $("verify-result").classList.add("hidden");
  try {
    const result = await verifyContract(address, (m) => {
      $("verify-status").textContent = m;
    });
    lastResult = result;
    renderResult(result);
    $("verify-status").textContent = "";
  } catch (err) {
    $("verify-status").innerHTML = `<span class="error">${esc(err.message || err)}</span>`;
  } finally {
    btn.disabled = false;
  }
});

$("verify-demo").addEventListener("click", () => {
  $("contract-input").value = DEMO_CONTRACT;
  $("verify-form").requestSubmit();
});

function renderResult({ facts, checks, riskScore, verdict }) {
  $("verify-result").classList.remove("hidden");
  const v = $("verdict");
  v.textContent = `${verdict} · ${riskScore}/100`;
  v.className = `verdict ${verdict}`;
  const fill = $("score-fill");
  fill.style.width = `${riskScore}%`;
  fill.className = verdict;
  $("score-text").textContent =
    verdict === "SAFE"
      ? "Low risk by these checks — still re-check right before minting."
      : verdict === "CAUTION"
        ? "Proceed only after the checklist items are cleared."
        : "High risk — do not mint until every failing check is understood.";
  const rows = [
    ["Address", facts.address],
    ["Name", facts.name ? `${facts.name} (${facts.symbol || "?"})` : "—"],
    ["totalSupply", facts.totalSupply ?? "—"],
    ["Owner", facts.owner || "—"],
    ["Owner is contract", String(facts.ownerIsContract)],
    ["Sourcify", `${facts.sourcifyStatus}${facts.verified ? " (verified)" : " (NOT verified)"}`],
    ["Risky functions", facts.riskyFunctions?.length ? facts.riskyFunctions.join(", ") : "none found"],
    ["Bytecode", facts.hasCode ? `${facts.bytecodeLength.toLocaleString()} bytes` : "none (EOA)"],
  ];
  $("facts-table").innerHTML = rows
    .map(([k, val]) => `<tr><td>${esc(k)}</td><td class="mono">${esc(val)}</td></tr>`)
    .join("");
  $("checks-table").innerHTML = checks
    .map(
      (c) =>
        `<tr><td><span class="pill ${c.status}">${c.status.toUpperCase()}</span></td><td>${esc(c.label)}<br><span style="color:var(--muted)">${esc(c.detail)}</span></td></tr>`,
    )
    .join("");
}

$("to-ticket-btn").addEventListener("click", () => {
  if (!lastResult) return;
  tickets.unshift(ticketFromVerification(lastResult));
  save(TICKETS_KEY, tickets);
  renderTickets();
  document.getElementById("triage").scrollIntoView({ behavior: "smooth" });
});

$("watch-add-btn").addEventListener("click", () => {
  if (!lastResult) return;
  const addr = lastResult.facts.address;
  if (!watchlist.some((w) => w.address.toLowerCase() === addr.toLowerCase())) {
    watchlist.unshift({
      address: addr,
      name: lastResult.facts.name || "",
      riskScore: lastResult.riskScore,
      verdict: lastResult.verdict,
      updatedAt: new Date().toISOString(),
    });
    save(WATCH_KEY, watchlist);
    renderWatchlist();
  }
});

// ---------- Explain with AI (OpenRouter) ----------
// Uses the visitor's own OpenRouter key (localStorage only, never in code).
$("explain-btn").addEventListener("click", async () => {
  if (!lastResult) return;
  const btn = $("explain-btn");
  const out = $("explain-out");
  btn.disabled = true;
  out.textContent = "Asking OpenRouter…";
  try {
    ensureKey();
    const { text } = await explainResult(lastResult);
    out.textContent = text;
  } catch (err) {
    out.innerHTML = `<span class="error">${esc(err.message || err)}</span>`;
  } finally {
    btn.disabled = false;
  }
});

// ---------- Agent ID ----------
$("agentid-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = $("agentid-btn");
  btn.disabled = true;
  $("agentid-result").textContent = "Checking registry…";
  try {
    const r = await verifyAgentId($("handle-input").value, $("wallet-input").value);
    $("agentid-result").innerHTML =
      `<span class="${r.verified ? "ok" : "error"}">${esc(r.detail)}</span>`;
  } catch (err) {
    $("agentid-result").innerHTML = `<span class="error">${esc(err.message || err)}</span>`;
  } finally {
    btn.disabled = false;
  }
});

$("agentid-demo").addEventListener("click", () => {
  $("handle-input").value = DEMO_HANDLE;
  $("wallet-input").value = DEMO_WALLET;
});

// ---------- Tickets ----------
function renderTickets() {
  const fp = $("filter-priority").value;
  const fs = $("filter-status").value;
  const list = tickets.filter(
    (t) => (!fp || t.priority === fp) && (!fs || t.status === fs),
  );
  $("ticket-list").innerHTML = list.length
    ? list.map(ticketHtml).join("")
    : `<p class="hint">No tickets match this filter.</p>`;
  // Wire up per-ticket controls after render.
  document.querySelectorAll("[data-act]").forEach((el) => {
    el.addEventListener("click", () => {
      const id = el.dataset.id;
      const act = el.dataset.act;
      const t = tickets.find((x) => x.id === id);
      if (!t) return;
      if (act === "delete") tickets = tickets.filter((x) => x.id !== id);
      if (act === "status") t.status = el.dataset.value;
      if (act === "toggle") {
        const i = Number(el.dataset.idx);
        t.checklist[i].done = !t.checklist[i].done;
      }
      if (act === "save-note") {
        t.notes = document.querySelector(`[data-note="${id}"]`).value;
      }
      save(TICKETS_KEY, tickets);
      renderTickets();
    });
  });
}

function ticketHtml(t) {
  const checks = t.checklist
    .map(
      (c, i) =>
        `<li class="${c.done ? "done" : ""}"><button type="button" class="small ghost" data-act="toggle" data-id="${esc(t.id)}" data-idx="${i}">${c.done ? "✓" : "○"}</button> ${esc(c.label)}</li>`,
    )
    .join("");
  const statusBtns = Object.keys(STATUS_LABELS)
    .map(
      (s) =>
        `<button type="button" class="small ${t.status === s ? "" : "ghost"}" data-act="status" data-id="${esc(t.id)}" data-value="${s}">${STATUS_LABELS[s]}</button>`,
    )
    .join("");
  return `<article class="ticket ${t.demo ? "demo" : ""}">
    <h3>${t.demo ? "🧪 " : ""}${esc(t.title)}</h3>
    <p class="meta">${PRIORITY_LABELS[t.priority]} · ${t.verdict ? `${t.verdict} ${t.riskScore}/100 · ` : ""}${esc(t.contract || "no contract")} · ${new Date(t.createdAt).toLocaleString()}</p>
    <ul class="checklist">${checks}</ul>
    <div>${statusBtns}
      <button type="button" class="small ghost" data-act="delete" data-id="${esc(t.id)}">Delete</button>
    </div>
    <label>Notes</label>
    <textarea rows="2" data-note="${esc(t.id)}">${esc(t.notes || "")}</textarea>
    <button type="button" class="small" data-act="save-note" data-id="${esc(t.id)}">Save notes</button>
  </article>`;
}

$("filter-priority").addEventListener("change", renderTickets);
$("filter-status").addEventListener("change", renderTickets);

$("manual-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const title = $("manual-title").value.trim();
  if (!title) return;
  const contract = $("manual-contract").value.trim();
  if (contract && !isAddress(contract)) {
    alert("Contract must be a valid 0x address (or leave it blank).");
    return;
  }
  tickets.unshift(
    manualTicket({
      title,
      contract,
      priority: $("manual-priority").value,
      notes: $("manual-notes").value,
    }),
  );
  save(TICKETS_KEY, tickets);
  e.target.reset();
  renderTickets();
});

// ---------- Watchlist ----------
function renderWatchlist() {
  $("watch-list").innerHTML = watchlist.length
    ? watchlist
        .map(
          (w) => `<div class="ticket">
            <h3>${esc(w.name || w.address)}</h3>
            <p class="meta mono">${esc(w.address)} · ${w.verdict} ${w.riskScore}/100 · updated ${new Date(w.updatedAt).toLocaleString()}</p>
            <button type="button" class="small" data-recheck="${esc(w.address)}">Re-check now</button>
            <button type="button" class="small ghost" data-unwatch="${esc(w.address)}">Remove</button>
          </div>`,
        )
        .join("")
    : `<p class="hint">Watchlist is empty. Verify a contract, then “Add to watchlist”.</p>`;
  document.querySelectorAll("[data-recheck]").forEach((el) => {
    el.addEventListener("click", async () => {
      el.disabled = true;
      el.textContent = "Checking…";
      try {
        const r = await verifyContract(el.dataset.recheck);
        const w = watchlist.find((x) => x.address.toLowerCase() === r.facts.address.toLowerCase());
        if (w) {
          w.riskScore = r.riskScore;
          w.verdict = r.verdict;
          w.name = r.facts.name || w.name;
          w.updatedAt = new Date().toISOString();
          save(WATCH_KEY, watchlist);
        }
      } catch (err) {
        alert(`Re-check failed: ${err.message || err}`);
      } finally {
        renderWatchlist();
      }
    });
  });
  document.querySelectorAll("[data-unwatch]").forEach((el) => {
    el.addEventListener("click", () => {
      watchlist = watchlist.filter(
        (x) => x.address.toLowerCase() !== el.dataset.unwatch.toLowerCase(),
      );
      save(WATCH_KEY, watchlist);
      renderWatchlist();
    });
  });
}

renderTickets();
renderWatchlist();
