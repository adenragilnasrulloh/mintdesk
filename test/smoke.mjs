// MintDesk Node smoke test — exercises the same verifier/agentid modules
// the browser uses, against live BSC RPC + Sourcify.
// Usage: npm test
// Exit 0 = all expectations met; non-zero = a check failed.

import { verifyContract } from "../src/verifier.js";
import { verifyAgentId } from "../src/agentid.js";

const PIXIU = "0x5777c2f59c65003ddebb018517b09f7ba0691202";
const KIJIN = "0x625188954784D2f8c542FE8206050fF540Ae3B20";
// Eaglee's wallet (an EOA, not a contract) — used as the no-code case.
const EOA = "0x822854cfDb5A8a8e57e62F0F2214D8d974D4B562";
const INVALID = "not-an-address";

let failures = 0;
const check = (label, ok, detail = "") => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures++;
};

const stamp = new Date().toISOString();
console.log(`MintDesk smoke test — ${stamp}\n`);

// 1. PIXIU — expect verified, CAUTION or SAFE, score < 70.
try {
  const r = await verifyContract(PIXIU);
  console.log(`  PIXIU: ${r.facts.name} (${r.facts.symbol}), supply=${r.facts.totalSupply}, owner=${r.facts.owner}, sourcify=${r.facts.sourcifyStatus}, score=${r.riskScore}, verdict=${r.verdict}`);
  check("PIXIU has bytecode", r.facts.hasCode === true);
  check("PIXIU source verified", r.facts.verified === true, `sourcify=${r.facts.sourcifyStatus}`);
  check("PIXIU verdict is not DANGEROUS", r.verdict !== "DANGEROUS", `score=${r.riskScore} verdict=${r.verdict}`);
} catch (err) {
  check("PIXIU verification runs", false, String(err.message || err));
}

// 2. KIJIN — expect verified.
try {
  const r = await verifyContract(KIJIN);
  console.log(`  KIJIN: ${r.facts.name} (${r.facts.symbol}), supply=${r.facts.totalSupply}, owner=${r.facts.owner}, sourcify=${r.facts.sourcifyStatus}, score=${r.riskScore}, verdict=${r.verdict}`);
  check("KIJIN has bytecode", r.facts.hasCode === true);
  check("KIJIN source verified", r.facts.verified === true, `sourcify=${r.facts.sourcifyStatus}`);
  check("KIJIN verdict is not DANGEROUS", r.verdict !== "DANGEROUS", `score=${r.riskScore} verdict=${r.verdict}`);
} catch (err) {
  check("KIJIN verification runs", false, String(err.message || err));
}

// 3. EOA — expect DANGEROUS, score 100, no code.
try {
  const r = await verifyContract(EOA);
  console.log(`  EOA: hasCode=${r.facts.hasCode}, score=${r.riskScore}, verdict=${r.verdict}`);
  check("EOA has no code", r.facts.hasCode === false);
  check("EOA verdict DANGEROUS / score 100", r.verdict === "DANGEROUS" && r.riskScore === 100, `score=${r.riskScore}`);
} catch (err) {
  check("EOA case returns a result (not a throw)", false, String(err.message || err));
}

// 4. Invalid address — expect a clean error, no RPC call.
try {
  await verifyContract(INVALID);
  check("Invalid address throws", false, "no error thrown");
} catch (err) {
  check("Invalid address throws a clean error", /Invalid BSC contract address/.test(err.message), err.message);
}

// 5. Agent ID — Eaglee's wallet owns astrajingga0704 (demo example).
try {
  const r = await verifyAgentId("astrajingga0704", EOA);
  console.log(`  Agent ID: status=${r.status}, registered=${r.registeredHandle}, verified=${r.verified}`);
  check("Agent ID astrajingga0704 verified for demo wallet", r.verified === true && r.status === "verified", r.detail);
} catch (err) {
  check("Agent ID check runs", false, String(err.message || err));
}

console.log(failures === 0 ? "\nAll smoke checks passed." : `\n${failures} smoke check(s) FAILED.`);
process.exit(failures === 0 ? 0 : 1);
