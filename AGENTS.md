// AGENTS.md — 合贵猫优化版行为规范

# 合贵猫 (Compliance Cat) 项目规范

## 核心原则

1. **品牌一致**: 产品名永远是"合规猫"，不是"合贵猫"
2. **数据驱动**: 所有合规数据必须准确、可追溯
3. **用户优先**: 优化用户体验优先于代码优雅
4. **状态无关**: Lambda 部署架构，无服务端状态

## 项目结构

```
src/
  pages/        - 页面组件（Home, Category, Market, Report, Appeal）
  components/   - 共享组件
  data/         - 业务数据（site.ts）— 可编辑
  lib/          - 工具函数（api.ts, env.ts）
  styles.css    - 全局样式
```

## 修改数据

所有业务数据在 `src/data/site.ts`，修改后无需改代码。
新增品类数据格式：`categoryComplianceData[品类id][市场id] = ComplianceItem[]`

## 部署

```bash
npm run build      # 构建
npm run dev        # 本地开发
npm run deploy     # SST 部署到 AWS
```

## ⚠️ 禁止

- 不要在前端暴露 API Key
- 不要在组件内硬编码合规数据（用 data/site.ts）
- 不要修改 package.json 中的脚本命令
- 不要引入需要服务端状态的依赖
