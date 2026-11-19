// Shared read-only BSC helpers for MintDesk.
// Everything here is a plain JSON-RPC / HTTPS read. No wallet connection,
// no signing, no transactions — MintDesk never sends anything on-chain.

export const BSC_CHAIN_ID = 56;

export const RPC_ENDPOINTS = [
  "https://bsc-dataseed1.bnbchain.org",
  "https://bsc-dataseed2.bnbchain.org",
];

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
export const DEAD_ADDRESS = "0x000000000000000000000000000000000000dead";

export function isAddress(value) {
  return /^0x[0-9a-fA-F]{40}$/.test(String(value || "").trim());
}

/** POST one JSON-RPC call, trying each public endpoint in turn (15s cap each). */
export async function rpc(method, params) {
  let lastError = null;
  for (const url of RPC_ENDPOINTS) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
      const json = await res.json();
      if (json.error) throw new Error(json.error.message || "RPC error");
      return json.result;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError || new Error("All BSC RPC endpoints failed");
}

export async function getCode(address) {
  return rpc("eth_getCode", [address, "latest"]);
}

export async function ethCall(to, data) {
  return rpc("eth_call", [{ to, data }, "latest"]);
}

export function hasCode(code) {
  return Boolean(code && code !== "0x" && code.length > 2);
}

/** Decode a 32-byte word holding an address (right-aligned). */
export function wordToAddress(word) {
  if (!word || word === "0x" || word.length < 66) return null;
  return "0x" + word.slice(-40);
}

/** Decode a 32-byte word holding a uint256. Returns a BigInt or null. */
export function wordToUint(word) {
  if (!word || word === "0x") return null;
  try {
    return BigInt(word);
  } catch {
    return null;
  }
}

/** Decode an ABI-encoded dynamic string (offset + length + bytes). */
export function wordToString(hex) {
  if (!hex || hex === "0x" || hex.length < 130) return null;
  try {
    const len = Number(BigInt(`0x${hex.slice(66, 130)}`));
    const dataHex = hex.slice(130, 130 + len * 2);
    const bytes = new Uint8Array(
      dataHex.match(/../g).map((b) => parseInt(b, 16)),
    );
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}
