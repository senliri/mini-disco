/**
 * Netlify Serverless Function — AI 聊天代理
 * 
 * 用途：安全转发 AI 请求，密钥不暴露在客户端
 */

export default async function handler(event, context) {
  // CORS 头
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  // OPTIONS 预检请求
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  // 只接受 POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  // 从环境变量读取 API Key
  const API_KEY = process.env.AGNES_API_KEY || process.env.OPENAI_API_KEY;
  
  if (!API_KEY) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "API Key 未配置" }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "请求格式错误" }),
    };
  }

  const { action, prompt, message } = body;

  // 确定 API 端点
  let apiUrl, apiBody;
  
  // 优先使用自定义端点
  const BASE_URL = process.env.AI_BASE_URL || "https://api.agnes.ai";
  
  if (action === "extract-profile" || action === "diagnose" || action === "appeal" || action === "short-reply") {
    apiUrl = `${BASE_URL}/v1/chat/completions`;
    
    // 构建消息体（兼容 OpenAI 格式）
    const systemMessage = prompt || "你是一个智能助手。";
    const userContent = message || "";
    
    apiBody = {
      model: process.env.AI_MODEL || "agnes-2.0-flash",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userContent },
      ],
      temperature: 0.3, // 低温度，输出更稳定
      max_tokens: 4096,
    };
  } else {
    // 通用聊天模式
    apiUrl = `${BASE_URL}/v1/chat/completions`;
    const messages = body.messages || [
      { role: "user", content: message || "" },
    ];
    apiBody = {
      model: process.env.AI_MODEL || "agnes-2.0-flash",
      messages,
      temperature: 0.3,
      max_tokens: 4096,
    };
  }

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(apiBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API 错误:", response.status, errorText);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ error: `AI API 错误: ${response.status}` }),
      };
    }

    const data = await response.json();
    
    // 提取回复内容
    const reply = data.choices?.[0]?.message?.content || data.reply || "";

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        reply,
        usage: data.usage,
      }),
    };
  } catch (err) {
    console.error("代理请求失败:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "代理请求失败" }),
    };
  }
}
