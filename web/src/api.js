// Browser side of the job protocol. The browser never sees the API key: it starts a
// background function (POST /api/run) and polls for the result (GET /api/job?id=...).
const POLL_MS = 2500;
const MAX_WAIT_MS = 16 * 60 * 1000;      // background functions stop after 15 minutes
const START_GRACE_MS = 90 * 1000;        // if nothing is recorded by then, the job didn't start

export async function getSetup() {
  try {
    const r = await fetch("/api/job");
    if (!r.ok) throw new Error(String(r.status));
    return await r.json();
  } catch {
    return { ok: false };
  }
}

export async function runJob(payload, onProgress, signal) {
  const jobId = crypto.randomUUID();
  const res = await fetch("/api/run", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ...payload, jobId }),
    signal,
  });
  if (res.status !== 202 && !res.ok) throw new Error(`Couldn't start the request (HTTP ${res.status}).`);

  const started = Date.now();
  while (Date.now() - started < MAX_WAIT_MS) {
    await new Promise((r) => setTimeout(r, POLL_MS));
    if (signal?.aborted) throw new DOMException("Cancelled", "AbortError");
    const r = await fetch(`/api/job?id=${jobId}`, { signal, cache: "no-store" });
    if (!r.ok) continue;
    const job = await r.json();
    if (job.status === "pending") {
      if (Date.now() - started > START_GRACE_MS) throw new Error("The background function didn't start. Check the Netlify function logs.");
      continue;
    }
    onProgress?.(job);
    if (job.status === "done") return job;
    if (job.status === "error") {
      const err = new Error(job.error || "Something went wrong.");
      err.code = job.code;
      throw err;
    }
  }
  throw new Error("Timed out after 16 minutes.");
}
