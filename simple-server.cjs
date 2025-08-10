const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 8081;

// MIME types for different file extensions
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm'
};

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);
  
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  let pathname = url.parse(req.url).pathname;
  
  // Default to index.html for root path
  if (pathname === '/') {
    pathname = '/index.html';
  }
  
  // Try to serve from dist directory first (built files)
  let filePath = path.join(__dirname, 'dist', pathname);
  
  // If not found in dist, try public directory
  if (!fs.existsSync(filePath)) {
    filePath = path.join(__dirname, 'public', pathname);
  }
  
  // If still not found, try root directory
  if (!fs.existsSync(filePath)) {
    filePath = path.join(__dirname, pathname);
  }
  
  // For SPA routing, serve index.html for non-file requests
  if (!fs.existsSync(filePath) && !path.extname(pathname)) {
    filePath = path.join(__dirname, 'dist', 'index.html');
    if (!fs.existsSync(filePath)) {
      filePath = path.join(__dirname, 'public', 'index.html');
    }
    if (!fs.existsSync(filePath)) {
      filePath = path.join(__dirname, 'index.html');
    }
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>404 Not Found</h1>');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running at http://localhost:${PORT}/`);
  console.log(`🌐 Also accessible at http://0.0.0.0:${PORT}/`);
  console.log('📁 Serving files from: dist/, public/, and root directories');
  console.log('Press Ctrl+C to stop the server');
});
