#!/usr/bin/env node
/**
 * Local dev server with rebuild + live reload. Node built-ins only.
 *
 *   node scripts/dev.mjs          → http://localhost:5173
 *   PORT=8080 node scripts/dev.mjs
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const SRC = path.join(ROOT, 'src');
const PORT = Number(process.env.PORT) || 5173;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
  '.woff2': 'font/woff2',
  '.pdf': 'application/pdf',
};

const build = () => spawnSync(process.execPath, [path.join(ROOT, 'scripts', 'build.mjs')], { stdio: 'inherit', cwd: ROOT }).status === 0;

const clients = new Set();
const RELOAD = `<script>(()=>{const s=new EventSource('/__reload');s.onmessage=()=>location.reload();})();</script>`;

function send(res, file, status = 200) {
  const ext = path.extname(file).toLowerCase();
  let body = fs.readFileSync(file);
  if (ext === '.html') body = body.toString().replace('</body>', `${RELOAD}</body>`);
  res.writeHead(status, { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  res.end(body);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/__reload') {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store', Connection: 'keep-alive' });
    res.write(': connected\n\n');
    clients.add(res);
    req.on('close', () => clients.delete(res));
    return;
  }
  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    res.writeHead(400).end('Bad request');
    return;
  }
  const file = path.normalize(path.join(DIST, pathname));
  if (!file.startsWith(DIST)) {
    res.writeHead(403).end('Forbidden');
    return;
  }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
    // Mirror GitHub Pages: /projects → /projects/ so relative links resolve the same way.
    if (!pathname.endsWith('/')) {
      res.writeHead(301, { Location: pathname + '/' + url.search }).end();
      return;
    }
    const index = path.join(file, 'index.html');
    if (fs.existsSync(index)) return send(res, index);
  } else if (fs.existsSync(file)) {
    return send(res, file);
  }
  const notFound = path.join(DIST, '404.html');
  if (fs.existsSync(notFound)) return send(res, notFound, 404);
  res.writeHead(404).end('Not found');
});

build();
server.listen(PORT, () => console.log(`\n  ➜  Portfolio running at http://localhost:${PORT}/\n     Watching src/ for changes…\n`));

let timer;
fs.watch(SRC, { recursive: true }, () => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    if (build()) for (const c of clients) c.write('data: reload\n\n');
  }, 120);
});
