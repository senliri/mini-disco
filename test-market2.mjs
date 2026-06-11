const API_KEY = "sk-AGNES_43334090B36141E4A01648308537656C";
const BASE_URL = "https://apihub.agnes-ai.com/v1/chat/completions";

const systemPrompt = "你是一个亚马逊合规专家。用户描述了他们的产品和目标市场。任务：1. 提取产品特征 2. 目标市场识别：从用户消息中判断目标市场，支持 US/EU/UK/JP/CA/AU，无法判断则为 null 市场识别规则：美国/US -> US，欧盟/EU/Europe/European/荷兰/Holland/Netherlands/德国/Germany/法国/France/意大利/Italy/西班牙/Spain/波兰/Poland -> EU，英国/UK -> UK，日本/JP -> JP，加拿大/CA -> CA，澳洲/AU -> AU。输出格式（严格 JSON），market 字段值只能是: US EU UK JP CA AU null";

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
if (resp.status === 200) {
  const content = data.choices?.[0]?.message?.content || "No content";
  console.log("Content:", content);
} else {
  console.log("Error:", JSON.stringify(data, null, 2));
}
