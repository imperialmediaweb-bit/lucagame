// Server static pentru Railway: servește jocul construit (dist/), comprimat cu gzip.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { attachMultiplayer } from './mp-server.js';
import { handleApi } from './api.js';
import { db } from './db.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(here, process.env.STATIC_DIR || 'dist');
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml',
  '.glb': 'model/gltf-binary', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.wasm': 'application/wasm', '.ico': 'image/x-icon'
};
const COMPRESS = new Set(['.html', '.js', '.css', '.json', '.svg']);
const cache = new Map();

const server = http.createServer((req, res) => {
  let p = decodeURIComponent((req.url || '/').split('?')[0]);
  if (p === '/health') { res.writeHead(200); return res.end('ok'); }
  if (p.startsWith('/api/')) return handleApi(req, res, p);
  if (p.endsWith('/')) p += 'index.html';
  const f = path.normalize(path.join(ROOT, p));
  if (!f.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
  fs.readFile(f, (err, data) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); return res.end('Nu există'); }
    const ext = path.extname(f);
    const headers = {
      'Content-Type': TYPES[ext] || 'application/octet-stream',
      // fișierele din assets/ au hash în nume, deci pot sta mult în cache
      'Cache-Control': p.includes('/assets/') ? 'public, max-age=31536000, immutable' : 'no-cache'
    };
    if (COMPRESS.has(ext) && /\bgzip\b/.test(req.headers['accept-encoding'] || '')) {
      let gz = cache.get(f);
      if (!gz) { gz = zlib.gzipSync(data, { level: 9 }); cache.set(f, gz); }
      headers['Content-Encoding'] = 'gzip';
      res.writeHead(200, headers);
      return res.end(gz);
    }
    res.writeHead(200, headers);
    res.end(data);
  });
});
attachMultiplayer(server);
db().then(() => console.log('Baza de date e gata')).catch((e) => console.error('Baza de date:', e.message));
server.listen(process.env.PORT || 3000, () => console.log('Insula lui Luca pornită pe portul', process.env.PORT || 3000));
