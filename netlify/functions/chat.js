/**
 * Netlify Serverless Function — AI 聊天代理 + 联网搜索
 * 
 * 用途：
 * 1. 安全转发 AI 请求（密钥不暴露客户端）
 * 2. 联网搜索合规数据
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
  const SEARCH_API_KEY = process.env.SEARCH_API_KEY;
  
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

  // ============================================
  // 联网搜索端点
  // ============================================
  if (action === "search") {
    return await handleSearch(event, headers, body, SEARCH_API_KEY);
  }

  // ============================================
  // AI 对话端点
  // ============================================
  return await handleAIChat(event, headers, body, API_KEY);
}

/**
 * 联网搜索合规数据
 * 使用 Bing Search API / SerpAPI / 免费搜索
 */
async function handleSearch(event, headers, body, searchApiKey) {
  const query = body.query || "";
  if (!query) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "缺少搜索 query" }),
    };
  }

  try {
    // 方案 1: 使用 SerpAPI（免费 100 次/月）
    const SERPAPI_KEY = process.env.SERPAPI_KEY;
    if (SERPAPI_KEY) {
      return await searchViaSerpApi(SERPAPI_KEY, query, headers);
    }

    // 方案 2: 使用 Bing Search API
    if (searchApiKey) {
      return await searchViaBing(searchApiKey, query, headers);
    }

    // 方案 3: 使用免费 DuckDuckGo 搜索（无需 API Key）
    return await searchViaDuckDuckGo(query, headers);

  } catch (err) {
    console.error("搜索失败:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: "搜索失败", 
        results: [] 
      }),
    };
  }
}

/**
 * 通过 SerpAPI 搜索（结构化数据，质量最高）
 */
async function searchViaSerpApi(key: string, query: string, headers: Record<string, string>) {
  const encodedQuery = encodeURIComponent(`${query} 亚马逊合规认证要求`);
  const url = `https://serpapi.com/search.json?q=${encodedQuery}&engine=google&num=5&api_key=${key}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`SerpAPI 错误: ${response.status}`);
  }

  const data = await response.json();
  const results = (data.organic_results || []).map((r: any) => ({
    title: r.title || "",
    url: r.link || "",
    snippet: r.snippet || "",
  }));

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ results }),
  };
}

/**
 * 通过 Bing Search API
 */
async function searchViaBing(key: string, query: string, headers: Record<string, string>) {
  const url = "https://api.bing.microsoft.com/v7.0/search";
  
  const response = await fetch(url, {
    headers: {
      "Ocp-Apim-Subscription-Key": key,
    },
  });

  if (!response.ok) {
    throw new Error(`Bing API 错误: ${response.status}`);
  }

  const data = await response.json();
  const results = (data.webPages?.value || []).map((r: any) => ({
    title: r.name || "",
    url: r.url || "",
    snippet: r.snippet || "",
  }));

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ results }),
  };
}

/**
 * 通过 DuckDuckGo 免费搜索（无需 API Key）
 */
async function searchViaDuckDuckGo(query: string, headers: Record<string, string>) {
  const encodedQuery = encodeURIComponent(query);
  const url = `https://html.duckduckgo.com/html/?q=${encodedQuery}`;
  
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; ComplianceCat/1.0)",
    },
  });

  if (!response.ok) {
    throw new Error(`DuckDuckGo 错误: ${response.status}`);
  }

  const html = await response.text();
  
  // 解析 DuckDuckGo HTML 结果
  const results = [];
  const resultRegex = /<a class="result__a"[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>.*?<a class="result__snippet[^>]*>([^<]+)<\/a>/g;
  let match;
  
  while ((match = resultRegex.exec(html)) !== null) {
    results.push({
      title: match[2].trim(),
      url: match[1],
      snippet: match[3].trim(),
    });
    if (results.length >= 5) break;
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ results }),
  };
}

/**
 * AI 对话处理（支持 Agnes 自身搜索）
 */
async function handleAIChat(event, headers, body, apiKey: string) {
  const { action, prompt, message } = body;

  // 确定 API 端点
  let apiUrl, apiBody;
  
  // 优先使用自定义端点
  const BASE_URL = process.env.AI_BASE_URL || "https://api.agnes.ai";
  const MODEL = process.env.AI_MODEL || "agnes-1.5-pro";
  
  if (action === "extract-profile" || action === "diagnose" || action === "appeal" || action === "short-reply") {
    apiUrl = `${BASE_URL}/v1/chat/completions`;
    
    // 构建消息体（兼容 OpenAI 格式）
    let systemMessage = prompt || "你是一个智能助手。";
    let userContent = message || "";
    
    // ===== 诊断时注入搜索提示 =====
    if (action === "diagnose" && userContent) {
      // 从 userContent 提取产品名和市场
      const productMatch = userContent.match(/产品类型：([\s\S]*?)\n/);
      const marketMatch = userContent.match(/目标市场：([\S]+)/);
      if (productMatch && marketMatch) {
        const productName = productMatch[1].trim();
        const marketName = marketMatch[1].trim();
        // 在 prompt 中加入搜索指令
        systemMessage += `\n\n【联网搜索要求】\n在生成诊断前，请先联网搜索以下关键词的最新合规信息：\n"${productName} Amazon ${marketName} 合规认证要求"\n将搜索结果作为诊断的重要依据。`;
      }
    }
    
    apiBody = {
      model: MODEL,
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userContent },
      ],
      temperature: 0.3,
      max_tokens: 4096,
    };
  } else {
    // 通用聊天模式
    apiUrl = `${BASE_URL}/v1/chat/completions`;
    const messages = body.messages || [
      { role: "user", content: message || "" },
    ];
    apiBody = {
      model: MODEL,
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
        "Authorization": `Bearer ${apiKey}`,
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
