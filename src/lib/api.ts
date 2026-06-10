import { env } from "./env";

export function createApiClient() {
  const base = env.apiBaseUrl;

  return {
    async get<T>(path: string): Promise<T> {
      if (!base) {
        throw new Error("API 未配置，请先设置 VITE_API_BASE_URL 环境变量");
      }
      const url = path.startsWith("http") ? path : `${base}${path}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`API 错误: ${response.status} ${response.statusText}`);
      return response.json() as Promise<T>;
    },
    async post<T>(path: string, body: unknown): Promise<T> {
      if (!base) {
        throw new Error("API 未配置，请先设置 VITE_API_BASE_URL 环境变量");
      }
      const url = path.startsWith("http") ? path : `${base}${path}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error(`API 错误: ${response.status} ${response.statusText}`);
      return response.json() as Promise<T>;
    },
  };
}

// 全局单例
export const api = createApiClient();
