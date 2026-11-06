import { getStore } from "@netlify/blobs";
import { validFolder, ID_RE } from "../lib/folder.mjs";

// "sandbox" = runs as a page under a CSP sandbox, "view" = safe for the browser to display,
// anything else is sent as a download. Keep in sync with the table in index.html.
const TYPES = {};
const add = (mime, mode, exts) => exts.split(" ").forEach((e) => (TYPES[e] = [mime, mode]));
add("text/html", "sandbox", "html htm xhtml");
add("image/svg+xml", "sandbox", "svg");
add("application/pdf", "view", "pdf");
add("image/png", "view", "png");
add("image/jpeg", "view", "jpg jpeg");
add("image/gif", "view", "gif");
add("image/webp", "view", "webp");
add("image/avif", "view", "avif");
add("image/bmp", "view", "bmp");
add("image/x-icon", "view", "ico");
add("text/plain;charset=utf-8", "view", "txt md csv tsv log json xml css js mjs ts yaml yml ini");
add("audio/mpeg", "view", "mp3");
add("audio/wav", "view", "wav");
add("audio/ogg", "view", "ogg");
add("audio/mp4", "view", "m4a");
add("video/mp4", "view", "mp4");
add("video/webm", "view", "webm");

export default async (req, context) => {
  const { folder, id } = context.params;
  if (!validFolder(folder) || !ID_RE.test(id)) return new Response("Not found", { status: 404 });

  const entry = await getStore("pages").getWithMetadata(`${folder}/${id}`, { type: "arrayBuffer" });
  if (!entry) return new Response("Not found", { status: 404 });

  const name = entry.metadata?.name ?? "file";

  // Encrypted files are returned as ciphertext. The browser decrypts them after the viewer
  // enters the password; the server never sees the password or the plaintext.
  if (entry.metadata?.encrypted) {
    return new Response(entry.data, {
      headers: { "Content-Type": "application/octet-stream", "Cache-Control": "no-store" },
    });
  }

  const ext = (name.split(".").pop() || "").toLowerCase();
  const [mime, mode] = TYPES[ext] ?? ["application/octet-stream", "download"];
  const headers = { "Content-Type": mime, "X-Content-Type-Options": "nosniff" };

  if (mode === "sandbox") {
    // No allow-same-origin: the page can run its own scripts but cannot touch this site.
    headers["Content-Security-Policy"] = "sandbox allow-scripts allow-forms allow-popups allow-modals";
  }
  if (mode === "download") {
    headers["Content-Disposition"] = `attachment; filename*=UTF-8''${encodeURIComponent(name)}`;
  }

  return new Response(entry.data, { headers });
};

export const config = { path: "/view/:folder/:id" };
