# File Vault

Upload any file (up to 5 MB), list it, open it in a new window. Optional password encryption.

## Deploy
1. Push this folder to a Git repo and import it in Netlify (or run `npx netlify-cli deploy --prod`).
   Drag-and-drop deploys do not install function dependencies, so use Git or the CLI.
2. No configuration needed. Netlify Blobs is enabled automatically on deployed sites.

## Local test
    npm install
    npx netlify-cli dev

## Private folders
- The root address (`/`) is the main vault. Any single path after it is its own folder: `https://your-site.netlify.app/my-folder`.
- Folders are never listed anywhere. Only people who know the path can see the files, and they can also add files. The path works like a shared secret, so use a long random name (the **New private folder** button makes one) and encrypt anything sensitive.
- Names: 1 to 64 lowercase letters, numbers, dashes or underscores. `api` and `view` are reserved.
- Files uploaded with an earlier version of this project (before folders) are not shown.

## Removing files
Each file has a **Remove** button (click twice to confirm). Anyone who can open a folder can remove its files, so treat a folder's path like a shared password. You can also delete entries in the Netlify dashboard or with `netlify blobs:delete pages <folder>/<id>`.

Storage uses Netlify Blobs with strong consistency, so a file you remove or upload shows up in the list straight away.

## How file types are handled
- HTML and SVG open as pages inside a sandbox.
- PDFs, images, audio, video and plain-text types (txt, md, csv, json, ...) open in the browser.
- Everything else is downloaded. To change this, edit the type table in both `index.html` and `netlify/functions/view.mjs`.

## Notes
- Optional password encryption (AES-256-GCM, PBKDF2) happens in the browser before upload. The server stores only ciphertext. A forgotten password cannot be recovered. File names, sizes and times are not encrypted.
- Anyone with the URL can upload and view. Add Netlify password protection or an identity check before sharing publicly.
- HTML and SVG are served with a CSP sandbox (decrypted ones open inside a sandboxed iframe), so uploaded scripts cannot access this site's origin.
