import { type ComplianceItem } from "../data/site";

export interface RecommendationItem extends ComplianceItem {
  reason: string; // 为什么推荐这个
  confidence: "high" | "medium" | "low";
  estimatedCost: string; // 预估费用
  priorityLabel: string;
}

// 子品类关键词 → 合规特征映射
interface ProductProfile {
  hasBattery: boolean;
  hasWireless: boolean;
  isChildrenProduct: boolean;
  foodContact: boolean;
  wearable: boolean;
  medical: boolean;
  outdoor: boolean;
  containsChemicals: boolean;
  electrical: boolean;
  precision: boolean;
  importRate: "high" | "medium" | "low";
}

// 根据品类和子品类推断产品特征
export function inferProductProfile(catId: string, subId: string): ProductProfile {
  const batteryKeywords = ["charger", "power", "battery", "headphone", "smart-home", "computer", "camera", "electronics-auto"];
  const wirelessKeywords = ["headphone", "smart-home", "camera", "charger"];
  const childrenKeywords = ["toys", "baby", "educational", "plush", "feeding", "diaper", "safety", "nursery"];
  const foodContactKeywords = ["cookware", "kitchen-tool", "feeding", "cookware", "supplement", "snack", "beverage"];
  const wearableKeywords = ["apparel", "shoes", "accessories", "swimwear", "protective", "cosmetics", "skincare", "hair-care"];
  const medicalKeywords = ["massager", "thermometer", "medical-device", "oral-care"];
  const outdoorKeywords = ["camping", "cycling", "water-sports", "sports", "outdoor-play"];
  const chemicalKeywords = ["cosmetics", "skincare", "fragrance", "nail", "herbal", "supplement", "health"];

  return {
    hasBattery: batteryKeywords.includes(subId) || batteryKeywords.some(k => catId.includes(k)),
    hasWireless: wirelessKeywords.includes(subId),
    isChildrenProduct: childrenKeywords.includes(subId) || childrenKeywords.some(k => catId.includes(k)),
    foodContact: foodContactKeywords.includes(subId),
    wearable: wearableKeywords.includes(subId),
    medical: medicalKeywords.includes(subId),
    outdoor: outdoorKeywords.includes(subId),
    containsChemicals: chemicalKeywords.includes(subId),
    electrical: ["electronics", "computer", "charger", "headphone", "smart-home", "camera", "electronics-auto"].includes(catId) || 
                 ["charger", "headphone", "smart-home", "computer", "camera"].includes(subId),
    precision: ["thermometer", "medical-device", "massager", "camera"].includes(subId),
    importRate: ["auto", "pet", "food", "health"].includes(catId) ? "high" : 
                ["electronics", "toys", "beauty", "home"].includes(catId) ? "high" : "medium",
  };
}

// 智能推荐算法
export function generateRecommendations(
  complianceData: ComplianceItem[],
  marketId: string,
  profile: ProductProfile,
  catId?: string
): RecommendationItem[] {
  if (complianceData.length === 0) return [];

  const recommendations: RecommendationItem[] = [];

  for (const item of complianceData) {
    let reasons: string[] = [];
    let confidence: "high" | "medium" | "low" = "medium";
    let estimatedCost = "¥0 - ¥5,000";

    // 根据产品特征补充推荐理由
    if (item.name.includes("FCC") && (profile.electrical || profile.hasBattery)) {
      reasons.push("电子产品/含电池产品需要 FCC 电磁兼容性认证");
      confidence = "high";
      estimatedCost = "¥3,000 - ¥15,000";
    } else if (item.name.includes("CE") && profile.electrical) {
      reasons.push("电子类产品进入欧洲市场必须通过 CE 认证");
      confidence = "high";
      estimatedCost = "¥5,000 - ¥20,000";
    } else if (item.name.includes("CE") && profile.outdoor) {
      reasons.push("运动户外产品在欧盟销售需要 CE 安全认证");
      confidence = "medium";
      estimatedCost = "¥2,000 - ¥10,000";
    } else if (item.name.includes("CPSIA") && profile.isChildrenProduct) {
      reasons.push("儿童产品必须通过 CPSIA 检测，这是亚马逊强制要求");
      confidence = "high";
      estimatedCost = "¥5,000 - ¥25,000";
    } else if (item.name.includes("PSE") && (profile.electrical || profile.hasBattery)) {
      reasons.push("日本市场对电子产品强制 PSE 认证，含锂电池需菱形 PSE");
      confidence = "high";
      estimatedCost = "¥8,000 - ¥30,000";
    } else if (item.name.includes("FDA") && (profile.foodContact || profile.containsChemicals || profile.medical)) {
      reasons.push(profile.foodContact ? "食品接触材料需要 FDA 食品级认证" : 
                   profile.medical ? "医疗器械/健康产品需要 FDA 注册" : 
                   "含化学成分的产品可能需要 FDA 合规");
      confidence = profile.foodContact || profile.medical ? "high" : "medium";
      estimatedCost = "¥2,000 - ¥20,000";
    } else if (item.name.includes("RoHS") && profile.electrical) {
      reasons.push("欧盟 RoHS 限制电子产品中的有害物质");
      confidence = "high";
      estimatedCost = "¥2,000 - ¥8,000";
    } else if (item.name.includes("REACH") && (profile.containsChemicals || profile.foodContact)) {
      reasons.push("含化学成分的产品在欧盟销售需符合 REACH 法规");
      confidence = profile.containsChemicals ? "high" : "medium";
      estimatedCost = "¥1,000 - ¥5,000";
    } else if (item.name.includes("UKCA") && (profile.electrical || profile.isChildrenProduct)) {
      reasons.push("英国脱欧后独立认证体系，电子产品和儿童产品必须 UKCA");
      confidence = "high";
      estimatedCost = "¥5,000 - ¥20,000";
    } else if (item.name.includes("RCM") && profile.electrical) {
      reasons.push("澳大利亚电气安全 RCM 认证是进口电子产品的强制要求");
      confidence = "high";
      estimatedCost = "¥5,000 - ¥15,000";
    } else if (item.name.includes("ASTM") && profile.isChildrenProduct) {
      reasons.push("儿童产品物理安全 ASTM F963 测试是 Amazon 强制要求");
      confidence = "high";
      estimatedCost = "¥3,000 - ¥10,000";
    } else if (item.name.includes("EN 71") && profile.isChildrenProduct) {
      reasons.push("欧盟儿童产品 EN71 玩具安全标准是强制性要求");
      confidence = "high";
      estimatedCost = "¥5,000 - ¥20,000";
    } else if (item.name.includes("TELEC") && profile.hasWireless) {
      reasons.push("日本无线设备 TELEC 认证是蓝牙/WiFi 产品强制要求");
      confidence = "high";
      estimatedCost = "¥5,000 - ¥15,000";
    } else if (item.name.includes("WEEE") && profile.electrical) {
      reasons.push("欧盟电子废弃物回收 WEEE 注册是销售前的必要步骤");
      confidence = "medium";
      estimatedCost = "¥1,000 - ¥3,000";
    } else if (item.name.includes("Prop 65") && profile.importRate === "high") {
      reasons.push("加州 Prop 65 对进口产品适用，需确认是否含有受限物质");
      confidence = "medium";
      estimatedCost = "¥500 - ¥3,000";
    } else if (item.name.includes("UL 2743") && profile.hasBattery) {
      reasons.push("锂电池产品 UL 2743 安全认证可降低事故风险");
      confidence = "medium";
      estimatedCost = "¥5,000 - ¥15,000";
    } else if (item.name.includes("IC") && (profile.hasBattery || profile.hasWireless)) {
      reasons.push("加拿大 IC 认证针对无线/电池产品是强制要求");
      confidence = "high";
      estimatedCost = "¥3,000 - ¥10,000";
    } else if (item.name.includes("EESS") && profile.electrical) {
      reasons.push("澳大利亚 EESS 能效注册是电子产品销售前提");
      confidence = "medium";
      estimatedCost = "¥1,000 - ¥3,000";
    } else if (item.name.includes("MDR") && profile.medical) {
      reasons.push("欧盟医疗器械 MDR 认证是医疗健康类产品强制要求");
      confidence = "high";
      estimatedCost = "¥20,000 - ¥100,000";
    } else if (item.name.includes("FDA 食品") && profile.foodContact) {
      reasons.push("进口食品/膳食补充剂需要 FDA 工厂注册");
      confidence = "high";
      estimatedCost = "¥2,000 - ¥10,000";
    } else if (item.name.includes("AAFCO") && (catId === "pet" || catId === "food" || catId === "food")) {
      reasons.push("宠物食品需符合 AAFCO 营养标准");
      confidence = "high";
      estimatedCost = "¥3,000 - ¥10,000";
    }

    // 通用推荐逻辑
    if (reasons.length === 0) {
      if (item.required) {
        reasons.push(`${item.name} 是 ${marketId === "us" ? "美国" : marketId === "eu" ? "欧盟" : marketId === "uk" ? "英国" : marketId === "jp" ? "日本" : marketId === "ca" ? "加拿大" : "澳洲"}市场的基础合规要求`);
        confidence = "medium";
      } else {
        reasons.push(`${item.name} 建议根据产品实际情况评估`);
        confidence = "low";
      }
    }

    recommendations.push({
      ...item,
      reason: reasons.join("；"),
      confidence,
      estimatedCost,
      priorityLabel: confidence === "high" ? "🔴 优先处理" : confidence === "medium" ? "🟡 建议处理" : "🟢 可选处理",
    });
  }

  // 按优先级排序：高优先级在前，同优先级按 severity
  const severityOrder = { high: 0, medium: 1, low: 2 };
  const confidenceOrder = { high: 0, medium: 1, low: 2 };
  recommendations.sort((a, b) => {
    const confDiff = confidenceOrder[a.confidence] - confidenceOrder[b.confidence];
    if (confDiff !== 0) return confDiff;
    return severityOrder[a.severity] - severityOrder[b.severity];
  });

  return recommendations;
}
