// Vercel serverless entry point — delegates to the Express app in server/src.
// Vercel detects this file (root-level `api/` dir) and bundles it with the
// workspace deps from the root `package.json`.
export { default } from '../server/src/index.js';

