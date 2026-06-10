// AI 智能体核心逻辑

import { PROFILE_EXTRACTION_PROMPT, DIAGNOSIS_PROMPT, APPEAL_PROMPT, SHORT_REPLY_PROMPT } from "./prompts";
import { env } from "./env";

// ============================================
// 类型定义
// ============================================

export interface ProductProfile {
  product_type: string;
  has_battery: boolean | null;
  battery_capacity: number | null;
  has_wireless: boolean | null;
  is_children: boolean | null;
  food_contact: boolean | null;
  wearable: boolean | null;
  medical: boolean | null;
  electrical: boolean | null;
  contains_chemicals: boolean | null;
  contains_magnets: boolean | null;
  precision: boolean | null;
  [key: string]: unknown;
}

export interface ProfileExtractionResult {
  profile: ProductProfile;
  market: string | null;
  informationSufficient: boolean;
  questions: string[];
  confidence: "high" | "medium" | "low";
}

export interface DiagnosisResult {
  summary: string;
  recommendations: Array<{
    name: string;
    required: boolean;
    priority: "high" | "medium" | "low";
    severity: "high" | "medium" | "low";
    reason: string;
    estimatedCost: string;
    estimatedTime: string;
    action: string;
    needsThirdParty: boolean;
  }>;
  riskLevel: "high" | "medium" | "low";
  warnings: string[];
  [key: string]: unknown;
}

export interface AppealResult {
  rootCause: string;
  correctiveActions: string[];
  preventiveMeasures: string[];
  poaTemplate: string;
  checklist: string[];
  tips: string;
}

export interface ShortReplyResult {
  action: "diagnose" | "ask";
  questions?: string[];
  profile?: Partial<ProductProfile>;
  summary?: string;
}

type ApiEndpoint = "extract-profile" | "diagnose" | "appeal" | "short-reply";

// ============================================
// 核心：调用 AI API
// ============================================

async function callAI<T>(endpoint: ApiEndpoint, systemPrompt: string, userMessage: string): Promise<T> {
  // 尝试调用本地代理（Netlify Function）
  const proxyUrl = "/.netlify/functions/chat";
  
  try {
    const response = await fetch(proxyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: endpoint,
        prompt: systemPrompt,
        message: userMessage,
      }),
    });

    if (!response.ok) {
      throw new Error(`代理请求失败: ${response.status}`);
    }

    const data = await response.json();
    
    // 尝试解析 AI 返回的 JSON（可能包裹在 markdown 代码块中）
    return parseAIResponse<T>(data.reply || data.content || data.message || "");
  } catch (err) {
    console.warn("代理调用失败，尝试直连:", err);
    
    // 降级：尝试直连 Agnes API
    if (!env.apiBaseUrl) {
      throw new Error("AI 服务暂时不可用。请配置 API 基础地址或稍后重试。");
    }

    try {
      const url = env.apiBaseUrl.endsWith("/") 
        ? `${env.apiBaseUrl.substring(0, env.apiBaseUrl.length - 1)}/chat`
        : `${env.apiBaseUrl}/chat`;

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system" as const, content: systemPrompt },
            { role: "user" as const, content: userMessage },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`直连请求失败: ${response.status}`);
      }

      const data = await response.json();
      return parseAIResponse<T>(data.reply || data.content || data.message || data.text || "");
    } catch (innerErr) {
      throw new Error("AI 服务暂时不可用，请稍后重试。");
    }
  }
}

// 解析 AI 返回的 JSON（处理 markdown 代码块包裹）
function parseAIResponse<T>(text: string): T {
  // 去除 markdown 代码块
  const cleaned = text
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  // 尝试找到 JSON 对象
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("AI 返回格式异常");
  }

  return JSON.parse(jsonMatch[0]) as T;
}

// ============================================
// 公开 API
// ============================================

/**
 * 提取产品画像
 */
export async function extractProductProfile(userMessage: string): Promise<ProfileExtractionResult> {
  return callAI<ProfileExtractionResult>(
    "extract-profile",
    PROFILE_EXTRACTION_PROMPT.replace("{userMessage}", userMessage),
    userMessage
  );
}

/**
 * 生成合规诊断
 */
export async function generateDiagnosis(
  profile: ProductProfile,
  market: string,
  category?: string
): Promise<DiagnosisResult> {
  const features = Object.entries(profile)
    .filter(([_, v]) => v !== null)
    .map(([k, v]) => `${k}: ${v}`)
    .join("、");

  return callAI<DiagnosisResult>(
    "diagnose",
    DIAGNOSIS_PROMPT
      .replace("{productType}", profile.product_type)
      .replace("{productFeatures}", features)
      .replace("{market}", market === "US" ? "美国" : market === "EU" ? "欧盟" : market === "UK" ? "英国" : market === "JP" ? "日本" : market === "CA" ? "加拿大" : "澳洲")
      .replace("{category}", category || "未指定"),
    `根据以上产品信息生成诊断报告`
  );
}

/**
 * 生成申诉方案
 */
export async function generateAppeal(
  productType: string,
  reason: string,
  actions: string
): Promise<AppealResult> {
  return callAI<AppealResult>(
    "appeal",
    APPEAL_PROMPT
      .replace("{productType}", productType)
      .replace("{reason}", reason)
      .replace("{actions}", actions),
    "请生成完整的申诉方案"
  );
}

/**
 * 简短回复（用于追问场景）
 */
export async function shortReply(
  profile: ProductProfile,
  status: string,
  userMessage: string
): Promise<ShortReplyResult> {
  const profileStr = JSON.stringify(profile, null, 2);
  return callAI<ShortReplyResult>(
    "short-reply",
    SHORT_REPLY_PROMPT
      .replace("{profile}", profileStr)
      .replace("{status}", status),
    userMessage
  );
}

/**
 * 判断信息是否足够开始诊断
 */
export function isProfileComplete(profile: ProductProfile, market: string | null): boolean {
  // 必须有产品类型
  if (!profile.product_type || !profile.product_type.trim()) {
    return false;
  }
  // 必须有目标市场
  if (!market) {
    return false;
  }
  return true;
}
