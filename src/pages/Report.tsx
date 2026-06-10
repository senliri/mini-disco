import { useSearchParams, Link } from "react-router-dom";
import { useState } from "react";
import {
  AlertTriangle, CheckCircle, FileText, Download, ArrowLeft, Info,
  Shield, ClipboardList, ArrowRight, Loader2, Clock,
} from "lucide-react";
import {
  productCategories,
  subCategories,
  markets,
  categoryComplianceData,
  type ComplianceItem,
} from "../data/site";

export function Report() {
  const [searchParams] = useSearchParams();
  const catId = searchParams.get("cat") || "";
  const subId = searchParams.get("sub") || "";
  const marketId = searchParams.get("market") || "us";
  const [activeTab, setActiveTab] = useState<"compliance" | "action">("compliance");
  const [isGenerating, setIsGenerating] = useState(false);

  const category = productCategories.find((c) => c.id === catId);
  const sub = subCategories[catId]?.find((s) => s.id === subId);
  const market = markets.find((m) => m.id === marketId);

  // 按品类×市场联动获取合规数据
  const compliance = categoryComplianceData[catId]?.[marketId]
    || categoryComplianceData[catId]?.["us"]
    || categoryComplianceData["electronics"]?.[marketId]
    || categoryComplianceData["electronics"]?.["us"]
    || [];

  const highCount = compliance.filter((i) => i.severity === "high" && i.required).length;
  const mediumCount = compliance.filter((i) => i.severity === "medium").length;

  // PDF 导出
  const handleExportPDF = async () => {
    setIsGenerating(true);
    try {
      // 动态加载 jsPDF
      const { jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;

      const doc = new jsPDF();

      // 标题
      doc.setFontSize(20);
      doc.text("合规检查报告", 14, 20);

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(
        `${market?.label || "美国"} · ${category?.label || "通用"}${sub ? ` · ${sub.label}` : ""}`,
        14,
        30
      );
      doc.text(`生成日期：${new Date().toLocaleDateString("zh-CN")}`, 14, 37);

      // 摘要
      doc.setTextColor(0);
      doc.setFontSize(14);
      doc.text("合规项摘要", 14, 50);
      doc.setFontSize(10);
      doc.text(`总检查项：${compliance.length}`, 14, 58);
      doc.text(`高风险项：${highCount}（强制）`, 14, 65);
      doc.text(`中风险项：${mediumCount}（建议）`, 14, 72);

      // 表格
      const tableData = compliance.map((item) => [
        item.name,
        item.required ? "强制" : "建议",
        item.severity === "high" ? "高" : item.severity === "medium" ? "中" : "低",
        item.desc,
        item.action,
      ]);

      autoTable(doc, {
        startY: 80,
        head: [["认证项目", "类型", "等级", "说明", "整改建议"]],
        body: tableData,
        theme: "grid",
        headStyles: { fillColor: [37, 99, 235] },
        styles: { fontSize: 8 },
      });

      // 免责声明
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        "免责声明：本报告仅供参考，不构成法律意见。合规要求可能随时更新，请以监管机构最新信息为准。",
        14,
        doc.internal.pageSize.height - 10
      );

      doc.save(`合规猫_报告_${marketId}_${catId}.pdf`);
    } catch (err) {
      console.error("PDF导出失败:", err);
      alert("PDF 导出失败，请稍后重试。");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div>
      <section className="mx-auto mt-6 max-w-7xl px-4 sm:px-6">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Link to="/" className="hover:text-white">首页</Link>
          <span>/</span>
          <Link to={catId ? `/category?cat=${catId}` : "/"} className="hover:text-white">{category?.label || "选品类"}</Link>
          <span>/</span>
          <Link to={`/market?cat=${catId}&sub=${subId}`} className="hover:text-white">选市场</Link>
          <span>/</span>
          <span className="text-slate-200">看报告</span>
        </div>
      </section>

      <section className="mx-auto mt-6 max-w-7xl px-4 sm:px-6">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-blue-400" />
              <div>
                <h1 className="text-xl font-bold">合规检查报告</h1>
                <p className="text-sm text-slate-400">
                  {market?.flag} {market?.label || "美国"}
                  {category ? ` · ${category.icon} ${category.label}` : ""}
                  {sub ? ` · ${sub.label}` : ""}
                  {!category && <span className="text-amber-400">⚠ 未选择品类，使用通用数据</span>}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setActiveTab("compliance")} className={`rounded-xl px-4 py-2 text-sm transition ${activeTab === "compliance" ? "bg-blue-600 text-white" : "border border-white/10 text-slate-400 hover:text-white"}`}>
                合规清单
              </button>
              <button onClick={() => setActiveTab("action")} className={`rounded-xl px-4 py-2 text-sm transition ${activeTab === "action" ? "bg-blue-600 text-white" : "border border-white/10 text-slate-400 hover:text-white"}`}>
                整改建议
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-center">
              <p className="text-2xl font-bold text-red-400">{highCount}</p>
              <p className="text-xs text-slate-500">高风险项</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-center">
              <p className="text-2xl font-bold text-amber-400">{mediumCount}</p>
              <p className="text-xs text-slate-500">中风险项</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-center">
              <p className="text-2xl font-bold text-blue-400">{compliance.length}</p>
              <p className="text-xs text-slate-500">总计检查项</p>
            </div>
          </div>
        </div>
      </section>

      {activeTab === "compliance" && (
        <section className="mx-auto mt-6 max-w-7xl px-4 sm:px-6">
          <h2 className="text-lg font-semibold">详细合规检查清单</h2>
          {compliance.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center">
              <Info className="mx-auto h-10 w-10 text-slate-500" />
              <p className="mt-3 text-slate-400">该品类在所选市场暂无详细合规数据</p>
              <Link to="/" className="mt-4 inline-flex items-center gap-1 rounded-xl bg-blue-600 px-5 py-2 text-sm text-white hover:bg-blue-700">
                返回首页选择品类
              </Link>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {compliance.map((item, i) => (
                <div key={i} className={`rounded-2xl border p-4 transition hover:brightness-110 ${
                  item.severity === "high" ? "border-red-500/30 bg-red-500/10" :
                  item.severity === "medium" ? "border-amber-500/30 bg-amber-500/10" :
                  "border-green-500/30 bg-green-500/10"
                }`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      {item.required ? (
                        <Shield className={`mt-0.5 h-5 w-5 shrink-0 ${item.severity === "high" ? "text-red-400" : item.severity === "medium" ? "text-amber-400" : "text-green-400"}`} />
                      ) : (
                        <Info className={`mt-0.5 h-5 w-5 shrink-0 ${item.severity === "high" ? "text-red-400" : item.severity === "medium" ? "text-amber-400" : "text-green-400"}`} />
                      )}
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-white">{item.name}</h3>
                          {item.required ? (
                            <span className="rounded-md bg-red-500/20 px-2 py-0.5 text-xs text-red-300">强制</span>
                          ) : (
                            <span className="rounded-md bg-slate-500/20 px-2 py-0.5 text-xs text-slate-400">建议</span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-slate-400">{item.desc}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handleExportPDF}
              disabled={isGenerating || compliance.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/10 disabled:opacity-50"
            >
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              {isGenerating ? "生成中..." : "下载合规报告（PDF）"}
            </button>
            <Link to="/appeal" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-700">
              <ClipboardList className="h-4 w-4" />
              查看申诉指导
            </Link>
          </div>
        </section>
      )}

      {activeTab === "action" && (
        <section className="mx-auto mt-6 max-w-7xl px-4 sm:px-6">
          <h2 className="text-lg font-semibold">整改建议与行动计划</h2>
          {compliance.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center">
              <p className="text-slate-400">暂无整改建议数据</p>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {compliance.map((item, i) => (
                <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{item.name}</h3>
                      <p className="mt-1 text-sm text-slate-400">{item.action}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-md bg-blue-600/20 px-2.5 py-1 text-xs text-blue-300">
                          优先级：{item.severity === "high" ? "高" : item.severity === "medium" ? "中" : "低"}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-md bg-slate-600/20 px-2.5 py-1 text-xs text-slate-400">
                          <Clock className="h-3 w-3" />预计时间：{item.estimatedTime}
                        </span>
                        <span className="rounded-md bg-slate-600/20 px-2.5 py-1 text-xs text-slate-400">
                          需第三方检测：{item.needsThirdParty ? "是" : "否"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/appeal" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-700">
              <ClipboardList className="h-4 w-4" />
              查看申诉指导
            </Link>
          </div>
        </section>
      )}

      <section className="mx-auto mt-10 max-w-7xl px-4 pb-16 sm:px-6">
        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5">
          <div className="flex items-start gap-3">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-400" />
            <div>
              <h3 className="font-semibold text-blue-300">免责声明</h3>
              <p className="mt-1 text-sm text-slate-400">
                本报告仅供参考，不构成法律意见。亚马逊的合规要求可能随时更新，请以各监管机构和亚马逊官方发布的最新信息为准。建议咨询专业合规顾问获取针对性建议。
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
