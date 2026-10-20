import http from 'http';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');
const PORT = 3000;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.wasm': 'application/wasm',
  '.stl': 'model/stl'
};

function ensureBuildExists() {
  const indexPath = path.join(distDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    return Promise.resolve();
  }

  console.log('[ANY3D Launcher] Production build not found. Running vite build first...');
  return new Promise((resolve, reject) => {
    const buildProcess = exec('npx vite build', { cwd: rootDir });
    buildProcess.stdout?.pipe(process.stdout);
    buildProcess.stderr?.pipe(process.stderr);
    buildProcess.on('close', (code) => {
      if (code === 0) {
        console.log('[ANY3D Launcher] Build completed successfully.');
        resolve();
      } else {
        reject(new Error(`Build exited with code ${code}`));
      }
    });
  });
}

function startServer() {
  const server = http.createServer((req, res) => {
    const rawUrl = req.url || '/';
    const cleanUrl = rawUrl.split('?')[0];
    let filePath = path.join(distDir, cleanUrl === '/' ? 'index.html' : cleanUrl);

    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(distDir, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Server Error: ' + err.message);
        return;
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    });
  });

  return new Promise((resolve) => {
    server.listen(PORT, '127.0.0.1', () => {
      resolve(server);
    });
  });
}

function openBrowser(url) {
  const startCmd = process.platform === 'win32' ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open';
  exec(`${startCmd} ${url}`);
}

async function main() {
  console.log('========================================================');
  console.log('   ANY3D SLICER — Anycubic Kobra 2 Desktop Launcher     ');
  console.log('========================================================');
  
  try {
    await ensureBuildExists();
    await startServer();
    const url = `http://localhost:${PORT}`;
    console.log(`[ANY3D Launcher] Server is running at: ${url}`);
    console.log('[ANY3D Launcher] Opening ANY3D in your default browser...');
    openBrowser(url);
    console.log('\nPress Ctrl+C in this console to stop the ANY3D application.');
  } catch (err) {
    console.error('[ANY3D Launcher] Failed to start:', err.message);
    process.exit(1);
  }
}

main();
