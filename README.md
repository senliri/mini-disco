# 合规猫 (Compliance Cat)

亚马逊合规排查助手 — 帮助卖家快速排查产品合规风险，生成合规报告，支持申诉指导。

## 技术栈

- **React 18** + **TypeScript**
- **Vite** (构建工具)
- **Tailwind CSS** (样式)
- **React Router v7** (路由)
- **SST** (AWS 部署)
- **jsPDF** (PDF 报告导出)

## 架构

```
User
  ↓
CloudFront
  ↓
S3 静态托管 (React SPA)
```

## 功能

- ✅ 12 个大类、60+ 子分类产品选择
- ✅ 6 个目标市场 (美/欧/英/日/加/澳)
- ✅ 品类×市场 联动合规数据
- ✅ 高风险/中风险分级标注
- ✅ PDF 报告导出（含整改建议）
- ✅ 申诉指导 + FAQ
- ✅ 合规档案（预留）

## 快速开始

```bash
# 安装依赖
npm install

# 本地开发
npm run dev

# 生产构建
npm run build

# 预览构建
npm run preview

# 部署到 AWS
npm run deploy
```

## 项目结构

```
src/
├── pages/           # 页面组件
│   ├── Home.tsx     # 首页（产品选择 + 搜索）
│   ├── Category.tsx # 子分类选择
│   ├── Market.tsx   # 市场选择
│   ├── Report.tsx   # 合规报告 + PDF 导出
│   └── Appeal.tsx   # 申诉指导
├── components/      # 共享 UI 组件
├── data/            # 业务数据（可编辑）
│   └── site.ts      # 品类、市场、合规数据
└── lib/             # 工具函数
    ├── api.ts       # API 客户端
    └── env.ts       # 环境变量管理
```

## 环境变量

复制 `.env.example` 为 `.env.local`，配置 `VITE_API_BASE_URL` 启用后端 API。

## 合规数据

合规数据在 `src/data/site.ts` 的 `categoryComplianceData` 中定义，按 `品类 → 市场` 两级索引。

## 部署

```bash
npm run deploy -- --stage dev      # 开发环境
npm run deploy -- --stage production  # 生产环境
```

## 免责声明

本报告仅供参考，不构成法律意见。合规要求可能随时更新，请以各监管机构和亚马逊官方发布的最新信息为准。
