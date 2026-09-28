// Resolves every image URL the pages build (using each page's own TJM / CL
// base constants) and fetches it. Exit 1 if any is not an image.
import fs from 'node:fs';
const urls = new Map(); // url -> pages
for (const f of fs.readdirSync('src/pages').filter((f) => f.endsWith('.jsx'))) {
  const s = fs.readFileSync('src/pages/' + f, 'utf8');
  const bases = {};
  for (const m of s.matchAll(/\b(TJM|CL|B)\s*=\s*'([^']+)'/g)) bases[m[1]] = m[2];
  const add = (u) => { if (!urls.has(u)) urls.set(u, []); urls.get(u).push(f.replace('.jsx', '')); };
  for (const m of s.matchAll(/https?:\/\/[^\s"'`()<>]+?\.(?:jpe?g|webp|png|svg)(?:\?[^\s"'`()<>]*)?/gi)) add(m[0]);
  for (const m of s.matchAll(/\b(TJM|CL)\s*\+\s*'([^']+)'/g)) { if (!bases[m[1]]) throw new Error(`${f}: ${m[1]} used but not defined`); add(bases[m[1]] + m[2]); }
}
const bad = []; let ok = 0; const q = [...urls.keys()];
const worker = async () => {
  while (q.length) {
    const u = q.shift();
    try {
      const c = new AbortController(); const t = setTimeout(() => c.abort(), 25000);
      const r = await fetch(u, { signal: c.signal, headers: { 'User-Agent': 'Mozilla/5.0' } }); clearTimeout(t);
      const ct = r.headers.get('content-type') || '';
      if (r.ok && ct.startsWith('image/')) ok++; else bad.push(`${r.status} ${u}  (${urls.get(u).join(', ')})`);
      try { await r.arrayBuffer(); } catch {}
    } catch (e) { bad.push(`ERR ${u}  (${urls.get(u).join(', ')})`); }
  }
};
await Promise.all(Array.from({ length: 8 }, worker));
console.log('distinct image URLs:', urls.size, 'ok:', ok, 'bad:', bad.length);
for (const b of bad) console.log('  ', b);
process.exit(bad.length ? 1 : 0);
