// localStorage 数据持久化

export interface ReportRecord {
  id: string;
  productType: string;
  market: string;
  profile: Record<string, unknown>;
  diagnosis: Record<string, unknown>;
  timestamp: number;
}

const STORAGE_KEY = "compliance_cat_history";
const MAX_HISTORY = 50;

export const store = {
  /**
   * 保存诊断报告到历史
   */
  saveReport(record: Omit<ReportRecord, "id" | "timestamp">): ReportRecord {
    const history = this.getHistory();
    const newRecord: ReportRecord = {
      ...record,
      id: `report_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      timestamp: Date.now(),
    };
    history.unshift(newRecord);
    // 最多保留 50 条
    while (history.length > MAX_HISTORY) {
      history.pop();
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch {
      console.warn("localStorage 写入失败，可能存储空间不足");
    }
    return newRecord;
  },

  /**
   * 获取历史记录
   */
  getHistory(): ReportRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  /**
   * 获取单条记录
   */
  getRecord(id: string): ReportRecord | undefined {
    return this.getHistory().find((r) => r.id === id);
  },

  /**
   * 删除记录
   */
  deleteRecord(id: string): void {
    const history = this.getHistory().filter((r) => r.id !== id);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch {
      console.warn("localStorage 删除失败");
    }
  },

  /**
   * 清空所有历史
   */
  clearHistory(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // silent
    }
  },

  /**
   * 删除过期记录（超过 90 天）
   */
  cleanupExpired(): void {
    const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;
    const history = this.getHistory().filter((r) => r.timestamp > ninetyDaysAgo);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch {
      // silent
    }
  },
};
