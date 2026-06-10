export const siteConfig = {
  name: "合规猫",
  tagline: "亚马逊合规排查助手",
  description: "专业的亚马逊合规检查工具，帮助卖家快速排查产品合规风险，生成合规报告，支持申诉指导。",
  nav: [
    { label: "选品类", href: "/" },
    { label: "精细分类", href: "/category" },
    { label: "选市场", href: "/market" },
    { label: "看报告", href: "/report" },
    { label: "申诉/档案", href: "/appeal" },
  ],
};

export const productCategories = [
  { id: "electronics", label: "电子产品", icon: "🔌" },
  { id: "toys", label: "玩具", icon: "🧸" },
  { id: "baby", label: "母婴用品", icon: "🍼" },
  { id: "clothing", label: "服装鞋帽", icon: "👕" },
  { id: "beauty", label: "美容个护", icon: "💄" },
  { id: "home", label: "家居厨房", icon: "🏠" },
  { id: "sports", label: "运动户外", icon: "⚽" },
  { id: "auto", label: "汽车配件", icon: "🚗" },
  { id: "office", label: "办公用品", icon: "📎" },
  { id: "pet", label: "宠物用品", icon: "🐾" },
  { id: "food", label: "食品饮料", icon: "🍎" },
  { id: "health", label: "医疗健康", icon: "💊" },
  { id: "jewelry", label: "珠宝饰品", icon: "💍" },
  { id: "garden", label: "园艺户外", icon: "🌿" },
];

export const subCategories: Record<string, { id: string; label: string }[]> = {
  electronics: [
    { id: "phone-case", label: "手机壳/手机配件" },
    { id: "charger", label: "充电器/数据线" },
    { id: "headphone", label: "耳机/音箱" },
    { id: "smart-home", label: "智能家居" },
    { id: "camera", label: "相机/摄影" },
    { id: "computer", label: "电脑/平板配件" },
    { id: "smart-watch", label: "智能手表/手环" },
    { id: "power-bank", label: "充电宝" },
    { id: "led", label: "LED灯具/灯带" },
    { id: "adapter", label: "电源适配器" },
  ],
  toys: [
    { id: "plush", label: "毛绒玩具" },
    { id: "educational", label: "益智玩具" },
    { id: "outdoor-play", label: "户外玩具" },
    { id: "board-game", label: "桌游" },
    { id: "remote-control", label: "遥控玩具" },
  ],
  baby: [
    { id: "feeding", label: "喂养用品" },
    { id: "diaper", label: "尿不湿/纸尿裤" },
    { id: "stroller", label: "婴儿推车" },
    { id: "safety", label: "安全座椅" },
    { id: "nursery", label: "育儿用品" },
  ],
  clothing: [
    { id: "apparel", label: "服装" },
    { id: "shoes", label: "鞋类" },
    { id: "accessories", label: "配饰" },
    { id: "swimwear", label: "泳装" },
    { id: "uniform", label: "制服/工装" },
  ],
  beauty: [
    { id: "skincare", label: "护肤品" },
    { id: "cosmetics", label: "化妆品" },
    { id: "nail", label: "美甲产品" },
    { id: "hair-care", label: "护发产品" },
    { id: "fragrance", label: "香水" },
  ],
  home: [
    { id: "kitchen-tool", label: "厨房工具" },
    { id: "cookware", label: "锅具/餐具" },
    { id: "furniture", label: "家具" },
    { id: "lighting", label: "灯具" },
    { id: "decoration", label: "装饰品" },
  ],
  sports: [
    { id: "fitness", label: "健身器材" },
    { id: "camping", label: "露营装备" },
    { id: "cycling", label: "骑行装备" },
    { id: "water-sports", label: "水上运动" },
    { id: "protective", label: "护具" },
  ],
  auto: [
    { id: "interior", label: "汽车内饰" },
    { id: "exterior", label: "汽车外饰" },
    { id: "maintenance", label: "维修保养" },
    { id: "electronics-auto", label: "车载电子" },
  ],
  office: [
    { id: "stationery", label: "文具" },
    { id: "chair", label: "办公椅" },
    { id: "desk", label: "办公桌" },
    { id: "storage", label: "收纳" },
  ],
  pet: [
    { id: "dog-food", label: "狗粮/零食" },
    { id: "cat-food", label: "猫粮/零食" },
    { id: "pet-toy", label: "宠物玩具" },
    { id: "pet-bed", label: "宠物窝具" },
    { id: "pet-groom", label: "宠物美容" },
  ],
  food: [
    { id: "supplement", label: "膳食补充剂" },
    { id: "snack", label: "零食" },
    { id: "beverage", label: "饮品" },
    { id: "herbal", label: "草本茶" },
  ],
  health: [
    { id: "medical-device", label: "医疗器械" },
    { id: "massager", label: "按摩器" },
    { id: "oral-care", label: "口腔护理" },
    { id: "thermometer", label: "体温计" },
  ],
  jewelry: [
    { id: "necklace", label: "项链" },
    { id: "earring", label: "耳环" },
    { id: "bracelet", label: "手链" },
    { id: "ring", label: "戒指" },
    { id: "watch", label: "手表" },
    { id: "costume-jewelry", label: "时尚饰品" },
  ],
  garden: [
    { id: "tools", label: "园艺工具" },
    { id: "planters", label: "花盆/种植箱" },
    { id: "outdoor-furniture", label: "户外家具" },
    { id: "lighting-garden", label: "花园照明" },
    { id: "irrigation", label: "灌溉系统" },
    { id: "pesticide", label: "农药/除草剂" },
  ],
};

export const markets = [
  { id: "us", label: "美国 (US)", flag: "🇺🇸", description: "FDA, CPSC, FTC合规" },
  { id: "eu", label: "欧洲 (EU)", flag: "🇪🇺", description: "CE, REACH, RoHS合规" },
  { id: "uk", label: "英国 (UK)", flag: "🇬🇧", description: "UKCA, REACH UK合规" },
  { id: "jp", label: "日本 (JP)", flag: "🇯🇵", description: "PSE, TELEC合规" },
  { id: "ca", label: "加拿大 (CA)", flag: "🇨🇦", description: "Health Canada合规" },
  { id: "au", label: "澳大利亚 (AU)", flag: "🇦🇺", description: "ACMA, EESS合规" },
];

export const quickActions = [
  { id: "appeal", label: "申诉指导", icon: "🛡️", desc: "被下架？快速申诉" },
  { id: "archive", label: "合规档案", icon: "📁", desc: "我的产品记录" },
  { id: "news", label: "法规更新", icon: "📢", desc: "最新法规动态" },
];

// 品类×市场 联动合规数据
type Severity = "high" | "medium" | "low";

export interface ComplianceItem {
  name: string;
  required: boolean;
  desc: string;
  severity: Severity;
  action: string; // 整改建议
  estimatedTime: string;
  needsThirdParty: boolean;
}

// 品类维度的通用合规要求（跨市场）
interface CategoryCompliance {
  name: string;
  desc: string;
  items: ComplianceItem[];
}

// 品类级数据：不同品类在不同市场的差异
export const categoryComplianceData: Record<string, Record<string, ComplianceItem[]>> = {
  // 电子产品
  electronics: {
    us: [
      { name: "FCC 认证", required: true, desc: "所有电子产品的电磁兼容性测试，分为A类(工业)和B类(消费级)", severity: "high", action: "联系有资质的实验室进行FCC Part 15B测试", estimatedTime: "2-4周", needsThirdParty: true },
      { name: "UL 认证", required: false, desc: "电器产品安全认证（非强制但亚马逊推荐，提升转化率）", severity: "medium", action: "准备产品技术文档，联系UL或ETL实验室申请", estimatedTime: "3-6周", needsThirdParty: true },
      { name: "加州 Prop 65", required: true, desc: "含铅、邻苯二甲酸盐等有害物质的警告标签要求", severity: "medium", action: "确认产品成分，如有风险则添加Prop 65警告标签", estimatedTime: "1周", needsThirdParty: false },
      { name: "UL 2743 (锂电池)", required: false, desc: "含锂电池产品需符合UL 2743安全标准", severity: "medium", action: "联系电池供应商获取UN38.3测试报告", estimatedTime: "2-3周", needsThirdParty: true },
      { name: "CPSIA 儿童产品通知", required: false, desc: "如产品面向12岁以下儿童，需CPSIA合规", severity: "high", action: "确认目标年龄，如为儿童产品则需CPSC认可的实验室检测", estimatedTime: "3-6周", needsThirdParty: true },
    ],
    eu: [
      { name: "CE 标志", required: true, desc: "欧盟市场强制安全认证标志，需符合LVD/EMC指令", severity: "high", action: "准备技术文档(EC Declaration of Conformity)，进行CE符合性评估", estimatedTime: "2-4周", needsThirdParty: true },
      { name: "RoHS 指令", required: true, desc: "电子电气设备中有害物质限制（铅、汞、镉等）", severity: "high", action: "向供应商索取材料成分声明，第三方实验室检测", estimatedTime: "2-3周", needsThirdParty: true },
      { name: "REACH 法规", required: true, desc: "化学品注册、评估、授权和限制，SVHC高关注物质", severity: "high", action: "确认产品中无SVHC物质，或已在欧盟注册", estimatedTime: "1-2周", needsThirdParty: true },
      { name: "WEEE 指令", required: true, desc: "废弃电子电气设备回收要求，需在销售国注册", severity: "medium", action: "在目标销售国进行WEEE注册号注册", estimatedTime: "1-2周", needsThirdParty: false },
      { name: "EU 电池法规", required: false, desc: "含电池产品需符合新电池法规（碳足迹声明等）", severity: "medium", action: "联系电池供应商获取电池法规合规文件", estimatedTime: "2-3周", needsThirdParty: true },
      { name: "欧盟授权代表 (EC REP)", required: true, desc: "CE认证需在欧盟境内指定授权代表", severity: "high", action: "联系欧洲的授权代表服务机构", estimatedTime: "1-2周", needsThirdParty: false },
    ],
    uk: [
      { name: "UKCA 标志", required: true, desc: "英国市场强制安全认证标志（替代CE，北爱尔兰例外）", severity: "high", action: "确认产品符合UKCA要求，准备UK Declaration of Conformity", estimatedTime: "2-4周", needsThirdParty: true },
      { name: "UK RoHS", required: true, desc: "英国有害物质限制法规", severity: "high", action: "同欧盟RoHS要求，单独向UK当局申请", estimatedTime: "2-3周", needsThirdParty: true },
      { name: "UK 授权代表", required: true, desc: "英国境内需指定授权代表", severity: "high", action: "联系英国的授权代表服务机构", estimatedTime: "1-2周", needsThirdParty: false },
    ],
    jp: [
      { name: "PSE 认证", required: true, desc: "电气用品安全法强制认证，分A类(菱形PSE)和B类(圆形PSE)", severity: "high", action: "联系日本JQA或PSE认可实验室申请认证", estimatedTime: "3-6周", needsThirdParty: true },
      { name: "TELEC 认证", required: true, desc: "无线设备技术基准认证（蓝牙/WiFi产品必须）", severity: "high", action: "联系日本ITEI或TELEC认可实验室", estimatedTime: "2-4周", needsThirdParty: true },
      { name: "VCCI 电磁兼容", required: false, desc: "日本电磁兼容自愿性认证（B类设备）", severity: "medium", action: "在日本实验室进行VCCI测试", estimatedTime: "2-4周", needsThirdParty: true },
    ],
    ca: [
      { name: "IC 认证", required: true, desc: "加拿大工业部认证，无线设备需要", severity: "high", action: "联系IC认可实验室进行认证测试", estimatedTime: "2-4周", needsThirdParty: true },
      { name: "CEC 能效认证", required: false, desc: "加拿大能效认证（电源适配器、充电器等）", severity: "medium", action: "在CEC官网注册产品，提供测试报告", estimatedTime: "1-2周", needsThirdParty: true },
    ],
    au: [
      { name: "RCM 标志", required: true, desc: "澳大利亚-新西兰合规标志（Electrical Safety + EMC）", severity: "high", action: "向澳大利亚当局申请RCM注册", estimatedTime: "3-6周", needsThirdParty: true },
      { name: "EESS 能效注册", required: false, desc: "电气设备和能源效率注册", severity: "medium", action: "在EESS平台注册产品", estimatedTime: "1-2周", needsThirdParty: true },
    ],
  },

  // 玩具
  toys: {
    us: [
      { name: "CPSIA 儿童产品证书 (CPC)", required: true, desc: "12岁以下儿童产品必须，需由CPSC认可实验室检测", severity: "high", action: "送样至CPSC认可实验室进行CPC检测", estimatedTime: "3-6周", needsThirdParty: true },
      { name: "ASTM F963 玩具安全标准", required: true, desc: "物理机械性能、燃烧性能、化学性能检测", severity: "high", action: "确认产品无小零件脱落风险，进行ASTM F963全套测试", estimatedTime: "3-6周", needsThirdParty: true },
      { name: "CPSC 追溯标签", required: true, desc: "产品需有永久追溯标签（生产日期、批次、制造商信息）", severity: "high", action: "在产品/包装上添加永久性追溯标签", estimatedTime: "1周", needsThirdParty: false },
      { name: "铅含量测试", required: true, desc: "表面涂层铅含量≤90ppm，基材铅含量≤100ppm", severity: "high", action: "第三方实验室进行铅含量检测", estimatedTime: "2-3周", needsThirdParty: true },
    ],
    eu: [
      { name: "EN 71 全套测试", required: true, desc: "玩具安全欧洲标准（1物理2燃烧3化学）", severity: "high", action: "送样至欧盟认可实验室进行EN 71测试", estimatedTime: "3-6周", needsThirdParty: true },
      { name: "CE 标志 (玩具)", required: true, desc: "玩具强制CE认证，含机械、易燃、化学测试", severity: "high", action: "完成CE符合性评估，准备技术文档", estimatedTime: "3-6周", needsThirdParty: true },
      { name: "REACH SVHC", required: true, desc: "玩具材料不得含SVHC高关注物质", severity: "high", action: "材料供应商提供REACH合规声明", estimatedTime: "1-2周", needsThirdParty: true },
      { name: "欧盟授权代表", required: true, desc: "玩具CE认证需欧盟授权代表", severity: "high", action: "联系授权代表服务机构", estimatedTime: "1-2周", needsThirdParty: false },
    ],
    uk: [
      { name: "UKCA 玩具认证", required: true, desc: "英国玩具强制认证（替代CE）", severity: "high", action: "完成UKCA符合性评估", estimatedTime: "3-6周", needsThirdParty: true },
      { name: "UK Toy Safety Regs", required: true, desc: "英国玩具安全法规，基于EN71标准", severity: "high", action: "同EN71测试，额外确认UK法规要求", estimatedTime: "3-6周", needsThirdParty: true },
    ],
    jp: [
      { name: "JIS T 8101 玩具安全标准", required: true, desc: "日本玩具安全标准，含物理、化学、电气测试", severity: "high", action: "日本国内实验室进行JIS测试", estimatedTime: "3-6周", needsThirdParty: true },
      { name: "食品卫生法 (涂色玩具)", required: false, desc: "可能入口的玩具（如婴儿牙胶）需符合食品卫生法", severity: "medium", action: "确认产品是否属于入口玩具，如是则申请卫生法许可", estimatedTime: "2-4周", needsThirdParty: true },
    ],
    ca: [
      { name: "Canada CCPSA 合规", required: true, desc: "消费品安全法案，玩具需符合CCPSA要求", severity: "high", action: "完成CCPSA合规评估，准备技术文件", estimatedTime: "2-4周", needsThirdParty: true },
    ],
    au: [
      { name: "AS/NZS 8124 玩具安全", required: true, desc: "澳新玩具安全标准", severity: "high", action: "送样至澳认可实验室测试", estimatedTime: "3-6周", needsThirdParty: true },
    ],
  },

  // 母婴用品
  baby: {
    us: [
      { name: "CPSIA 儿童产品证书", required: true, desc: "如产品面向12岁以下儿童，必须CPC", severity: "high", action: "送样至CPSC认可实验室检测", estimatedTime: "3-6周", needsThirdParty: true },
      { name: "CPC 奶嘴/安抚奶嘴 FDA", required: true, desc: "安抚奶嘴需FDA合规", severity: "high", action: "确认材料为食品级硅胶/塑料", estimatedTime: "2-3周", needsThirdParty: true },
      { name: "防窒息设计验证", required: true, desc: "婴儿推车、安全座椅需通过防窒息测试", severity: "high", action: "确认产品设计符合ASTM F833标准", estimatedTime: "2-4周", needsThirdParty: true },
    ],
    eu: [
      { name: "EN 1888 婴儿推车标准", required: true, desc: "婴儿推车欧洲安全标准", severity: "high", action: "送样测试", estimatedTime: "3-6周", needsThirdParty: true },
      { name: "EN 71 玩具类母婴用品", required: true, desc: "可入口/接触皮肤的母婴用品需EN71化学测试", severity: "high", action: "材料供应商提供REACH/EN71合规声明", estimatedTime: "2-3周", needsThirdParty: true },
      { name: "食品级接触材料 (FDA/EU 10/2011)", required: true, desc: "奶瓶、餐盘等需食品级认证", severity: "high", action: "确认材料符合EU 10/2011食品级标准", estimatedTime: "2-4周", needsThirdParty: true },
    ],
  },

  // 服装鞋帽
  clothing: {
    us: [
      { name: "CPSIA 儿童服装", required: false, desc: "儿童服装需含铅量测试（如面向12岁以下）", severity: "high", action: "面料供应商提供CPSIA铅含量检测报告", estimatedTime: "2-3周", needsThirdParty: true },
      { name: "Flammability 阻燃测试", required: true, desc: "儿童睡衣需通过阻燃测试(16 CFR 1610/1615/1616)", severity: "high", action: "确认面料阻燃等级", estimatedTime: "1-2周", needsThirdParty: true },
      { name: "FTC 纺织标签", required: true, desc: "纤维成分、原产地、洗涤说明标签合规", severity: "medium", action: "确认洗水标/成分标符合FTC要求", estimatedTime: "1周", needsThirdParty: false },
      { name: "Prop 65", required: false, desc: "鞋类可能含邻苯二甲酸盐需警告", severity: "medium", action: "材料供应商提供Prop 65合规证明", estimatedTime: "1周", needsThirdParty: false },
    ],
    eu: [
      { name: "REACH 纺织品合规", required: true, desc: "纺织品染料和助剂需符合REACH", severity: "high", action: "面料供应商提供REACH合规声明", estimatedTime: "1-2周", needsThirdParty: false },
      { name: "欧盟纺织品标签法规", required: true, desc: "纤维成分、原产地标识", severity: "medium", action: "确认标签格式符合EU 1007/2011", estimatedTime: "1周", needsThirdParty: false },
    ],
  },

  // 美容个护
  beauty: {
    us: [
      { name: "FDA 化妆品注册", required: true, desc: "化妆品工厂需FDA注册，成分需符合法规", severity: "high", action: "在FDA官网注册工厂，准备成分清单", estimatedTime: "1-2周", needsThirdParty: false },
      { name: "MLR 化妆品通报", required: true, desc: "加州化妆品通报法规(MoCRA)", severity: "medium", action: "确认产品符合MoCRA要求", estimatedTime: "1-2周", needsThirdParty: false },
      { name: "Prop 65", required: false, desc: "化妆品可能含需警告的成分", severity: "medium", action: "确认产品不含Prop 65限制成分或添加警告标签", estimatedTime: "1周", needsThirdParty: false },
    ],
    eu: [
      { name: "EU 1223/2009 化妆品法规", required: true, desc: "欧盟化妆品注册和成分要求", severity: "high", action: "准备产品安全报告(PSR)和CPNP通报", estimatedTime: "2-4周", needsThirdParty: true },
      { name: "GMP ISO 22716", required: true, desc: "化妆品生产质量管理标准", severity: "high", action: "确认工厂通过GMP认证", estimatedTime: "2-4周", needsThirdParty: true },
    ],
  },

  // 家居厨房
  home: {
    us: [
      { name: "FDA 食品接触材料", required: true, desc: "锅具、餐具、厨房工具需FDA食品级认证", severity: "high", action: "确认材料为食品级（不锈钢304、硅胶等）", estimatedTime: "2-3周", needsThirdParty: true },
      { name: "Prop 65", required: false, desc: "厨具可能含重金属（如铸铁锅）", severity: "medium", action: "确认材料成分，必要时添加警告标签", estimatedTime: "1周", needsThirdParty: false },
    ],
    eu: [
      { name: "EU 10/2011 食品接触材料", required: true, desc: "欧盟食品级接触材料法规", severity: "high", action: "材料供应商提供EU 10/2011合规声明", estimatedTime: "1-2周", needsThirdParty: true },
      { name: "REACH 材料合规", required: true, desc: "家居产品材料需符合REACH", severity: "high", action: "确认材料无SVHC物质", estimatedTime: "1-2周", needsThirdParty: true },
    ],
  },

  // 运动户外
  sports: {
    us: [
      { name: "CPSIA (儿童运动装备)", required: false, desc: "儿童运动装备需CPC", severity: "high", action: "确认目标年龄，如为儿童产品需CPC", estimatedTime: "3-6周", needsThirdParty: true },
      { name: "ASTM 运动装备标准", required: false, desc: "不同运动装备有不同ASTM安全标准", severity: "medium", action: "确认具体ASTM标准", estimatedTime: "2-4周", needsThirdParty: true },
    ],
    eu: [
      { name: "EN 13844 运动装备", required: true, desc: "欧洲运动装备安全标准", severity: "medium", action: "送样至EU认可实验室测试", estimatedTime: "2-4周", needsThirdParty: true },
    ],
  },

  // 汽车配件
  auto: {
    us: [
      { name: "DOT 认证", required: true, desc: "美国交通部认证（车灯、轮胎等）", severity: "high", action: "向NHTSA申请DOT认证", estimatedTime: "4-8周", needsThirdParty: true },
      { name: "SAE 标准", required: false, desc: "汽车工程师学会标准（非强制但推荐）", severity: "medium", action: "确认产品符合SAE标准", estimatedTime: "2-4周", needsThirdParty: true },
    ],
    eu: [
      { name: "ECE R 认证", required: true, desc: "欧盟汽车安全认证（车灯、轮胎等）", severity: "high", action: "联系E-mark认证机构", estimatedTime: "4-8周", needsThirdParty: true },
    ],
  },

  // 办公用品
  office: {
    us: [
      { name: "CPSIA (儿童文具)", required: false, desc: "面向儿童的产品需CPC", severity: "high", action: "确认目标年龄", estimatedTime: "2-3周", needsThirdParty: true },
    ],
    eu: [
      { name: "EN 71 (儿童文具)", required: true, desc: "儿童文具需符合EN71化学安全", severity: "high", action: "送样至EU实验室测试", estimatedTime: "2-3周", needsThirdParty: true },
    ],
  },

  // 宠物用品
  pet: {
    us: [
      { name: "FDA 宠物食品", required: true, desc: "宠物食品需FDA合规", severity: "high", action: "确认食品级标准，进行营养成分测试", estimatedTime: "2-4周", needsThirdParty: true },
      { name: "AAFCO 宠物食品标准", required: true, desc: "美国饲料管理协会标准", severity: "medium", action: "确认产品符合AAFCO营养标准", estimatedTime: "2-4周", needsThirdParty: true },
    ],
    eu: [
      { name: "FEFANA 宠物食品", required: true, desc: "欧洲宠物食品工业联合会标准", severity: "medium", action: "确认产品符合FEFANA标准", estimatedTime: "2-4周", needsThirdParty: true },
    ],
  },

  // 食品饮料
  food: {
    us: [
      { name: "FDA 食品注册", required: true, desc: "所有进口食品工厂需在FDA注册", severity: "high", action: "在FDA官网进行食品 facility registration", estimatedTime: "1-2周", needsThirdParty: false },
      { name: "FSMA 食品安全", required: true, desc: "食品安全现代化法案合规", severity: "high", action: "准备食品安全计划", estimatedTime: "2-4周", needsThirdParty: true },
    ],
    eu: [
      { name: "EU 178/2002 食品安全", required: true, desc: "欧盟食品安全通用法规", severity: "high", action: "准备HACCP计划、追溯体系", estimatedTime: "2-4周", needsThirdParty: true },
    ],
  },

  // 医疗健康
  health: {
    us: [
      { name: "FDA 医疗器械注册", required: true, desc: "医疗器械需按Class I/II/III注册", severity: "high", action: "确认产品分类，进行510(k)或De Novo申请", estimatedTime: "4-12周", needsThirdParty: true },
      { name: "FDA 21 CFR Part 820", required: true, desc: "医疗器械质量管理规范", severity: "high", action: "建立符合Part 820的质量管理体系", estimatedTime: "4-8周", needsThirdParty: true },
      { name: "UL 医用电器", required: false, desc: "UL 2601-1医用电气设备安全标准", severity: "medium", action: "联系UL进行医用电器安全测试", estimatedTime: "4-8周", needsThirdParty: true },
    ],
    eu: [
      { name: "MDR 医疗器械法规", required: true, desc: "欧盟医疗器械法规2017/745", severity: "high", action: "联系欧盟公告机构进行MDR认证", estimatedTime: "6-12周", needsThirdParty: true },
      { name: "CE 医疗器械认证", required: true, desc: "医疗器械强制CE认证", severity: "high", action: "准备技术文档、临床评估", estimatedTime: "6-12周", needsThirdParty: true },
    ],
  },

  // 珠宝饰品
  jewelry: {
    us: [
      { name: "FTC 珠宝标签", required: true, desc: "贵金属纯度标识（如14K、18K、925银）", severity: "medium", action: "确保标签标注准确的金属纯度", estimatedTime: "1周", needsThirdParty: false },
      { name: "Prop 65 铅镉检测", required: false, desc: "饰品可能含铅镉等重金属，需警告标签或合规", severity: "medium", action: "进行重金属含量检测，如有风险则添加 Prop 65 警告", estimatedTime: "1-2周", needsThirdParty: true },
    ],
    eu: [
      { name: "EU 镍释放测试", required: true, desc: "饰品接触皮肤部分镍释放量受限", severity: "high", action: "进行EN 1811镍释放量测试", estimatedTime: "1-2周", needsThirdParty: true },
      { name: "REACH 重金属限制", required: true, desc: "饰品材料需符合REACH重金属限制", severity: "high", action: "供应商提供材料合规声明", estimatedTime: "1周", needsThirdParty: false },
    ],
  },

  // 园艺户外
  garden: {
    us: [
      { name: "EPA 农药注册", required: true, desc: "杀虫剂/除草剂/杀菌剂需EPA注册", severity: "high", action: "向EPA提交农药产品注册申请", estimatedTime: "4-12周", needsThirdParty: true },
      { name: "Prop 65 园艺化学品", required: false, desc: "土壤/肥料可能含重金属需警告", severity: "medium", action: "检测土壤/肥料成分", estimatedTime: "1-2周", needsThirdParty: true },
    ],
    eu: [
      { name: "EU 1107/2009 农药法规", required: true, desc: "植物保护产品需EU批准", severity: "high", action: "向ECHA申请授权", estimatedTime: "8-16周", needsThirdParty: true },
      { name: "REACH 园艺化学品", required: true, desc: "园艺产品材料需符合REACH", severity: "high", action: "确认材料无SVHC物质", estimatedTime: "1-2周", needsThirdParty: true },
    ],
  },
};
