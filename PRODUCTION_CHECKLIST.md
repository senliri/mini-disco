# Compliance Cat - 生产部署前综合检查清单

## 🔴 严重问题 (必须修复)

### 1. Vercel Serverless Functions 格式
- [x] 所有 API 函数已统一为 ES Module 格式 (`export default`)

### 2. 环境变量配置
- [ ] Vercel 项目需要配置以下环境变量：
  - `AGNES_API_KEY` (Agnes AI API Key)
  - `AGNES_API_URL` (可选，默认 https://apihub.agnes-ai.com/v1/chat/completions)
  - `AGNES_MODEL` (可选，默认 agnes-2.0-flash)
  - `AUTH_PASSWORD` (生产环境访问密码)

### 3. 功能测试
- [ ] Appeal 页面 AI 生成功能 (需要 `/api/chat` 正常工作)
- [ ] Feedback 提交功能 (需要 `/api/feedback` 正常工作)
- [ ] 诊断功能中的 AI 调用 (需要 `/api/chat` 正常工作)

## 🟡 中等问题 (建议修复)

### 4. 代码质量问题
- [x] Netlify 函数引用已替换
- [x] vercel.json 格式已修复
- [x] package.json 依赖分类已修正
- [x] has_battery 关键词过宽问题已修复

### 5. 类型安全
- [x] `agent.ts` 市场名称映射表已优化
- [ ] 检查 `Report.tsx` 中的 `marketId` 类型处理

### 6. 用户体验
- [x] 缓存 TTL 从 24h 调整为 12h
- [ ] 加载状态和错误处理是否完善

## 🟢 轻微问题 (可选)

### 7. 文档和注释
- [x] AUDIT_REPORT.md 已更新
- [x] .env.example 已添加生产部署注意事项
- [ ] 更新 README.md 中的部署说明 (从 Netlify 改为 Vercel)

### 8. 测试
- [x] 清理所有 .bak 备份文件
- [ ] E2E 测试修复 (之前提到 Playwright 测试有 auth 问题)
- [ ] 单元测试覆盖

### 9. 生产部署注意事项
- [ ] demo 用户处理：建议移除或配置环境变量
- [ ] API 限流：当前仅内存限流，Vercel 多实例需 Redis/KV
- [ ] 结构化日志：建议引入 pino/winston

## 📋 部署步骤

1. [ ] 修复 Vercel Serverless Functions 格式
2. [ ] 在 Vercel Dashboard 配置环境变量
3. [ ] 推送代码触发部署
4. [ ] 验证所有 API 端点正常工作
5. [ ] 执行端到端测试

---

## 下一步行动

1. **立即修复**: Vercel Functions 格式
2. **配置环境变量**: 在 Vercel Dashboard 设置
3. **测试验证**: 部署后测试所有功能
4. **监控**: 检查 Vercel 函数日志

## 文件清单

已完成项：
- [x] API 函数统一为 ES Module 格式
- [x] vercel.json 格式修复
- [x] package.json 依赖分类修正
- [x] 密码哈希安全性升级 (SHA-256 + timing-safe compare)
- [x] Netlify 域名残留清除
- [x] send-email.js 统一为 ES Module
- [x] has_battery 关键词精简
- [x] 缓存 TTL 调整为 12h
- [x] 备份文件清理
- [x] 审计文档更新
