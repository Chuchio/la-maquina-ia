import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3000;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.pdf': 'application/pdf',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.ogg': 'video/ogg',
};

const ROOT = __dirname;

http.createServer((req, res) => {
  let urlPath;
  try {
    urlPath = decodeURIComponent(req.url.split('?')[0]);
  } catch {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('400 Bad Request');
    return;
  }
  if (urlPath === '/') urlPath = '/index.html';
  // Resolve and confine to ROOT to prevent path traversal (e.g. /../../etc/passwd)
  const filePath = path.normalize(path.join(ROOT, urlPath));
  if (filePath !== ROOT && !filePath.startsWith(ROOT + path.sep)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME[ext] || 'application/octet-stream';

  // Range requests for video/audio
  if (['.mp4', '.webm', '.ogg'].includes(ext)) {
    fs.stat(filePath, (err, stat) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
        return;
      }
      const total = stat.size;
      const range = req.headers.range;
      if (range) {
        const [startStr, endStr] = range.replace(/bytes=/, '').split('-');
        const start = parseInt(startStr, 10);
        const end = endStr ? parseInt(endStr, 10) : total - 1;
        const chunkSize = end - start + 1;
        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${total}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize,
          'Content-Type': contentType,
        });
        fs.createReadStream(filePath, { start, end }).pipe(res);
      } else {
        res.writeHead(200, {
          'Content-Length': total,
          'Content-Type': contentType,
          'Accept-Ranges': 'bytes',
        });
        fs.createReadStream(filePath).pipe(res);
      }
    });
    return;
  }

  const sendFile = (fp, type) => {
    fs.readFile(fp, (err, data) => {
      if (err) {
        // Clean-URL fallback: /terminos-y-condiciones -> terminos-y-condiciones.html
        if (!ext) {
          const htmlPath = fp + '.html';
          fs.readFile(htmlPath, (err2, data2) => {
            if (err2) {
              res.writeHead(404, { 'Content-Type': 'text/plain' });
              res.end('404 Not Found');
              return;
            }
            res.writeHead(200, { 'Content-Type': MIME['.html'] });
            res.end(data2);
          });
          return;
        }
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
        return;
      }
      res.writeHead(200, { 'Content-Type': type });
      res.end(data);
    });
  };
  sendFile(filePath, contentType);
}).listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
