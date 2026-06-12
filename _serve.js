const http = require('http');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const port = 8000;

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
  '.ico': 'image/x-icon',
};

// Resolve um caminho de URL para um arquivo real (imita "pretty URLs" da Netlify)
function resolve(urlPath) {
  let p = urlPath.replace(/\/+$/, ''); // tira barra final
  if (p === '') p = '/index.html';
  const candidates = [
    p,                       // caminho exato (ex.: /style.css)
    p + '.html',             // sem extensao  -> .html (ex.: /contato -> /contato.html)
    path.posix.join(p, 'index.html'), // pasta -> index.html
  ];
  for (const c of candidates) {
    const full = path.join(root, c);
    if (full.startsWith(root) && fs.existsSync(full) && fs.statSync(full).isFile()) {
      return full;
    }
  }
  return null;
}

http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split('?')[0]);
  const filePath = resolve(urlPath);

  if (!filePath) {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>404 - Nao encontrado</h1><p>' + urlPath + '</p>');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<h1>404 - Nao encontrado</h1>');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(port, () => {
  console.log('Servidor rodando em http://localhost:' + port);
});
