/**
 * Netlify Serverless Function — AI Chat Proxy + Web Search
 *
 * Purpose:
 * 1. Safely proxy AI requests (key never exposed to client)
 * 2. Web search for compliance data
 */

export default async function handler(event, context) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const API_KEY = process.env.AGNES_API_KEY || process.env.OPENAI_API_KEY;
  const SEARCH_API_KEY = process.env.SEARCH_API_KEY;
  
  if (!API_KEY) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "API Key not configured" }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Invalid request format" }),
    };
  }

  const { action, prompt, message } = body;

  if (action === "search") {
    return await handleSearch(event, headers, body, SEARCH_API_KEY);
  }

  return await handleAIChat(event, headers, body, API_KEY);
}

async function handleSearch(event, headers, body, searchApiKey) {
  const query = body.query || "";
  if (!query) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Missing search query" }),
    };
  }

  try {
    const SERPAPI_KEY = process.env.SERPAPI_KEY;
    if (SERPAPI_KEY) {
      return await searchViaSerpApi(SERPAPI_KEY, query, headers);
    }

    if (searchApiKey) {
      return await searchViaBing(searchApiKey, query, headers);
    }

    return await searchViaDuckDuckGo(query, headers);

  } catch (err) {
    console.error("Search failed:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: "Search failed", 
        results: [] 
      }),
    };
  }
}

async function searchViaSerpApi(key, query, headers) {
  const encodedQuery = encodeURIComponent(`${query} Amazon compliance certification`);
  const url = `https://serpapi.com/search.json?q=${encodedQuery}&engine=google&num=5&api_key=${key}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`SerpAPI error: ${response.status}`);
  }

  const data = await response.json();
  const results = (data.organic_results || []).map((r) => ({
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

async function searchViaBing(key, query, headers) {
  const url = "https://api.bing.microsoft.com/v7.0/search";
  
  const response = await fetch(url, {
    headers: {
      "Ocp-Apim-Subscription-Key": key,
    },
  });

  if (!response.ok) {
    throw new Error(`Bing API error: ${response.status}`);
  }

  const data = await response.json();
  const results = (data.webPages?.value || []).map((r) => ({
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

async function searchViaDuckDuckGo(query, headers) {
  const encodedQuery = encodeURIComponent(query);
  const url = `https://html.duckduckgo.com/html/?q=${encodedQuery}`;
  
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; ComplianceCat/1.0)",
    },
  });

  if (!response.ok) {
    throw new Error(`DuckDuckGo error: ${response.status}`);
  }

  const html = await response.text();
  
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

async function handleAIChat(event, headers, body, apiKey) {
  const { action, prompt, message } = body;

  const BASE_URL = process.env.AI_BASE_URL || "https://apihub.agnes-ai.com/v1/chat/completions";
  const MODEL = process.env.AI_MODEL || "agnes-2.0-flash";
  
  if (action === "extract-profile" || action === "diagnose" || action === "appeal" || action === "short-reply") {
    let systemMessage = prompt || "You are a smart assistant.";
    let userContent = message || "";
    
    let apiBody = {
      model: MODEL,
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userContent },
      ],
      temperature: 0.3,
      max_tokens: 4096,
    };
  } else {
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
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(apiBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ error: `AI API Error: ${response.status}` }),
      };
    }

    const data = await response.json();
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
    console.error("Proxy request failed:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Proxy request failed" }),
    };
  }
}
