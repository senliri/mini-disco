import { useSearchParams, Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  AlertTriangle, CheckCircle, FileText, Download, ArrowLeft, Info,
  Shield, ClipboardList, ArrowRight, Loader2, Clock, Sparkles,
  Zap, TrendingUp, Target,
} from "lucide-react";
import {
  productCategories,
  subCategories,
  markets,
  categoryComplianceData,
  type ComplianceItem,
} from "../data/site";
import { inferProductProfile, generateRecommendations, type RecommendationItem } from "../lib/recommend";
import { generateDiagnosis, isProfileComplete, type ProductProfile, type DiagnosisResult } from "../lib/agent";
import { store } from "../lib/store";

export function Report() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const catId = searchParams.get("cat") || "";
  const subId = searchParams.get("sub") || "";
  const marketId = searchParams.get("market") || "us";
  const isAiMode = searchParams.get("ai") === "true";
  const aiProduct = searchParams.get("product") || "";
  const [activeTab, setActiveTab] = useState<"recommend" | "compliance" | "action">("recommend");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiResult, setAiResult] = useState<DiagnosisResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const category = productCategories.find((c) => c.id === catId);
  const sub = subCategories[catId]?.find((s) => s.id === subId);
  const market = markets.find((m) => m.id === marketId);

  // 按品类×市场联动获取合规数据
  const rawCompliance = categoryComplianceData[catId]?.[marketId]
    || categoryComplianceData[catId]?.["us"]
    || categoryComplianceData["electronics"]?.[marketId]
    || categoryComplianceData["electronics"]?.["us"]
    || [];

  // 智能推荐：根据产品特征生成
  const profile = inferProductProfile(catId, subId);
  const recommendations = generateRecommendations(rawCompliance, marketId, profile, catId);

  // AI 模式：从对话模式过来，调用 AI 诊断
  useEffect(() => {
    if (!isAiMode || !aiProduct) return;
    
    const stateProfile = location.state?.profile as ProductProfile | undefined;
    const marketMap: Record<string, string> = { US: "us", EU: "eu", UK: "uk", JP: "jp", CA: "ca", AU: "au" };
    const mappedMarket = marketMap[marketId.toUpperCase()] || marketId;

    const runDiagnosis = async () => {
      setAiLoading(true);
      try {
        // AI 模式下，优先使用从对话中推断的 profile
        const useProfile = stateProfile || {
          product_type: aiProduct,
          category: "electronics",
          has_battery: null,
          battery_capacity: null,
          has_wireless: null,
          is_children: null,
          food_contact: null,
          wearable: null,
          medical: null,
          electrical: null,
          contains_chemicals: null,
          contains_magnets: null,
          precision: null,
          has_flammable: null,
        } as ProductProfile;

        const result = await generateDiagnosis(useProfile, mappedMarket, aiProduct);
        setAiResult(result);
        // 保存到历史
        store.saveReport({
          productType: aiProduct,
          market: marketId,
          profile: { ...(useProfile as Record<string, unknown>) },
          diagnosis: { ...result },
        });
      } catch (err) {
        console.error("AI 诊断失败:", err);
      } finally {
        setAiLoading(false);
      }
    };

    runDiagnosis();
  }, [isAiMode, aiProduct, marketId, location.state]);

  const highCount = recommendations.filter((i) => i.severity === "high" && i.required).length;
  const mediumCount = recommendations.filter((i) => i.severity === "medium").length;
  const recommendCount = recommendations.filter((r) => r.confidence === "high").length;

  // PDF 导出
  const handleExportPDF = async () => {
    setIsGenerating(true);
    try {
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

      // 如果 AI 模式，使用 AI 诊断结果作为摘要
      const summary = isAiMode && aiResult ? aiResult.summary : "";
      const warnings = isAiMode && aiResult ? aiResult.warnings : [];

      // AI 推荐摘要
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text("AI 智能推荐", 14, 50);
      doc.setFontSize(9);
      doc.setTextColor(60);
      if (summary) {
        doc.text(summary, 14, 58, { maxWidth: 180 });
      } else {
        doc.text(`推荐处理项：${recommendCount} 个（高优先级）`, 14, 58);
      }
      doc.text(`高风险强制项：${highCount} 个`, 14, 65);

      // 表格
      const tableData = recommendations.map((item) => [
        item.name,
        item.required ? "强制" : "建议",
        item.severity === "high" ? "高" : item.severity === "medium" ? "中" : "低",
        item.reason,
        item.action,
      ]);

      autoTable(doc, {
        startY: 72,
        head: [["认证项目", "类型", "等级", "AI 推荐理由", "整改建议"]],
        body: tableData,
        theme: "grid",
        headStyles: { fillColor: [37, 99, 235] },
        styles: { fontSize: 7 },
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
                  {isAiMode && aiProduct && (
                    <span className="ml-1">
                      📦 {aiProduct}
                    </span>
                  )}
                  {category && !isAiMode && (
                    <> · {category.icon} {category.label}</>
                  )}
                  {sub && !isAiMode && (
                    <> · {sub.label}</>
                  )}
                  {!category && !isAiMode && <span className="text-amber-400">⚠ 未选择品类，使用通用数据</span>}
                </p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => setActiveTab("recommend")} className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm transition ${activeTab === "recommend" ? "bg-blue-600 text-white" : "border border-white/10 text-slate-400 hover:text-white"}`}>
                <Sparkles className="h-3.5 w-3.5" />
                AI 推荐
              </button>
              <button onClick={() => setActiveTab("compliance")} className={`rounded-xl px-4 py-2 text-sm transition ${activeTab === "compliance" ? "bg-blue-600 text-white" : "border border-white/10 text-slate-400 hover:text-white"}`}>
                合规清单
              </button>
              <button onClick={() => setActiveTab("action")} className={`rounded-xl px-4 py-2 text-sm transition ${activeTab === "action" ? "bg-blue-600 text-white" : "border border-white/10 text-slate-400 hover:text-white"}`}>
                整改建议
              </button>
            </div>
          </div>

          {/* AI 智能分析面板 */}
          <div className="mt-5 rounded-xl border border-purple-500/20 bg-gradient-to-r from-purple-500/5 to-blue-500/5 p-4">
            {/* AI 模式：显示摘要 */}
            {isAiMode && aiLoading && (
              <div className="flex items-center gap-2 text-sm text-purple-300 mb-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                AI 正在分析产品合规风险...
              </div>
            )}
            {isAiMode && aiResult && (
              <>
                <p className="text-sm text-purple-300 mb-2">
                  {aiResult.summary}
                </p>
                {aiResult.warnings && aiResult.warnings.length > 0 && (
                  <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-2.5">
                    {aiResult.warnings.map((w, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-xs text-red-300">
                        <span className="shrink-0">⚠</span>
                        <span>{w}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-400" />
              <span className="text-sm font-semibold text-purple-300">AI 智能分析</span>
              <span className="text-xs text-purple-400/70 ml-auto">基于产品特征自动匹配</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="rounded-lg bg-white/5 px-3 py-2 text-center">
                <p className="text-lg font-bold text-purple-300">{recommendCount}</p>
                <p className="text-xs text-purple-400/70">优先处理</p>
              </div>
              <div className="rounded-lg bg-white/5 px-3 py-2 text-center">
                <p className="text-lg font-bold text-red-400">{highCount}</p>
                <p className="text-xs text-red-400/70">高风险项</p>
              </div>
              <div className="rounded-lg bg-white/5 px-3 py-2 text-center">
                <p className="text-lg font-bold text-amber-400">{mediumCount}</p>
                <p className="text-xs text-amber-400/70">中风险项</p>
              </div>
              <div className="rounded-lg bg-white/5 px-3 py-2 text-center">
                <p className="text-lg font-bold text-blue-400">{rawCompliance.length}</p>
                <p className="text-xs text-blue-400/70">总计检查项</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI 推荐面板 */}
      {activeTab === "recommend" && (
        <section className="mx-auto mt-6 max-w-7xl px-4 sm:px-6">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-purple-400" />
              <h2 className="text-lg font-semibold">AI 智能推荐</h2>
              <span className="ml-auto text-xs text-slate-500">{isAiMode ? `AI 诊断 · ${aiProduct}` : `根据产品 ${category?.label}${sub ? ` + ${sub.label}` : ""} 在 ${market?.label} 自动匹配`}</span>
            </div>

            {isAiMode && aiLoading ? (
              <div className="py-16 text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-purple-400" />
                <p className="mt-3 text-slate-400">AI 正在生成诊断报告...</p>
              </div>
            ) : recommendations.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center">
                <Info className="mx-auto h-10 w-10 text-slate-500" />
                <p className="mt-3 text-slate-400">该品类在所选市场暂无合规数据</p>
                <Link to="/" className="mt-4 inline-flex items-center gap-1 rounded-xl bg-blue-600 px-5 py-2 text-sm text-white hover:bg-blue-700">
                  返回首页选择品类
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {/* 高优先级推荐 */}
                {recommendations.filter(r => r.confidence === "high").length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="h-4 w-4 text-yellow-400" />
                      <span className="text-sm font-semibold text-yellow-300">🔴 优先处理 — 这些项影响最大</span>
                    </div>
                    <div className="space-y-2">
                      {recommendations.filter(r => r.confidence === "high").map((item, i) => (
                        <RecommendationCard key={`high-${i}`} item={item} />
                      ))}
                    </div>
                  </div>
                )}

                {/* 中优先级推荐 */}
                {recommendations.filter(r => r.confidence === "medium").length > 0 && (
                  <div className="mt-5">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="h-4 w-4 text-amber-400" />
                      <span className="text-sm font-semibold text-amber-300">🟡 建议处理 — 提升合规完整度</span>
                    </div>
                    <div className="space-y-2">
                      {recommendations.filter(r => r.confidence === "medium").map((item, i) => (
                        <RecommendationCard key={`med-${i}`} item={item} />
                      ))}
                    </div>
                  </div>
                )}

                {/* 低优先级推荐 */}
                {recommendations.filter(r => r.confidence === "low").length > 0 && (
                  <div className="mt-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="h-4 w-4 text-green-400" />
                      <span className="text-sm font-semibold text-green-300">🟢 可选处理 — 视产品情况而定</span>
                    </div>
                    <div className="space-y-2">
                      {recommendations.filter(r => r.confidence === "low").map((item, i) => (
                        <RecommendationCard key={`low-${i}`} item={item} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={handleExportPDF}
                disabled={isGenerating || recommendations.length === 0}
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
          </div>
        </section>
      )}

      {/* 合规清单 */}
      {activeTab === "compliance" && (
        <section className="mx-auto mt-6 max-w-7xl px-4 sm:px-6">
          <h2 className="text-lg font-semibold">详细合规检查清单</h2>
          {rawCompliance.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center">
              <Info className="mx-auto h-10 w-10 text-slate-500" />
              <p className="mt-3 text-slate-400">该品类在所选市场暂无详细合规数据</p>
              <Link to="/" className="mt-4 inline-flex items-center gap-1 rounded-xl bg-blue-600 px-5 py-2 text-sm text-white hover:bg-blue-700">
                返回首页选择品类
              </Link>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {rawCompliance.map((item, i) => (
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
        </section>
      )}

      {/* 整改建议 */}
      {activeTab === "action" && (
        <section className="mx-auto mt-6 max-w-7xl px-4 sm:px-6">
          {isAiMode && aiResult && aiResult.warnings && aiResult.warnings.length > 0 && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 mb-4">
              <h3 className="text-sm font-semibold text-red-300 mb-2">⚠ 关键注意事项</h3>
              {aiResult.warnings.map((w, i) => (
                <p key={i} className="text-sm text-red-200/80 mb-1">• {w}</p>
              ))}
            </div>
          )}
          <h2 className="text-lg font-semibold mb-3">整改建议与行动计划</h2>
          {recommendations.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center">
              <p className="text-slate-400">暂无整改建议数据</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* 按 severity 排序：高风险先展示 */}
              {["high", "medium", "low"].map((sev) => {
                const items = recommendations.filter(r => r.severity === sev);
                if (items.length === 0) return null;
                const borderColor = sev === "high" ? "border-red-500/20 bg-red-500/5" : 
                                    sev === "medium" ? "border-amber-500/20 bg-amber-500/5" : 
                                    "border-green-500/20 bg-green-500/5";
                const titleColor = sev === "high" ? "text-red-300" : 
                                   sev === "medium" ? "text-amber-300" : "text-green-300";
                const icon = sev === "high" ? <AlertTriangle className="h-4 w-4 text-red-400" /> :
                             sev === "medium" ? <TrendingUp className="h-4 w-4 text-amber-400" /> :
                             <CheckCircle className="h-4 w-4 text-green-400" />;
                return (
                  <div key={sev}>
                    <div className="flex items-center gap-2 mb-3">
                      {icon}
                      <span className={`text-sm font-semibold ${titleColor}`}>
                        {sev === "high" ? "🔴 高优先级 — 需要立即处理" : 
                         sev === "medium" ? "🟡 中优先级 — 建议尽快处理" : 
                         "🟢 低优先级 — 按顺序处理"}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {items.map((item, i) => (
                        <div key={`${sev}-${i}`} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                          <div className="flex items-start gap-3">
                            <Shield className="mt-0.5 h-5 w-5 shrink-0 text-blue-400" />
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="font-semibold text-white">{item.name}</h3>
                                {item.required && (
                                  <span className="rounded-md bg-red-500/20 px-2 py-0.5 text-xs text-red-300">强制</span>
                                )}
                              </div>
                              <p className="mt-1 text-sm text-slate-400">{item.action}</p>
                              <div className="mt-2 rounded-lg bg-purple-500/10 p-2.5 text-xs text-purple-300">
                                <Sparkles className="h-3 w-3 inline mr-1" />
                                AI 推荐理由：{item.reason}
                              </div>
                              <div className="mt-3 flex flex-wrap gap-2">
                                <span className="rounded-md bg-blue-600/20 px-2.5 py-1 text-xs text-blue-300">
                                  {item.priorityLabel}
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-md bg-slate-600/20 px-2.5 py-1 text-xs text-slate-400">
                                  <Clock className="h-3 w-3" />预计时间：{item.estimatedTime}
                                </span>
                                <span className="rounded-md bg-slate-600/20 px-2.5 py-1 text-xs text-slate-400">
                                  预估费用：{item.estimatedCost}
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
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      <section className="mx-auto mt-10 max-w-7xl px-4 pb-16 sm:px-6">
        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5">
          <div className="flex items-start gap-3">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-400" />
            <div>
              <h3 className="font-semibold text-blue-300">免责声明</h3>
              <p className="mt-1 text-sm text-slate-400">
                本报告及 AI 推荐仅供参考，不构成法律意见。合规要求可能随时更新，请以各监管机构和亚马逊官方发布的最新信息为准。建议咨询专业合规顾问获取针对性建议。
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// 推荐卡片组件
function RecommendationCard({ item }: { item: RecommendationItem }) {
  const confColor = item.confidence === "high" ? "border-purple-500/30 bg-purple-500/10" :
                    item.confidence === "medium" ? "border-amber-500/30 bg-amber-500/10" :
                    "border-green-500/30 bg-green-500/10";
  const badgeColor = item.confidence === "high" ? "bg-purple-500/20 text-purple-300" :
                     item.confidence === "medium" ? "bg-amber-500/20 text-amber-300" :
                     "bg-green-500/20 text-green-300";

  return (
    <div className={`rounded-xl border p-4 ${confColor}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <Shield className={`mt-0.5 h-5 w-5 shrink-0 ${item.severity === "high" ? "text-red-400" : item.severity === "medium" ? "text-amber-400" : "text-green-400"}`} />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-white">{item.name}</h3>
              {item.required && <span className="rounded-md bg-red-500/20 px-2 py-0.5 text-xs text-red-300">强制</span>}
              <span className={`rounded-md px-2 py-0.5 text-xs ${badgeColor}`}>{item.priorityLabel}</span>
            </div>
            <p className="mt-1 text-sm text-slate-400">{item.desc}</p>
          </div>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
        <span className="inline-flex items-center gap-1 rounded-md bg-purple-500/10 px-2 py-1 text-purple-300">
          <Sparkles className="h-3 w-3" />{item.reason}
        </span>
        <span className="rounded-md bg-slate-600/20 px-2 py-1 text-slate-400">
          预计：{item.estimatedTime}
        </span>
        <span className="rounded-md bg-slate-600/20 px-2 py-1 text-slate-400">
          费用：{item.estimatedCost}
        </span>
      </div>
    </div>
  );
}
