// Job state lives in Netlify Blobs so the background function and the status function can share it.
import { getStore } from "@netlify/blobs";

const store = () => getStore({ name: "expert-team-jobs", consistency: "strong" });
export const JOB_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const readJob = (id) => store().get(id, { type: "json" });
export const writeJob = (id, data) => store().setJSON(id, { ...data, updatedAt: new Date().toISOString() });
