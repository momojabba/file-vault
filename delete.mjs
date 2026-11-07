import { getStore } from "@netlify/blobs";
import { validFolder, ID_RE } from "../lib/folder.mjs";

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });

export default async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid request" }, 400);
  }

  const { folder, id } = body ?? {};
  if (!validFolder(folder) || typeof id !== "string" || !ID_RE.test(id)) {
    return json({ error: "Invalid request" }, 400);
  }

  // Deleting removes the file and its name/size record together.
  await getStore({ name: "pages", consistency: "strong" }).delete(`${folder}/${id}`);
  return json({ ok: true });
};

export const config = { path: "/api/delete" };
