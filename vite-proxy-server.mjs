// 简易 Vite proxy：将 /api/chat 请求转发到 Netlify Function
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const chatJsPath = join(__dirname, 'netlify', 'functions', 'chat.js');
const chatJsContent = readFileSync(chatJsPath, 'utf-8');

// 解析 Chat.js 中的 handler 函数
// 我们直接导入并调用它
const handlerModule = await import(chatJsPath);

// 但 ES export default 不能直接 import... 我们用 eval 方式
// 实际上更好的方式：创建一个 Node.js 兼容的 wrapper
// 由于 Netlify Function 用 ES modules export default，Node 直接运行需要处理

const API_KEY = process.env.AGNES_API_KEY || 'sk-LgcxeEG9Qz6kCipH6mzmm9kkWj9J4gFla8FsV2qjzXhB8y8F';

import { createServer } from 'node:http';

const server = createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end('');
    return;
  }

  if (req.url.startsWith('/api/chat') && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const parsed = JSON.parse(body);
        // 模拟 Netlify event/context
        const event = {
          httpMethod: 'POST',
          body: JSON.stringify(parsed),
        };
        const context = {};

        // 我们需要直接调用 handler。由于它是 ES module，我们用 eval
        const handlerCode = readFileSync(chatJsPath, 'utf-8');
        // 提取 handler 函数的实现（跳过 export default）
        const funcMatch = handlerCode.match(/export default async function handler\(event, context\) \{[\s\S]*\n\}/);
        if (funcMatch) {
          // 提取并执行
          const funcBody = funcMatch[0].replace('export default async function handler', 'function _handler');
          const asyncModule = { funcBody };
          
          // 用 Function constructor 执行
          // 但我们已经有 import 的 module 了
          // 更简单：直接用 handlerModule.default
          if (handlerModule.default) {
            const result = await handlerModule.default(event, context);
            res.writeHead(result.statusCode, result.headers);
            res.end(result.body);
          } else {
            res.writeHead(500);
            res.end('Handler not found');
          }
        } else {
          res.writeHead(500);
          res.end('Could not parse handler');
        }
      } catch (err) {
        console.error('Proxy error:', err.message);
        res.writeHead(500);
        res.end(JSON.stringify({ error: err.message }));
      }
    });
  } else {
    // 其他请求由 Vite 处理
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(9999, () => {
  console.log('Proxy server running on http://localhost:9999');
  console.log('API endpoint: http://localhost:9999/api/chat');
});
