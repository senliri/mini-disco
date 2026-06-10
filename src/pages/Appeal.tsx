import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, FileText, Shield, AlertTriangle, CheckCircle, Upload, Mail, MessageSquare, Calendar, ChevronDown, Sparkles, Loader2, Copy } from "lucide-react";

export function Appeal() {
  const [activeTab, setActiveTab] = useState<"appeal" | "archive">("appeal");
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [productType, setProductType] = useState("");
  const [reason, setReason] = useState("");
  const [actions, setActions] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [appealResult, setAppealResult] = useState<{ rootCause?: string; poaTemplate?: string; correctiveActions?: string[]; preventiveMeasures?: string[] } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerateAppeal = async () => {
    if (!productType || !reason) return;
    setIsGenerating(true);
    setCopied(false);
    try {
      const response = await fetch("/.netlify/functions/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "appeal",
          prompt: `你是亚马逊申诉专家。根据用户提供的下架原因，生成申诉方案。

产品信息：${productType}
下架原因：${reason}
已采取措施：${actions || "未提供"}

输出格式（严格 JSON）：
{
  "rootCause": "根本原因分析",
  "correctiveActions": ["措施1", "措施2"],
  "preventiveMeasures": ["措施1", "措施2"],
  "poatemplate": "完整的申诉信模板（英文，500-1000字）",
  "checklist": ["材料1", "材料2"],
  "tips": "申诉技巧"
}`,
          message: "请生成完整的申诉方案",
        }),
      });

      if (!response.ok) throw new Error("请求失败");
      const data = await response.json();
      const reply = data.reply || data.content || "";
      const cleaned = reply.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("AI 返回格式异常");
      setAppealResult(JSON.parse(jsonMatch[0]));
    } catch (err) {
      console.error("生成申诉信失败:", err);
      alert("申诉信生成失败，请稍后重试。");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyPOA = () => {
    if (!appealResult?.poaTemplate) return;
    const text = typeof appealResult.poaTemplate === "string" ? appealResult.poaTemplate : String(appealResult.poaTemplate);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <section className="mx-auto mt-6 max-w-7xl px-4 sm:px-6">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Link to="/" className="hover:text-white">首页</Link>
          <span>/</span>
          <span className="text-slate-200">申诉/档案</span>
        </div>
      </section>

      <section className="mx-auto mt-6 max-w-7xl px-4 sm:px-6">
        <div className="flex gap-2">
          <button onClick={() => setActiveTab("appeal")} className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-medium transition ${activeTab === "appeal" ? "bg-blue-600 text-white" : "border border-white/10 text-slate-400 hover:text-white"}`}>
            <Shield className="h-4 w-4" />
            申诉指导
          </button>
          <button onClick={() => setActiveTab("archive")} className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-medium transition ${activeTab === "archive" ? "bg-blue-600 text-white" : "border border-white/10 text-slate-400 hover:text-white"}`}>
            <FileText className="h-4 w-4" />
            合规档案
          </button>
        </div>
      </section>

      {activeTab === "appeal" && (
        <section className="mx-auto mt-6 max-w-7xl px-4 sm:px-6">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h1 className="text-2xl font-bold">亚马逊申诉指导</h1>
            <p className="mt-1 text-sm text-slate-400">产品被下架或收到合规警告？按以下步骤准备申诉材料</p>

            {/* AI 申诉信生成器 */}
            <div className="mt-6 rounded-2xl border border-purple-500/20 bg-gradient-to-r from-purple-500/5 to-blue-500/5 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-purple-400" />
                <h2 className="text-lg font-semibold text-purple-300">AI 申诉信生成器</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-slate-300 mb-1 block">产品类型</label>
                  <input
                    type="text"
                    placeholder="如：蓝牙音箱、儿童毛绒玩具、食品保鲜盒"
                    value={productType}
                    onChange={(e) => setProductType(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-4 text-white placeholder-slate-500 outline-none focus:border-purple-500/50"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-300 mb-1 block">下架原因</label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-4 text-white outline-none focus:border-purple-500/50"
                  >
                    <option value="">请选择下架原因</option>
                    <option value="产品安全性投诉">产品安全性投诉</option>
                    <option value="合规文件缺失">合规文件缺失</option>
                    <option value="产品标签不合规">产品标签不合规</option>
                    <option value="受限产品违规">受限产品违规</option>
                    <option value="知识产权投诉">知识产权投诉</option>
                    <option value="误分类/错放类目">误分类/错放类目</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-slate-300 mb-1 block">已采取的整改措施（可选）</label>
                  <textarea
                    rows={3}
                    placeholder="如：已联系供应商获取最新检测报告、更新了产品包装标签、添加了警示说明等"
                    value={actions}
                    onChange={(e) => setActions(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-4 text-white placeholder-slate-500 outline-none focus:border-purple-500/50 resize-none"
                  />
                </div>
                <button
                  onClick={handleGenerateAppeal}
                  disabled={!productType || !reason || isGenerating}
                  className="w-full rounded-xl bg-purple-600 py-2.5 text-sm font-medium text-white transition hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  {isGenerating ? "生成中..." : "生成申诉信"}
                </button>
              </div>
              {appealResult && (
                <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-purple-300">申诉方案</span>
                    <button
                      onClick={copyPOA}
                      className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition"
                    >
                      <Copy className="h-3 w-3" />
                      {copied ? "已复制" : "复制"}
                    </button>
                  </div>
                  {/* 根本原因 */}
                  {appealResult?.rootCause && (
                    <div className="mb-3">
                      <h4 className="text-xs font-semibold text-slate-300 mb-1">📋 根本原因分析</h4>
                      <p className="text-sm text-slate-300">{appealResult.rootCause}</p>
                    </div>
                  )}
                  {/* 申诉信模板 */}
                  {appealResult?.poaTemplate && (
                    <div className="mb-3 rounded-lg bg-white/5 p-3">
                      <h4 className="text-xs font-semibold text-blue-300 mb-2">📝 申诉信模板（英文）</h4>
                      <div className="text-sm text-slate-200 whitespace-pre-wrap max-h-64 overflow-y-auto">
                        {appealResult.poaTemplate}
                      </div>
                    </div>
                  )}
                  {/* 整改措施 */}
                  {appealResult.correctiveActions && (appealResult.correctiveActions as string[]).length > 0 && (
                    <div className="mb-2">
                      <h4 className="text-xs font-semibold text-green-300 mb-1">✅ 已采取措施</h4>
                      {(appealResult.correctiveActions as string[]).map((a, i) => (
                        <p key={i} className="text-xs text-slate-300 mb-1">• {String(a)}</p>
                      ))}
                    </div>
                  )}
                  {/* 预防措施 */}
                  {appealResult.preventiveMeasures && (
                    <div className="mb-2">
                      <h4 className="text-xs font-semibold text-amber-300 mb-1">🛡️ 未来预防措施</h4>
                      {appealResult.preventiveMeasures!.map((p, i) => (
                        <p key={i} className="text-xs text-slate-300 mb-1">• {p}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6">
              <h2 className="text-lg font-semibold">常见下架原因</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  { title: "产品安全性投诉", desc: "客户投诉产品安全问题，亚马逊要求提供合规证明" },
                  { title: "合规文件缺失", desc: "缺少FDA/CE/FCC等强制认证文件" },
                  { title: "产品标签不合规", desc: "缺少警告标签、成分表或合规标志" },
                  { title: "受限产品违规", desc: "产品被归为受限品类但未提交相应资质" },
                  { title: "知识产权投诉", desc: "涉及专利、商标或版权侵权投诉" },
                  { title: "误分类/错放类目", desc: "产品被误分到需要额外认证的类目" },
                ].map((reason, i) => (
                  <div key={i} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-400" />
                      <h3 className="font-medium text-white">{reason.title}</h3>
                    </div>
                    <p className="mt-1 pl-6 text-sm text-slate-400">{reason.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-lg font-semibold">申诉准备步骤</h2>
              <div className="mt-4 space-y-3">
                {[
                  { step: 1, title: "确认下架原因", desc: "登录亚马逊卖家后台，查看业绩通知（Performance Notifications）中的具体下架原因。确认是合规问题还是绩效问题。" },
                  { step: 2, title: "收集合规文件", desc: "根据下架原因准备对应文件：检测报告、认证证书、产品图片（标注合规信息）、供应商发票等。" },
                  { step: 3, title: "制定整改方案", desc: "说明已经采取的整改措施：更新产品标签、更换供应商、改进生产工艺、添加警告说明等。" },
                  { step: 4, title: "撰写申诉信", desc: "格式要求：包含行动计划（POA）、根本原因分析、已采取措施和未来预防措施。语气诚恳、逻辑清晰。" },
                  { step: 5, title: "提交申诉", desc: "在卖家后台通过申诉通道提交。确保所有文件为PDF格式、英文命名、清晰可读。" },
                ].map((s) => (
                  <div key={s.step} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-blue-500/30">
                    <div className="flex items-start gap-4">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold">{s.step}</span>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{s.title}</h3>
                        <p className="mt-1 text-sm text-slate-400">{s.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-lg font-semibold">申诉FAQ</h2>
              <div className="mt-4 space-y-2">
                {[
                  { q: "申诉被拒绝了怎么办？", a: "第一次被拒很常见。仔细阅读亚马逊的拒绝理由，针对性补充材料后重新提交。通常可以申诉3次。" },
                  { q: "申诉需要多长时间？", a: "通常在1-2周内收到回复，复杂案件可能需要2-4周。不要在24小时内反复提交申诉。" },
                  { q: "申诉信必须用英文吗？", a: "建议使用英文撰写，如果目标市场是欧美。日本市场可以附上日文翻译。" },
                  { q: "需要找律师吗？", a: "一般合规问题自行申诉即可。如涉及法律诉讼或知识产权纠纷，建议咨询专业律师。" },
                ].map((faq, i) => (
                  <div key={i} className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
                    <button
                      onClick={() => setExpandedFAQ(expandedFAQ === i ? null : i)}
                      className="flex w-full items-center justify-between p-4 text-left text-white hover:bg-white/5 transition"
                    >
                      <span className="font-medium text-sm">{faq.q}</span>
                      <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${expandedFAQ === i ? "rotate-180" : ""}`} />
                    </button>
                    {expandedFAQ === i && (
                      <div className="px-4 pb-4 text-sm text-slate-400 border-t border-white/5 pt-3">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {activeTab === "archive" && (
        <section className="mx-auto mt-6 max-w-7xl px-4 pb-16 sm:px-6">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h1 className="text-2xl font-bold">合规档案</h1>
            <p className="mt-1 text-sm text-slate-400">管理您的产品合规记录和历史检查报告</p>

            <div className="mt-8 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center">
              <FileText className="mx-auto h-12 w-12 text-slate-500" />
              <h3 className="mt-4 text-lg font-medium text-slate-300">暂无合规记录</h3>
              <p className="mt-2 text-sm text-slate-500">完成合规检查后，报告将自动保存在这里</p>
              <Link to="/" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700">
                <CheckCircle className="h-4 w-4" />
                开始新合规检查
              </Link>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: Upload, title: "上传合规文件", desc: "上传产品检测报告、认证证书等文件统一管理" },
                { icon: Mail, title: "历史通知记录", desc: "保存亚马逊业绩通知和合规警告历史" },
                { icon: MessageSquare, title: "申诉进度跟踪", desc: "记录申诉提交后的状态和亚马逊回复" },
                { icon: Calendar, title: "合规到期提醒", desc: "设置认证到期提醒，避免过期风险" },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-center">
                    <Icon className="mx-auto h-6 w-6 text-blue-400" />
                    <h3 className="mt-3 font-semibold text-white">{item.title}</h3>
                    <p className="mt-1 text-sm text-slate-400">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
