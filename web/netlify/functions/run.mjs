// POST /api/run: background function (up to 15 minutes). Netlify answers the browser with 202
// immediately; this function then does the Claude calls and saves progress to Netlify Blobs,
// which the browser reads through /api/job.
import { parseRequest, runJob } from "../lib/run-job.mjs";
import { ask, describeError } from "../lib/claude.mjs";
import { readJob, writeJob, JOB_ID } from "../lib/jobs.mjs";
import { checkPassword } from "../lib/auth.mjs";

export default async (req) => {
  if (req.method !== "POST") return;
  let body;
  try { body = await req.json(); } catch { return; }
  const id = String(body?.jobId ?? "");
  if (!JOB_ID.test(id)) return;
  if (await readJob(id)) return; // never overwrite an existing job (e.g. on a retry)

  if (!checkPassword(body.password)) {
    await writeJob(id, { status: "error", code: "unauthorized", error: "Wrong or missing access password." });
    return;
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    await writeJob(id, { status: "error", code: "no_key", error: "ANTHROPIC_API_KEY isn't set in Netlify. See web/README.md." });
    return;
  }

  let request;
  try { request = parseRequest(body); }
  catch (err) { await writeJob(id, { status: "error", code: "bad_request", error: err.message }); return; }

  let last = { status: "running" };
  const save = async (state) => { last = state; await writeJob(id, state); };
  try {
    await runJob(request, { ask, save });
  } catch (err) {
    console.error(err);
    await writeJob(id, { ...last, status: "error", code: "failed", error: describeError(err) });
  }
};

export const config = { path: "/api/run", background: true };
