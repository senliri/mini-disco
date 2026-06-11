// 模拟前端 agent.ts 的 extractProductProfile 调用
import fetch from "node-fetch";

const API_KEY = "sk-AGNES_43334090B36141E4A01648308537656C";
const BASE_URL = "https://apihub.agnes-ai.com/v1/chat/completions";

const systemPrompt = `你是一个亚马逊合规专家。用户描述了他们的产品和目标市场。
任务：1. 提取产品特征 2. 判断信息是否足够 3. 如果信息不足，最多追问 3 个关键问题 4. 目标市场识别：从用户消息中判断目标市场，支持 US/EU/UK/JP/CA/AU，无法判断则为 null

**市场识别规则（必须严格执行）：**
- "美国/US/United States/America" -> "US"
- "欧盟/EU/Europe/European/荷兰/Holland/Netherlands/德国/Germany/法国/France/意大利/Italy/西班牙/Spain/波兰/Poland/比利时/Belgium/瑞典/Sweden/丹麦/Denmark/挪威/Norway/芬兰/Finland/奥地利/Austria/爱尔兰/Ireland/葡萄牙/Portugal/希腊/Greece/捷克/Czech/匈牙利/Hungary/罗马尼亚/Romania" -> "EU"
- "英国/UK/United Kingdom/Britain" -> "UK"
- "日本/JP/Japan" -> "JP"
- "加拿大/CA/Canada" -> "CA"
- "澳洲/AU/Australia/New Zealand" -> "AU"
- 如果用户明确提到国家/地区，优先按上述映射表识别
- 国家不在列表中且用户没提市场 -> "null"

输出格式（严格 JSON），market 字段值只能是: "US" | "EU" | "UK" | "JP" | "CA" | "AU" | null`;

const userMsg = "指甲刀卖荷兰";

const resp = await fetch(BASE_URL, {
  method: "POST",
  headers: { "Content-Type": "application/json", "Authorization": `Bearer ${API_KEY}` },
  body: JSON.stringify({
    model: "agnes-2.0-flash",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMsg }
    ],
    temperature: 0.3,
    max_tokens: 2048
  })
});

const data = await resp.json();
console.log("Status:", resp.status);
console.log("Response:", JSON.stringify(data, null, 2));
