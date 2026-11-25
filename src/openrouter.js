// OpenRouter client — MintDesk.
// Satu endpoint untuk ratusan model: POST https://openrouter.ai/api/v1/chat/completions
// (API kompatibel OpenAI). Model dipilih lewat slug, mis. "google/gemma-4-31b-it:free".
//
// PENTING: ini halaman statis publik (GitHub Pages), jadi API key TIDAK
// boleh ada di kode/repo. Key yang dipakai adalah key milik PENGUNJUNG
// sendiri, dimasukkan lewat prompt saat pertama kali dipakai dan disimpan
// hanya di localStorage browser pengunjung. Key tidak pernah dikirim ke
// mana pun selain OpenRouter.

const API_URL = "https://openrouter.ai/api/v1/chat/completions";
const KEY_STORAGE = "mintdesk.openrouter.apiKey";
const MODEL_STORAGE = "mintdesk.openrouter.model";
const DEFAULT_MODEL = "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free";

export function getStoredKey() {
  try {
    return localStorage.getItem(KEY_STORAGE) || "";
  } catch {
    return "";
  }
}

export function setStoredKey(key) {
  try {
    localStorage.setItem(KEY_STORAGE, key);
  } catch {
    // localStorage unavailable (private mode) — key just won't persist.
  }
}

// Call only from a click handler: prompts for the visitor's own key when
// none is stored yet. Returns "" when the visitor cancels.
export function ensureKey() {
  let key = getStoredKey();
  if (!key) {
    key =
      window.prompt(
        "Paste your OpenRouter API key (create one at openrouter.ai/keys). " +
          "It is stored only in this browser and sent only to OpenRouter:",
      ) || "";
    key = key.trim();
    if (key) setStoredKey(key);
  }
  return key;
}

export function storedModel() {
  try {
    return localStorage.getItem(MODEL_STORAGE) || DEFAULT_MODEL;
  } catch {
    return DEFAULT_MODEL;
  }
}

/**
 * One chat completion against OpenRouter, with error handling.
 * @param {Array<{role: string, content: string}>} messages
 * @param {{model?: string}} [opts] model slug override
 * @returns {Promise<{content: string, model: string|null, usage: object|null}>}
 */
export async function chatCompletion(messages, { model } = {}) {
  const apiKey = getStoredKey();
  if (!apiKey) {
    throw new Error(
      "No OpenRouter API key set. Click Explain again and paste your key (openrouter.ai/keys).",
    );
  }

  let res;
  try {
    res = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model: model || storedModel(), messages }),
    });
  } catch (e) {
    throw new Error(`OpenRouter request failed: ${e.message || e}`);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`OpenRouter request failed (HTTP ${res.status}): ${text.slice(0, 200)}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("OpenRouter returned no content.");
  }
  return { content: content.trim(), model: data.model || null, usage: data.usage || null };
}

/**
 * Explain one MintDesk verification result in plain language.
 * @param {{facts: object, checks: Array, riskScore: number, verdict: string}} result
 * @returns {Promise<{text: string, model: string|null}>}
 */
export async function explainResult(result) {
  const { facts, checks, riskScore, verdict } = result;
  const lines = [
    "You are MintDesk, a BSC free-mint triage assistant. Explain this verification result to a non-technical minter in plain English, max 5 sentences. Say clearly whether minting looks safe, risky, or dangerous, and name the single most important reason. Never invent facts beyond what is listed.",
    "",
    `Contract: ${facts.address} (BSC chain 56)`,
    `Name/symbol: ${facts.name || "?"} (${facts.symbol || "?"})`,
    `Bytecode present: ${facts.hasCode ? `yes (${facts.bytecodeLength} bytes)` : "NO — EOA, not a contract"}`,
    `Source verified (Sourcify): ${facts.verified ? `yes (${facts.sourcifyStatus})` : "NO"}`,
    `Owner: ${facts.owner || "unknown"}`,
    `Risky functions: ${facts.riskyFunctions?.length ? facts.riskyFunctions.join(", ") : "none found"}`,
    `Deterministic verdict: ${verdict}, risk score ${riskScore}/100`,
    `Checks: ${checks.map((c) => `[${c.status}] ${c.label}`).join("; ")}`,
  ];
  const { content, model } = await chatCompletion([
    { role: "user", content: lines.join("\n") },
  ]);
  return { text: content, model };
}
