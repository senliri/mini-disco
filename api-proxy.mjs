// 简易 API handler（Node.js 可直接运行，无 TS 类型）
import { createServer } from 'node:http';

const API_KEY = process.env.AGNES_API_KEY || 'sk-LgcxeEG9Qz6kCipH6mzmm9kkWj9J4gFla8FsV2qjzXhB8y8F';
const BASE_URL = process.env.AI_BASE_URL || 'https://apihub.agnes-ai.com/v1/chat/completions';
const MODEL = process.env.AI_MODEL || 'agnes-2.0-flash';

const server = createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end('');
    return;
  }

  if (req.url === '/api/chat' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const parsed = JSON.parse(body);
        const { action, prompt, message } = parsed;

        if (action === 'extract-profile' || action === 'diagnose' || action === 'appeal' || action === 'short-reply') {
          let systemMessage = prompt || '你是一个智能助手。';
          let userContent = message || '';

          if (action === 'diagnose' && userContent) {
            const productMatch = userContent.match(/产品类型：([\s\S]*?)\n/);
            const marketMatch = userContent.match(/目标市场：([\S]+)/);
            if (productMatch && marketMatch) {
              const productName = productMatch[1].trim();
              const marketName = marketMatch[1].trim();
              systemMessage += `\n\n【联网搜索要求】\n在生成诊断前，请先联网搜索以下关键词的最新合规信息：\n"${productName} Amazon ${marketName} 合规认证要求"\n将搜索结果作为诊断的重要依据。`;
            }
          }

          const apiBody = {
            model: MODEL,
            messages: [
              { role: 'system', content: systemMessage },
              { role: 'user', content: userContent },
            ],
            temperature: 0.3,
            max_tokens: 4096,
          };

          try {
            const response = await fetch(BASE_URL, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`,
              },
              body: JSON.stringify(apiBody),
            });

            if (!response.ok) {
              const errorText = await response.text();
              console.error('AI API error:', response.status, errorText);
              res.writeHead(response.status, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: `AI API error: ${response.status}` }));
              return;
            }

            const data = await response.json();
            const reply = data.choices?.[0]?.message?.content || data.reply || '';

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ reply, usage: data.usage }));
          } catch (err) {
            console.error('Proxy request failed:', err.message);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: '代理请求失败', details: err.message }));
          }
        } else {
          // 通用聊天模式
          const messages = parsed.messages || [{ role: 'user', content: message || '' }];
          const apiBody = {
            model: MODEL,
            messages,
            temperature: 0.3,
            max_tokens: 4096,
          };

          try {
            const response = await fetch(BASE_URL, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`,
              },
              body: JSON.stringify(apiBody),
            });

            if (!response.ok) {
              const errorText = await response.text();
              console.error('AI API error:', response.status, errorText);
              res.writeHead(response.status, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: `AI API error: ${response.status}` }));
              return;
            }

            const data = await response.json();
            const reply = data.choices?.[0]?.message?.content || data.reply || '';

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ reply, usage: data.usage }));
          } catch (err) {
            console.error('Proxy request failed:', err.message);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: '代理请求失败', details: err.message }));
          }
        }
      } catch (err) {
        console.error('Parse error:', err.message);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: '请求格式错误' }));
      }
    });
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(9999, () => {
  console.log('✅ API proxy running: http://localhost:9999/api/chat');
  console.log('   AI endpoint:', BASE_URL);
  console.log('');
  console.log('Vite 开在 5173，前端修改 API URL 为 http://localhost:9999/api/chat');
  console.log('或者在 vite.config.ts 加 proxy: { "/api/chat": { target: "http://localhost:9999" } }');
});
