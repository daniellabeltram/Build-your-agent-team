// GET /api/job?id=<uuid>: returns a job's progress or result.
// GET /api/job: returns setup status (is a password required, is the API key configured).
import { readJob, JOB_ID } from "../lib/jobs.mjs";
import { passwordRequired } from "../lib/auth.mjs";

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

export default async (req) => {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return json({ ok: true, passwordRequired: passwordRequired(), keyConfigured: Boolean(process.env.ANTHROPIC_API_KEY) });
  if (!JOB_ID.test(id)) return json({ error: "Invalid job id" }, 400);
  const job = await readJob(id);
  return json(job ?? { status: "pending" });
};

export const config = { path: "/api/job" };
