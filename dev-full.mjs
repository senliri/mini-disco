// 全功能 dev server：Vite 代理 + API 代理
import { createServer } from 'node:http';
import { createProxyServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);
const API_KEY = process.env.AGNES_API_KEY || 'sk-LgcxeEG9Qz6kCipH6mzmm9kkWj9J4gFla8FsV2qjzXhB8y8F';

// 动态导入 chat.js
const chatModule = await import(join(process.cwd(), 'netlify', 'functions', 'chat.js'));

// 创建 Vite 代理（转发所有请求到 Vite dev server）
const vite = createProxyServer({
  target: 'http://localhost:5173',
  changeOrigin: true,
  ws: true,
});

// 错误处理
vite.on('error', (err) => {
  // Vite 没启动时静默忽略
});

const server = createServer((req, res) => {
  // 拦截 /api/chat
  if (req.url.startsWith('/api/chat') && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const parsed = JSON.parse(body);
        const event = {
          httpMethod: 'POST',
          body: JSON.stringify(parsed),
        };
        const result = await chatModule.default(event, {});
        res.writeHead(result.statusCode || 200, result.headers || { 'Content-Type': 'application/json' });
        res.end(result.body);
      } catch (err) {
        console.error('Chat API error:', err.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
  } else {
    // 其他请求代理到 Vite
    vite.emit('request', req, res);
  }
});

server.listen(9997, () => {
  console.log('=== Compliance Cat Dev Server ===');
  console.log('Frontend + API: http://localhost:9997');
  console.log('Vite (fallback): http://localhost:5173');
  console.log('');
  console.log('Open http://localhost:9997 in browser');
});
