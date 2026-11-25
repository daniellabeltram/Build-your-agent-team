// Thin wrapper around the Anthropic SDK used by every function.
import Anthropic from "@anthropic-ai/sdk";

// Agent files name a brain (opus / sonnet / haiku); map it to a current model ID.
// Override in Netlify with MODEL_OPUS / MODEL_SONNET / MODEL_HAIKU if you want different versions.
export const MODEL_IDS = {
  opus: process.env.MODEL_OPUS || "claude-opus-5-5",
  sonnet: process.env.MODEL_SONNET || "claude-sonnet-5-5",
  haiku: process.env.MODEL_HAIKU || "claude-haiku-5-5",
};
// Reasoning effort per brain. Opus defaults to medium, so set it explicitly.
const EFFORT = { opus: "high", sonnet: "medium", haiku: "low" };
// Server-side refusal fallbacks are available on Opus 5.5 and Sonnet 5.5, not Haiku 5.5.
const FALLBACK_OK = new Set(["opus", "sonnet"]);

let client;
const getClient = () => (client ??= new Anthropic()); // reads ANTHROPIC_API_KEY from the environment

export const resolveModel = (brain) => MODEL_IDS[brain] || (String(brain).startsWith("claude-") ? brain : MODEL_IDS.sonnet);

/**
 * One Claude call. Streams under the hood (long prompts and answers) and returns the final text.
 * @returns {Promise<{text: string, model: string, usage: object, stopReason: string}>}
 */
export async function ask({ brain, system, messages, maxTokens = 16000, format }) {
  const model = resolveModel(brain);
  const params = {
    model,
    max_tokens: maxTokens,
    system,
    messages,
    thinking: { type: "adaptive" },
    output_config: { effort: EFFORT[brain] || "medium", ...(format ? { format } : {}) },
  };
  const useFallbacks = FALLBACK_OK.has(brain) && process.env.DISABLE_FALLBACKS !== "1";
  let message;
  try {
    message = useFallbacks
      ? await getClient().beta.messages.stream({ ...params, betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" }).finalMessage()
      : await getClient().messages.stream(params).finalMessage();
  } catch (err) {
    // If the fallback beta is rejected for this account, retry once without it.
    if (useFallbacks && err instanceof Anthropic.BadRequestError && /fallback/i.test(err.message)) {
      message = await getClient().messages.stream(params).finalMessage();
    } else {
      throw err;
    }
  }
  if (message.stop_reason === "refusal") {
    const why = message.stop_details?.explanation || message.stop_details?.category || "no details";
    throw new Error(`The model declined this request (${why}). Try rephrasing the question.`);
  }
  const text = message.content.filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
  return { text, model: message.model, usage: message.usage, stopReason: message.stop_reason };
}

/** Turns an SDK error into a short message that's safe to show in the browser. */
export function describeError(err) {
  if (err instanceof Anthropic.AuthenticationError) return "The Anthropic API key is missing or invalid. Check ANTHROPIC_API_KEY in Netlify.";
  if (err instanceof Anthropic.PermissionDeniedError) return "This API key doesn't have access to the requested model.";
  if (err instanceof Anthropic.NotFoundError) return "Model not found. Check the MODEL_* environment variables.";
  if (err instanceof Anthropic.RateLimitError) return "Rate limited by the Anthropic API. Wait a minute and try again.";
  if (err instanceof Anthropic.BadRequestError) return `The API rejected the request: ${err.message}`;
  if (err instanceof Anthropic.APIError) return `Anthropic API error ${err.status ?? ""}: ${err.message}`;
  return err?.message || String(err);
}
