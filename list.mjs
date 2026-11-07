import { getStore } from "@netlify/blobs";
import { validFolder } from "../lib/folder.mjs";

export default async (req) => {
  const folder = new URL(req.url).searchParams.get("folder");
  if (!validFolder(folder)) return new Response("Invalid folder", { status: 400 });

  const store = getStore({ name: "pages", consistency: "strong" });
  const prefix = folder + "/";
  const { blobs } = await store.list({ prefix });

  const items = await Promise.all(
    blobs.map(async ({ key }) => {
      const meta = (await store.getMetadata(key))?.metadata ?? {};
      return {
        id: key.slice(prefix.length),
        name: meta.name ?? key,
        size: meta.size ?? 0,
        uploadedAt: meta.uploadedAt ?? null,
        encrypted: !!meta.encrypted,
      };
    })
  );

  items.sort((a, b) => String(b.uploadedAt).localeCompare(String(a.uploadedAt)));

  return new Response(JSON.stringify(items), {
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
};

export const config = { path: "/api/list" };
