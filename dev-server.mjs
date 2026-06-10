// 简易 dev server：拦截 /api/chat，转发到 chat.js handler
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createServer } from 'node:http';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);
const __dirname = process.cwd();

// 读取 chat.js 的 handler
const chatJsPath = join(__dirname, 'netlify', 'functions', 'chat.js');
const chatJs = readFileSync(chatJsPath, 'utf-8');

// 动态导入（ES module）
const chatModule = await import(chatJsPath);

const API_KEY = process.env.AGNES_API_KEY || 'sk-LgcxeEG9Qz6kCipH6mzmm9kkWj9J4gFla8FsV2qjzXhB8y8F';

const server = createServer(async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end('');
    return;
  }

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
        console.error('Proxy error:', err.message, err.stack);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
  } else {
    // 其他请求 404（让 Vite 处理）
    res.writeHead(404);
    res.end('Dev proxy: Not found - use Vite directly');
  }
});

server.listen(9998, () => {
  console.log('✅ Chat API proxy: http://localhost:9998/api/chat');
  console.log('✅ Vite dev: http://localhost:5173');
  console.log('');
  console.log('Usage: Open http://localhost:5173 in browser');
  console.log('       The frontend will call /api/chat which proxies to your API');
});
