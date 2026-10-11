// Runs after `vite build` (npm run build): writes what the storefront server (server.mjs) needs from the
// build into server-data/ (not dist/, so none of it is served as a file):
//   route-table.json  the pages and redirects of src/App.jsx (tools/route-table.mjs)
//   build-env.json    the API address the browser build talks to, so the server's image preloads match it
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv } from 'vite';
import { readRouteTable } from './route-table.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'server-data');
fs.mkdirSync(OUT, { recursive: true });

const table = readRouteTable();
fs.writeFileSync(path.join(OUT, 'route-table.json'), JSON.stringify(table, null, 1));
const env = { ...loadEnv('production', ROOT, 'VITE_'), ...process.env };
fs.writeFileSync(path.join(OUT, 'build-env.json'), JSON.stringify({ apiUrl: env.VITE_API_URL || '' }, null, 1));
console.log(`postbuild: ${table.pages.length} pages, ${table.redirects.length} redirects; API ${env.VITE_API_URL || '(relative)'}`);
