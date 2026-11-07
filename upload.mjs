import { getStore } from "@netlify/blobs";
import { validFolder } from "../lib/folder.mjs";

const MAX_BYTES = 5 * 1024 * 1024; // Netlify Functions cap request bodies at ~6 MB

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export default async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let form;
  try {
    form = await req.formData();
  } catch {
    return json({ error: "Upload could not be read" }, 400);
  }

  const file = form.get("file");
  if (!file || typeof file === "string") return json({ error: "No file received" }, 400);
  if (file.size > MAX_BYTES) return json({ error: "File is larger than 5 MB" }, 413);

  const folder = form.get("folder");
  if (!validFolder(folder)) return json({ error: "Invalid folder" }, 400);

  const encrypted = form.get("encrypted") === "1";
  const id = crypto.randomUUID();

  await getStore({ name: "pages", consistency: "strong" }).set(`${folder}/${id}`, await file.arrayBuffer(), {
    metadata: {
      name: file.name.slice(0, 200),
      size: file.size,
      uploadedAt: new Date().toISOString(),
      encrypted,
    },
  });

  return json({ id });
};

export const config = { path: "/api/upload" };
