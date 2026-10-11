// The storefront's routes, read from src/App.jsx, for the server (server.mjs): which addresses are real
// pages (anything else is a 404) and which are old addresses that redirect (answered with a real 301).
// `npm run build` writes dist/route-table.json with it; server.mjs falls back to reading App.jsx itself.
//   node tools/route-table.mjs            prints the table
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function readRouteTable(appFile = path.join(ROOT, 'src', 'App.jsx')) {
  const source = fs.readFileSync(appFile, 'utf8');
  const pages = [];
  const redirects = [];
  const paramRedirects = [];
  const routeRe = /<Route\s+path="([^"]+)"\s+element=\{([\s\S]*?)\}\s*\/>/g;
  for (const [, routePath, element] of source.matchAll(routeRe)) {
    if (routePath === '*') continue;
    const navigate = element.match(/^<Navigate\s+to="([^"]+)"/);
    if (navigate) redirects.push({ from: routePath, to: navigate[1] });
    else if (/^<ParamRedirect\b/.test(element)) paramRedirects.push(routePath);
    else pages.push(routePath);
  }
  if (pages.length < 10) throw new Error(`route-table: only ${pages.length} pages found in ${appFile}; has App.jsx changed shape?`);
  return { pages, redirects, paramRedirects };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const table = readRouteTable();
  const out = process.argv[2];
  if (out) {
    fs.writeFileSync(out, JSON.stringify(table, null, 1));
    console.log(`route-table: ${table.pages.length} pages, ${table.redirects.length} redirects → ${out}`);
  } else {
    console.log(JSON.stringify(table, null, 1));
  }
}
