// Deterministic BSC contract verification for MintDesk.
// Pure facts + a fixed rule engine. No AI, no guessing, no wallet.
// A contract is judged only on what is actually on-chain: bytecode,
// Sourcify source match, owner model, and owner-controlled functions.
//
// Scoring (0-100, higher = riskier):
//   no bytecode ............ +100 (it is an EOA, not a contract)
//   source not verified ..... +50
//   owner is an EOA ......... +15   owner is a contract .. +10
//   owner() unreadable ...... +5
//   each dangerous fn ....... +8 (capped at +24)
//   totalSupply unreadable .. +5   name/symbol unreadable .. +5
// Verdict: SAFE < 35, CAUTION 35-69, DANGEROUS >= 70.

import {
  BSC_CHAIN_ID,
  DEAD_ADDRESS,
  ZERO_ADDRESS,
  ethCall,
  getCode,
  hasCode,
  isAddress,
  wordToAddress,
  wordToString,
  wordToUint,
} from "./bsc.js";

// First 4 bytes of keccak256 of each function signature.
const SEL = {
  owner: "0x8da5cb5b",
  totalSupply: "0x18160ddd",
  name: "0x06fdde03",
  symbol: "0x95d89b41",
};

// Owner-controlled functions that commonly enable rug / freeze / drain
// behaviour when they exist in verified source. Presence alone is not
// proof of malice — it raises the score and lands on the ticket checklist.
export const RISKY_FUNCTIONS = [
  "setBaseURI",
  "setURI",
  "withdraw",
  "mint",
  "pause",
  "unpause",
  "transferOwnership",
  "renounceOwnership",
  "setRoyalty",
  "setMinter",
  "blacklist",
];

async function sourcifyMatch(address) {
  const res = await fetch(
    `https://sourcify.dev/server/v2/contract/56/${address}`,
  );
  if (res.status === 404) return "false";
  if (!res.ok) throw new Error(`Sourcify HTTP ${res.status}`);
  const json = await res.json();
  const match = json?.match || json?.runtimeMatch || null;
  if (!match) return "false";
  if (match === "exact_match" || match === "perfect") return "perfect";
  if (match === "partial_match" || match === "partial") return "partial";
  return match;
}

async function sourcifySourceText(address) {
  const res = await fetch(
    `https://sourcify.dev/server/v2/contract/56/${address}?fields=sources`,
  );
  if (!res.ok) return null;
  const json = await res.json();
  const parts = [];
  const walk = (v) => {
    if (typeof v === "string") parts.push(v);
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === "object") Object.values(v).forEach(walk);
  };
  walk(json?.sources || {});
  return parts.join("\n");
}

function scanRiskyFunctions(source) {
  if (!source) return [];
  return RISKY_FUNCTIONS.filter((fn) =>
    new RegExp(`\\bfunction\\s+${fn}\\s*\\(`, "i").test(source),
  );
}

/**
 * Verify one BSC contract address, read-only.
 * @returns {{ facts, checks, riskScore, verdict }}
 * verdict: "SAFE" | "CAUTION" | "DANGEROUS"
 */
export async function verifyContract(address, onProgress) {
  if (!isAddress(address)) {
    throw new Error(
      "Invalid BSC contract address (expected 0x followed by 40 hex characters).",
    );
  }
  const checks = [];
  const facts = { address, chainId: BSC_CHAIN_ID };
  let score = 0;
  const add = (id, label, status, detail, points = 0) => {
    checks.push({ id, label, status, detail });
    score += points;
  };

  onProgress?.("Reading bytecode…");
  const code = await getCode(address);
  facts.hasCode = hasCode(code);
  facts.bytecodeLength = facts.hasCode ? (code.length - 2) / 2 : 0;

  onProgress?.("Calling name / symbol / supply / owner…");
  const [ownerRaw, supplyRaw, nameRaw, symbolRaw] = await Promise.all([
    ethCall(address, SEL.owner).catch(() => null),
    ethCall(address, SEL.totalSupply).catch(() => null),
    ethCall(address, SEL.name).catch(() => null),
    ethCall(address, SEL.symbol).catch(() => null),
  ]);
  facts.owner = wordToAddress(ownerRaw);
  const supply = wordToUint(supplyRaw);
  facts.totalSupply = supply === null ? null : supply.toString();
  facts.name = wordToString(nameRaw);
  facts.symbol = wordToString(symbolRaw);

  if (facts.owner) {
    const ownerCode = await getCode(facts.owner).catch(() => "0x");
    facts.ownerIsContract = hasCode(ownerCode);
  } else {
    facts.ownerIsContract = false;
  }

  onProgress?.("Checking Sourcify verification…");
  let match = "false";
  try {
    match = await sourcifyMatch(address);
  } catch (err) {
    facts.sourcifyError = String(err.message || err);
  }
  facts.sourcifyStatus = match;
  facts.verified = match === "perfect" || match === "partial";

  let riskyFunctions = [];
  if (facts.verified) {
    try {
      riskyFunctions = scanRiskyFunctions(await sourcifySourceText(address));
    } catch {
      // Source scan is best-effort; the verification status still stands.
    }
  }
  facts.riskyFunctions = riskyFunctions;

  // --- Rule engine ---
  if (!facts.hasCode) {
    add("code", "Bytecode present", "fail", "No code at this address — it is an EOA, not a contract.", 100);
  } else {
    add("code", "Bytecode present", "pass", `${facts.bytecodeLength.toLocaleString()} bytes of bytecode on-chain.`);
  }

  if (facts.verified) {
    add("sourcify", "Source verified (Sourcify)", "pass", `Match: ${match}. Source is public and matches deployed bytecode.`);
  } else {
    add("sourcify", "Source verified (Sourcify)", "fail", "Source NOT verified — contract logic cannot be audited.", 50);
  }

  if (!facts.owner) {
    add("owner", "Owner readable", "warn", "No owner() — ownership model unknown.", 5);
  } else if (
    facts.owner.toLowerCase() === ZERO_ADDRESS ||
    facts.owner.toLowerCase() === DEAD_ADDRESS
  ) {
    add("owner", "Owner address", "pass", `Owner is ${facts.owner} — ownership effectively renounced.`);
  } else if (facts.ownerIsContract) {
    add("owner", "Owner address", "warn", `Owner is a contract (${facts.owner}) — verify what controls it.`, 10);
  } else {
    add("owner", "Owner address", "warn", `Owner is an EOA (${facts.owner}) — one key holds owner powers.`, 15);
  }

  if (riskyFunctions.length > 0) {
    add("owner-fns", "Owner-controlled functions", "warn", `Found in verified source: ${riskyFunctions.join(", ")}.`, Math.min(riskyFunctions.length * 8, 24));
  } else if (facts.verified) {
    add("owner-fns", "Owner-controlled functions", "pass", "None of the commonly abused owner functions found in verified source.");
  } else {
    add("owner-fns", "Owner-controlled functions", "warn", "Cannot scan — source is not verified.");
  }

  if (facts.totalSupply === null) {
    add("supply", "totalSupply() readable", "warn", "totalSupply() not readable — non-standard token.", 5);
  } else if (facts.totalSupply === "0") {
    add("supply", "totalSupply()", "warn", "totalSupply is 0 — nothing minted yet.", 5);
  } else {
    add("supply", "totalSupply()", "pass", `${BigInt(facts.totalSupply).toLocaleString()} tokens minted.`);
  }

  if (facts.name && facts.symbol) {
    add("metadata", "name() / symbol()", "pass", `${facts.name} (${facts.symbol}).`);
  } else {
    add("metadata", "name() / symbol()", "warn", "name() or symbol() not readable.", 5);
  }

  score = Math.max(0, Math.min(100, score));
  const verdict = score >= 70 ? "DANGEROUS" : score >= 35 ? "CAUTION" : "SAFE";
  return { facts, checks, riskScore: score, verdict };
}
