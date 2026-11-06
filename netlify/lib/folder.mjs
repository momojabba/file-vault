// A folder is the first (and only) path segment of the site address, e.g. https://site.netlify.app/my-folder
// "_" is the main vault at the root address. "api" and "view" are used by the site itself.
export const FOLDER_RE = /^(_|[a-z0-9][a-z0-9_-]{0,63})$/;
const RESERVED = new Set(["api", "view"]);
export const validFolder = (f) => typeof f === "string" && FOLDER_RE.test(f) && !RESERVED.has(f);
export const ID_RE = /^[0-9a-f-]{36}$/;
