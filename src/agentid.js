// Agent ID identity check for MintDesk — read-only, BSC.
// Verifies that a wallet owns a given Agent ID handle by calling
// handleOf(address) on the SPACE ID / Binance Agent ID HandleRegistry.
// The registry is the source of truth; no reverse hash math is needed
// in the browser. No wallet connection, no signing, no transaction.

import { ethCall, isAddress, wordToString } from "./bsc.js";

export const AGENT_ID_REGISTRY = "0x60B9262456dE011F7d15a54CdD8c48bAaa8B022F";
export const AGENT_ID_REGISTRY_BSCSCAN = `https://bscscan.com/address/${AGENT_ID_REGISTRY}`;

// handleOf(address) — first 4 bytes of keccak256("handleOf(address)").
const HANDLE_OF_SELECTOR = "0xc50a1514";

export function normalizeHandle(handle) {
  let h = String(handle || "").trim().toLowerCase();
  if (h.endsWith(".ai")) h = h.slice(0, -3);
  return h;
}

export function isValidHandle(handle) {
  return /^[a-z0-9][a-z0-9_-]{2,63}$/.test(normalizeHandle(handle));
}

/**
 * Verify that `walletAddress` owns Agent ID `handle`.
 * @returns {{ handle, walletAddress, registeredHandle, verified, status, detail }}
 * status: "verified" | "mismatch" | "no-agent-id" | "error"
 */
export async function verifyAgentId(handle, walletAddress) {
  const cleanHandle = normalizeHandle(handle);
  const wallet = String(walletAddress || "").trim();
  if (!isValidHandle(cleanHandle)) {
    throw new Error("Invalid Agent ID handle (e.g. astrajingga0704).");
  }
  if (!isAddress(wallet)) {
    throw new Error("Invalid wallet address (0x followed by 40 hex characters).");
  }

  const data =
    HANDLE_OF_SELECTOR + "000000000000000000000000" + wallet.slice(2).toLowerCase();
  let raw;
  try {
    raw = await ethCall(AGENT_ID_REGISTRY, data);
  } catch (err) {
    return {
      handle: cleanHandle,
      walletAddress: wallet,
      registeredHandle: "",
      verified: false,
      status: "error",
      detail: `Agent ID registry could not be reached: ${err.message || err}`,
    };
  }

  const registeredHandle = wordToString(raw) || "";
  if (!registeredHandle) {
    return {
      handle: cleanHandle,
      walletAddress: wallet,
      registeredHandle: "",
      verified: false,
      status: "no-agent-id",
      detail: `Wallet ${wallet} has no Agent ID registered on-chain.`,
    };
  }
  if (registeredHandle.toLowerCase() === cleanHandle) {
    return {
      handle: cleanHandle,
      walletAddress: wallet,
      registeredHandle,
      verified: true,
      status: "verified",
      detail: `Verified on-chain: wallet ${wallet} owns Agent ID ${registeredHandle}.ai (registry ${AGENT_ID_REGISTRY}).`,
    };
  }
  return {
    handle: cleanHandle,
    walletAddress: wallet,
    registeredHandle,
    verified: false,
    status: "mismatch",
    detail: `Wallet ${wallet} owns Agent ID ${registeredHandle}.ai, not ${cleanHandle}.ai — the claimed identity does not match the wallet.`,
  };
}
