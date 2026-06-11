/**
 * Netlify Serverless Function — Feedback Collector
 * Stores feedback in a JSON file within the deploy context
 */

module.exports.handler = async function handler(event, context) {
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

  const { type, category, detail, priority, page, userAgent } = body;

  // 验证
  if (!type || !category || !detail) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Missing required fields: type, category, detail" }),
    };
  }

  // type: experience / content / feature / high_frequency
  // category: bug / slow / inaccurate / missing_content / too_professional / ui_layout / new_feature
  // priority: critical / high / medium / low
  
  const feedbackEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type, // experience | content | feature | high_frequency
    category, // bug | slow | inaccurate | missing_content | too_professional | ui_layout | new_feature
    detail, // 用户描述
    priority: priority || "medium", // critical | high | medium | low
    page: page || "/", // 来源页面
    userAgent: userAgent || "unknown",
    timestamp: new Date().toISOString(),
    status: "new", // new | triaged | in_progress | resolved
    note: "", // 内部备注
  };

  // 读取现有反馈
  let allFeedback = [];
  const feedbackPath = "/tmp/feedback.json";
  try {
    const fs = require("fs");
    if (fs.existsSync(feedbackPath)) {
      allFeedback = JSON.parse(fs.readFileSync(feedbackPath, "utf8"));
    }
  } catch {
    // 文件不存在或解析失败，使用空数组
  }

  allFeedback.push(feedbackEntry);

  // 限制最大条数（避免无限增长）
  if (allFeedback.length > 1000) {
    allFeedback = allFeedback.slice(-1000);
  }

  try {
    const fs = require("fs");
    fs.writeFileSync(feedbackPath, JSON.stringify(allFeedback, null, 2));
  } catch (err) {
    console.error("Failed to write feedback:", err);
    // 写入失败也返回成功，不影响用户体验
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ success: true, id: feedbackEntry.id }),
  };
};
