export const env = {
  appName: (import.meta.env.VITE_APP_NAME as string) || "合规猫",
  apiBaseUrl: ((import.meta.env.VITE_API_BASE_URL as string) || "").trim(),
  isApiAvailable(): boolean {
    return this.apiBaseUrl.length > 0;
  },
};
