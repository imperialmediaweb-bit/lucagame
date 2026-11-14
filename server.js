// Server static minimal pentru Railway: servește fișierele jocului.
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, process.env.STATIC_DIR || '.');
const TYPES = { '.html':'text/html; charset=utf-8', '.js':'text/javascript', '.css':'text/css', '.json':'application/json',
  '.png':'image/png', '.jpg':'image/jpeg', '.svg':'image/svg+xml', '.glb':'model/gltf-binary', '.gltf':'model/gltf+json',
  '.mp3':'audio/mpeg', '.ogg':'audio/ogg', '.wasm':'application/wasm', '.env':'application/octet-stream' };
http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/health') { res.writeHead(200); return res.end('ok'); }
  if (p.endsWith('/')) p += 'index.html';
  const f = path.normalize(path.join(ROOT, p));
  if (!f.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
  fs.readFile(f, (err, data) => {
    if (err) { res.writeHead(404); return res.end('Nu există'); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(process.env.PORT || 3000, () => console.log('Insula lui Luca pornită pe portul', process.env.PORT || 3000));
