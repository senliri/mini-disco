// AI 智能体核心逻辑

import { PROFILE_EXTRACTION_PROMPT, DIAGNOSIS_PROMPT, APPEAL_PROMPT, SHORT_REPLY_PROMPT } from "./prompts";
import { env } from "./env";
import { searchCompliance } from "./search";

// ============================================
// 产品关键词词典 — 用于精准特征推断
// ============================================

interface FeatureKeywordMap {
  [key: string]: { keywords: string[]; description: string };
}

export const FEATURE_KEYWORDS: FeatureKeywordMap = {
  has_battery: {
    keywords: ["充电宝", "power bank", "battery", "电池", "充电", "充电器", "earphone", "耳机", "智能手表",
              "smartwatch", "电动", "electric", "电动牙刷", "电动剃须刀", "无人机", "drone",
              "电动车", "e-bike", "蓝牙耳机", "wireless earbuds", "TWS", "手环", "fitness band",
              "智能手环", "power tool", "电动工具", "行车记录仪", "dash cam", "手电筒", "flashlight"
              ],
    description: "含锂电池/干电池/充电宝的产品",
  },
  has_wireless: {
    keywords: ["蓝牙", "bluetooth", "WiFi", "无线", "wifi", "rf", "遥控器", "remote",
              "智能", "smart", "APP控制", "app control", "NFC", "zigbee", "thread",
              "无线耳机", "wireless", "蓝牙音箱", "bluetooth speaker"],
    description: "含蓝牙/WiFi/射频等无线通信功能",
  },
  is_children: {
    keywords: ["儿童", "kids", "children", "宝宝", "baby", "infant", "toddler", "童装", "toy",
              "玩具", "益智", "educational toy", "学步车", "high chair", "餐椅", "奶嘴",
              "pacifier", "安抚奶嘴", "奶瓶", "feeding bottle", "母婴", "孕妇", "pregnant",
              "儿童座椅", "car seat", "学步", "幼儿园", "preschool", "doodle", "涂鸦",
              "积木", "building block", "蜡笔", "crayon", "儿童手表", "kids watch",
              "婴儿", "婴儿车", "stroller", "推车"],
    description: "面向12岁以下儿童或婴幼儿的产品",
  },
  food_contact: {
    keywords: ["餐具", "plate", "bowl", "cup", "mug", "bottle", "杯", "碗", "盘",
              "保鲜盒", "food container", "保鲜", "storage box", "锅具", "cookware", "锅",
              "铲", "spatula", "勺", "spoon", "刀", "knife", "砧板", "cutting board",
              "厨房", "kitchen", "吸管", "straw", "吸管杯", "sippy cup", "围裙", "apron",
              "食品级", "food grade", "硅胶", "silicone", "保鲜膜", "cling film",
              "榨汁机", "juicer", "搅拌机", "blender", "破壁机", "咖啡机", "coffee maker",
              "奶瓶", "breast pump", "吸奶器", "餐具套装", "tableware set"],
    description: "直接接触食品的产品或部件",
  },
  wearable: {
    keywords: ["手表", "watch", "眼镜", "glasses", "sunglasses", "戒指", "necklace", "项链",
              "bracelet", "手链", "耳环", "earring", "首饰", "jewelry", "腰带", "belt",
              "鞋子", "shoes", "运动鞋", "sneakers", "耳机", "headphone", "听诊器",
              "stethoscope", "腰带扣", "眼镜框", "眼镜架", "护腕", "护膝", "护腰",
              "智能戒指", "smart ring", "智能眼镜", "smart glasses", "智能项链"],
    description: "穿戴在身上的产品",
  },
  medical: {
    keywords: ["医疗", "medical", "medicine", "药", "治疗", "therapy", "诊断", "diagnosis",
              "血压", "blood pressure", "体温", "thermometer", "血糖", "blood sugar",
              "血糖仪", "glucose meter", "心电图", "ecg", "eeg", "按摩仪", "massager",
              "理疗", "physiotherapy", "呼吸机", "ventilator", "制氧机", "oxygen concentrator",
              "轮椅", "wheelchair", "拐杖", "cane", "针", "needle", "注射器", "syringe",
              "体温计", "infrared thermometer", "额温枪", "耳温枪", "血氧", "pulse oximeter",
              "筋膜枪", "massage gun", "理疗仪", "tens unit", "雾化器", "nebulizer",
              "避孕", "contraception", "验孕", "pregnancy test"],
    description: "医疗诊断、治疗或康复设备",
  },
  electrical: {
    keywords: ["电器", "appliance", "电热", "heating", "加热", "light", "灯", "lighting",
              "led", "光源", "lamp", "台灯", "desk lamp", "吸顶灯", "吊灯", "灯带", "led strip",
              "插座", "power strip", "转换器", "adapter", "电源", "power supply",
              "电动", "motor", "马达", "风扇", "fan", "空调", "air conditioner",
              "加湿器", "humidifier", "空气净化器", "air purifier", "吸尘器", "vacuum",
              "扫地机器人", "robot vacuum", "电饭煲", "rice cooker", "微波炉", "microwave",
              "洗衣机", "washing machine", "烘干机", "dryer", "冰箱", "refrigerator",
              "电脑", "computer", "手机", "phone", "平板", "tablet", "智能", "smart",
              "摄像头", "camera", "监控", "security camera", "路由器", "router", "switch",
              "投影仪", "projector", "音响", "speaker", "麦克风", "microphone"],
    description: "需要通电或使用电源的产品",
  },
  contains_chemicals: {
    keywords: ["化妆", "cosmetic", "skincare", "护肤", "面膜", "mask", "面霜", "cream",
              "香水", "fragrance", "perfume", "口红", "lipstick", "指甲油", "nail polish",
              "美甲", "nail art", "染发", "hair dye", "洗发水", "shampoo", "护发素", "conditioner",
              "发胶", "hair gel", "沐浴露", "body wash", "洗手液", "hand soap", "消毒液",
              "disinfectant", "消毒湿巾", "湿巾", "wet wipe", "清洁剂", "cleaner",
              "农药", "pesticide", "肥料", "fertilizer", "精油", "essential oil",
              "精油灯", "diffuser", "香薰", "aromatherapy", "驱虫", "repellent",
              "驱蚊", "air freshener", "空气清新剂", "防晒", "sunscreen", "防晒霜"],
    description: "含化学成分的产品（化妆品、清洁剂、农药等）",
  },
  contains_magnets: {
    keywords: ["磁铁", "magnet", "磁力", "magnetic", "磁吸", "磁扣", "磁吸支架",
              "MagSafe", "磁吸线", "magnetic cable", "磁力扣", "磁吸充电器", "磁吸玩具",
              "磁性贴", "magnetic stickers", "磁性白板", "magnetic board", "磁力项链"],
    description: "含磁铁或磁性元件的产品",
  },
  precision: {
    keywords: ["精密", "precision", "相机", "camera", "相机镜头", "lens",
              "钟表", "clock", "手表", "watch", "精密仪器", "gauge",
              "测量仪", "measuring device", "测距仪", "laser measure",
              "光谱仪", "spectrometer", "显微镜", "microscope", "望远镜", "telescope",
              "电子秤", "scale", "体重秤", "体重计", "游标卡尺", "caliper"],
    description: "精密测量或光学仪器",
  },
  has_flammable: {
    keywords: ["喷雾", "spray", "aerosol", "杀虫剂", "杀虫", "油漆", "paint",
              "涂料", "coating", "易燃", "flammable", "酒精", "alcohol",
              "含酒精", "flame", "蜡烛", "candle", "打火机", "lighter", "瓦斯", "gas",
              "香水", "fragrance", "发胶", "hair spray", "指甲油", "nail polish"],
    description: "易燃、易爆或压缩气体类产品",
  },
};

// 产品类型 → 默认品类映射
export const PRODUCT_TYPE_CATEGORY_MAP: Record<string, string[]> = {
  electronics: ["电子产品", "electronic", "电器", "家电", "3C", "数码"],
  toys: ["玩具", "toy", "积木", "拼图", "毛绒", "玩偶"],
  baby: ["母婴", "baby", "婴儿", "童装", "童车", "推车", "奶瓶"],
  clothing: ["服装", "clothing", "鞋子", "shoes", "配饰", "jewelry", "首饰"],
  beauty: ["美容", "beauty", "化妆", "cosmetic", "护肤", "skincare", "香水", "fragrance"],
  home: ["家居", "home", "厨房", "kitchen", "家具", "furniture", "灯具", "lighting"],
  sports: ["运动", "sports", "户外", "outdoor", "健身", "fitness", "露营", "camping"],
  auto: ["汽车配件", "auto", "汽车", "car", "车载", "car accessory"],
  office: ["办公用品", "office", "文具", "stationery", "办公设备"],
  pet: ["宠物", "pet", "狗粮", "猫粮", "宠物玩具"],
  food: ["食品", "food", "零食", "snack", "饮料", "beverage", "补充剂", "supplement"],
  health: ["医疗", "health", "健康", "medical", "保健", "wellness", "医疗器械"],
};

// ============================================
// 类型定义
// ============================================

export interface ProductProfile {
  product_type: string;
  category: string; // 推断的品类
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
  has_flammable: boolean | null;
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
 * 基于产品描述关键词推断特征（纯前端本地判断，不依赖 AI）
 */
export function inferFeaturesFromKeywords(description: string): Partial<ProductProfile> {
  const result: Partial<ProductProfile> = {};
  const lower = description.toLowerCase();

  for (const [feature, map] of Object.entries(FEATURE_KEYWORDS)) {
    const hasMatch = map.keywords.some(kw => lower.includes(kw.toLowerCase()));
    (result as Record<string, unknown>)[feature] = hasMatch;
  }

  return result;
}

/**
 * 推断产品类型所属品类
 */
export function inferCategory(productType: string): string {
  const lower = productType.toLowerCase();
  for (const [category, keywords] of Object.entries(PRODUCT_TYPE_CATEGORY_MAP)) {
    if (keywords.some(kw => lower.includes(kw.toLowerCase()))) {
      return category;
    }
  }
  return "electronics"; // 默认
}

/**
 * 生成合规诊断（增强版：联网搜索 + 本地特征推断 + AI 综合诊断）
 */
export async function generateDiagnosis(
  profile: ProductProfile,
  market: string,
  category?: string
): Promise<DiagnosisResult> {
  // 1. 本地关键词推断（作为补充，弥补 AI 提取遗漏的特征）
  const keywordFeatures = inferFeaturesFromKeywords(profile.product_type);
  const inferredCategory = inferCategory(profile.product_type);

  // 2. 合并特征：profile 优先，keywordFeatures 补充
  const mergedProfile: ProductProfile = {
    ...profile,
    category: inferredCategory,
    has_battery: profile.has_battery ?? (keywordFeatures.has_battery as boolean),
    has_wireless: profile.has_wireless ?? (keywordFeatures.has_wireless as boolean),
    is_children: profile.is_children ?? (keywordFeatures.is_children as boolean),
    food_contact: profile.food_contact ?? (keywordFeatures.food_contact as boolean),
    wearable: profile.wearable ?? (keywordFeatures.wearable as boolean),
    medical: profile.medical ?? (keywordFeatures.medical as boolean),
    electrical: profile.electrical ?? (keywordFeatures.electrical as boolean),
    contains_chemicals: profile.contains_chemicals ?? (keywordFeatures.contains_chemicals as boolean),
    contains_magnets: profile.contains_magnets ?? (keywordFeatures.contains_magnets as boolean),
    precision: profile.precision ?? (keywordFeatures.precision as boolean),
    has_flammable: profile.has_flammable ?? (keywordFeatures.has_flammable as boolean),
  };

  // 3. 构建详细的特征描述
  const featureList: string[] = [];
  featureList.push(`产品类型：${mergedProfile.product_type}`);
  featureList.push(`品类：${mergedProfile.category}`);

  const featureLabels: Record<string, string> = {
    has_battery: "含电池", has_wireless: "含无线功能",
    is_children: "儿童产品", food_contact: "食品接触",
    wearable: "穿戴产品", medical: "医疗器械",
    electrical: "带电产品", contains_chemicals: "含化学成分",
    contains_magnets: "含磁铁", precision: "精密仪器",
    has_flammable: "易燃/压缩气体",
  };
  for (const [key, value] of Object.entries(mergedProfile)) {
    if (value === true && featureLabels[key]) {
      featureList.push(featureLabels[key]);
    }
  }
  if (mergedProfile.battery_capacity) {
    featureList.push(`电池容量：${mergedProfile.battery_capacity}mAh`);
  }

  // 4. 联网搜索补充合规信息
  const marketName = market === "US" ? "美国" : market === "EU" ? "欧盟" : market === "UK" ? "英国" : market === "JP" ? "日本" : market === "CA" ? "加拿大" : "澳洲";
  const searchQuery = `${mergedProfile.product_type} Amazon ${marketName} 合规认证要求`;
  let webResults: { title: string; url: string; snippet: string }[] = [];

  try {
    webResults = await searchCompliance(searchQuery);
  } catch (err) {
    console.warn("联网搜索失败，使用本地数据:", err);
  }

  // 5. 构建搜索结果的上下文（如果有）
  const searchContext = webResults.length > 0
    ? `\n\n联网搜索结果参考：\n${webResults.map((r, i) => `${i+1}. ${r.title}\n   ${r.snippet}\n   来源：${r.url}`).join("\n\n")}`
    : "";

  // 6. 调用 AI 诊断（加入搜索结果上下文）
  return callAI<DiagnosisResult>(
    "diagnose",
    DIAGNOSIS_PROMPT
      .replace("{productType}", mergedProfile.product_type)
      .replace("{productFeatures}", featureList.join("、"))
      .replace("{market}", marketName)
      .replace("{category}", category || mergedProfile.category),
    `请根据以下产品信息和联网搜索结果生成详细的合规诊断：

产品类型：${mergedProfile.product_type}
品类：${mergedProfile.category}
特征：${featureList.join("、")}
目标市场：${marketName}
${searchContext}

请特别注意该产品是否有以下特殊风险：
- 含锂电池：需要 UN38.3、MSDS、运输安全
- 儿童产品：CPSIA/CPC/ASTM F963/EN71
- 食品接触：FDA 21 CFR 或 EU 10/2011
- 医疗器械：FDA Class II / EU MDR
- 含磁铁：需要磁性强检测（15 CFR 1309）
- 易燃产品：DOT 运输认证
`
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
  if (!profile.product_type || !profile.product_type.trim()) {
    return false;
  }
  if (!market) {
    return false;
  }
  // 至少有一个特征被识别（不全是 null）
  const featureKeys = ["has_battery", "has_wireless", "is_children", "food_contact",
    "wearable", "medical", "electrical", "contains_chemicals", "contains_magnets",
    "precision", "has_flammable"] as const;
  const hasAnyFeature = featureKeys.some(key => (profile as Record<string, unknown>)[key] !== null);
  if (!hasAnyFeature) {
    return false; // 没有任何特征识别，说明产品信息可能太模糊
  }
  return true;
}
