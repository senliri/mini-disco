import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, ChevronRight, Shield } from "lucide-react";
import { productCategories, quickActions, markets } from "../data/site";

export function Home() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div>
      <section className="relative overflow-hidden px-4 pb-16 pt-12 sm:px-6 sm:pt-16">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-1.5 text-sm text-blue-300">
            <Shield className="h-4 w-4" />
            专业的亚马逊合规排查工具
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            轻松排查产品
            <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">合规风险</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400">
            覆盖美国、欧洲、日本等主要市场法规要求，快速定位合规问题，生成专业报告，轻松应对亚马逊审核
          </p>
          <div className="mx-auto mt-10 max-w-xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="搜索产品类型，如 手机壳、玩具、充电器..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-12 pr-4 text-white placeholder-slate-500 outline-none transition focus:border-blue-500/50 focus:bg-white/10"
              />
            </div>
            <p className="mt-3 text-xs text-slate-500">或从下方选择产品大类开始排查</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:grid-cols-5 sm:p-6">
          {["选品类", "精细分类", "选市场", "看报告", "申诉/档案"].map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold">
                {i + 1}
              </span>
              <span className="text-sm text-slate-300">{step}</span>
              {i < 4 && <ChevronRight className="ml-auto hidden h-4 w-4 text-slate-600 sm:block" />}
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-10 max-w-7xl px-4 sm:px-6">
        <h2 className="text-xl font-bold">选择产品大类</h2>
        <p className="mt-1 text-sm text-slate-400">选择具体类型 — 选对了报告才准</p>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {productCategories.map((cat) => (
            <Link
              key={cat.id}
              to={`/category?cat=${cat.id}`}
              className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center transition hover:border-blue-500/40 hover:bg-white/10"
            >
              <span className="text-3xl">{cat.icon}</span>
              <span className="text-sm font-medium text-slate-200">{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-14 max-w-7xl px-4 sm:px-6">
        <h2 className="text-xl font-bold">快捷功能</h2>
        <p className="mt-1 text-sm text-slate-400">快速选择常用场景</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {quickActions.map((action) => (
            <Link
              key={action.id}
              to={action.id === "appeal" ? "/appeal" : action.id === "archive" ? "/report" : "#"}
              className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-blue-500/40 hover:bg-white/10"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/5 text-2xl">
                {action.icon}
              </span>
              <div className="text-left">
                <h3 className="font-semibold text-white">{action.label}</h3>
                <p className="text-sm text-slate-400">{action.desc}</p>
              </div>
              <ChevronRight className="ml-auto h-5 w-5 shrink-0 text-slate-500" />
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-14 max-w-7xl px-4 pb-16 sm:px-6">
        <h2 className="text-xl font-bold">选择目标市场</h2>
        <p className="mt-1 text-sm text-slate-400">根据不同市场的法规要求进行合规检查</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {markets.map((m) => (
            <Link
              key={m.id}
              to={`/market?market=${m.id}`}
              className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-blue-500/40 hover:bg-white/10"
            >
              <span className="text-3xl">{m.flag}</span>
              <div>
                <h3 className="font-semibold text-white">{m.label}</h3>
                <p className="text-sm text-slate-400">{m.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}