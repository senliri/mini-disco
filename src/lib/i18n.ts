// 多语言翻译字典

export const translations = {
  zh: {
    appName: '合规猫',
    appDesc: '亚马逊卖家合规助手',
    nav: {
      home: '首页',
      report: '合规报告',
      appeal: '申诉助手',
    },
    home: {
      title: 'AI 合规诊断',
      subtitle: '输入产品描述，自动识别认证要求',
      placeholder: '描述你的产品，例如：蓝牙耳机、儿童玩具、食品保鲜盒...',
      examples: ['蓝牙耳机', '儿童瑜伽垫', '不锈钢水杯', 'LED 台灯'],
      aiDesc: '合规猫将根据您的产品描述，自动匹配目标市场法规并生成合规报告',
    },
    report: {
      title: '合规报告',
      smartRec: 'AI 推荐',
      categories: '品类要求',
      warnings: '风险警告',
      actionPlan: '整改建议',
      exportPdf: '导出 PDF',
      noData: '请选择产品品类或输入描述获取 AI 诊断',
      riskHigh: '高风险',
      riskMedium: '中等风险',
      riskLow: '低风险',
      priority: '优先级',
      suggested: '建议办理',
      optional: '可选',
    },
    appeal: {
      title: '申诉助手',
      generate: 'AI 生成申诉信',
      copy: '复制 POA',
      productType: '产品类型',
      reason: '下架原因',
      actions: '已采取措施',
      generating: '生成中...',
      noData: '请输入产品信息开始申诉',
    },
    common: {
      loading: '加载中...',
      error: '出错了',
      retry: '重试',
      copy: '复制',
      copied: '已复制',
      search: '搜索...',
      selecting: '选择中',
      recommended: '推荐',
    },
    language: '语言',
  },
  en: {
    appName: 'Compliance Cat',
    appDesc: 'Amazon Seller Compliance Assistant',
    nav: {
      home: 'Home',
      report: 'Report',
      appeal: 'Appeal',
    },
    home: {
      title: 'AI Compliance Diagnosis',
      subtitle: 'Enter product description, auto-match certification requirements',
      placeholder: 'Describe your product, e.g. Bluetooth headphones, kids toys, food containers...',
      examples: ['Bluetooth Headphones', 'Kids Yoga Mat', 'Stainless Steel Cup', 'LED Desk Lamp'],
      aiDesc: 'Compliance Cat will auto-match regulations and generate a compliance report for your product',
    },
    report: {
      title: 'Compliance Report',
      smartRec: 'AI Recommendations',
      categories: 'Category Requirements',
      warnings: 'Risk Warnings',
      actionPlan: 'Action Plan',
      exportPdf: 'Export PDF',
      noData: 'Select a product category or enter a description for AI diagnosis',
      riskHigh: 'High Risk',
      riskMedium: 'Medium Risk',
      riskLow: 'Low Risk',
      priority: 'Priority',
      suggested: 'Recommended',
      optional: 'Optional',
    },
    appeal: {
      title: 'Appeal Assistant',
      generate: 'AI Generate POA',
      copy: 'Copy POA',
      productType: 'Product Type',
      reason: 'Removal Reason',
      actions: 'Actions Taken',
      generating: 'Generating...',
      noData: 'Enter product info to start appeal',
    },
    common: {
      loading: 'Loading...',
      error: 'Error',
      retry: 'Retry',
      copy: 'Copy',
      copied: 'Copied',
      search: 'Search...',
      selecting: 'Selecting',
      recommended: 'Recommended',
    },
    language: 'Language',
  },
};

export type Locale = keyof typeof translations;

export function t(locale: Locale, path: string): string {
  const keys = path.split('.');
  let obj: any = translations[locale];
  for (const k of keys) {
    obj = obj?.[k];
    if (obj === undefined) return path;
  }
  return obj;
}
