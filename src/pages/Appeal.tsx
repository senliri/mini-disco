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
          prompt: `You are an Amazon appeal expert. Generate an appeal plan based on the user's listing removal reason.

Product: ${productType}
Removal reason: ${reason}
Actions taken: ${actions || "Not provided"}

Output format (strict JSON):
{
  "rootCause": "Root cause analysis",
  "correctiveActions": ["Action 1", "Action 2"],
  "preventiveMeasures": ["Measure 1", "Measure 2"],
  "poaTemplate": "Complete appeal letter template (in English, 500-1000 words)",
  "checklist": ["Document 1", "Document 2"],
  "tips": "Appeal tips"
}`,
          message: "Please generate a complete appeal plan",
        }),
      });

      if (!response.ok) throw new Error("Request failed");
      const data = await response.json();
      const reply = data.reply || data.content || "";
      const cleaned = reply.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("AI returned unexpected format");
      setAppealResult(JSON.parse(jsonMatch[0]));
    } catch (err) {
      console.error("Appeal generation failed:", err);
      alert("Appeal generation failed. Please try again.");
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
          <Link to="/" className="hover:text-white">Home</Link>
          <span>/</span>
          <span className="text-slate-200">Appeal / Archive</span>
        </div>
      </section>

      <section className="mx-auto mt-6 max-w-7xl px-4 sm:px-6">
        <div className="flex gap-2">
          <button onClick={() => setActiveTab("appeal")} className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-medium transition ${activeTab === "appeal" ? "bg-blue-600 text-white" : "border border-white/10 text-slate-400 hover:text-white"}`}>
            <Shield className="h-4 w-4" />
            Appeal Guide
          </button>
          <button onClick={() => setActiveTab("archive")} className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-medium transition ${activeTab === "archive" ? "bg-blue-600 text-white" : "border border-white/10 text-slate-400 hover:text-white"}`}>
            <FileText className="h-4 w-4" />
            Compliance Archive
          </button>
        </div>
      </section>

      {activeTab === "appeal" && (
        <section className="mx-auto mt-6 max-w-7xl px-4 sm:px-6">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h1 className="text-2xl font-bold">Amazon Appeal Guide</h1>
            <p className="mt-1 text-sm text-slate-400">Product delisted or received a compliance warning? Follow these steps to prepare your appeal materials.</p>

            {/* AI Appeal Letter Generator */}
            <div className="mt-6 rounded-2xl border border-purple-500/20 bg-gradient-to-r from-purple-500/5 to-blue-500/5 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-purple-400" />
                <h2 className="text-lg font-semibold text-purple-300">AI Appeal Letter Generator</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-slate-300 mb-1 block">Product Type</label>
                  <input
                    type="text"
                    placeholder="e.g. Bluetooth speakers, children plush toys, food storage containers"
                    value={productType}
                    onChange={(e) => setProductType(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-4 text-white placeholder-slate-500 outline-none focus:border-purple-500/50"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-300 mb-1 block">Removal Reason</label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-4 text-white outline-none focus:border-purple-500/50"
                  >
                    <option value="">Select a removal reason</option>
                    <option value="Product safety complaint">Product safety complaint</option>
                    <option value="Missing compliance documents">Missing compliance documents</option>
                    <option value="Non-compliant product labeling">Non-compliant product labeling</option>
                    <option value="Restricted product violation">Restricted product violation</option>
                    <option value="Intellectual property complaint">Intellectual property complaint</option>
                    <option value="Misclassified / wrong category">Misclassified / wrong category</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-slate-300 mb-1 block">Actions Taken (Optional)</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Contacted supplier for latest test report, updated product packaging labels, added warning notices, etc."
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
                  {isGenerating ? "Generating..." : "Generate Appeal Letter"}
                </button>
              </div>
              {appealResult && (
                <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-purple-300">Appeal Plan</span>
                    <button
                      onClick={copyPOA}
                      className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition"
                    >
                      <Copy className="h-3 w-3" />
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                  {/* Root Cause */}
                  {appealResult?.rootCause && (
                    <div className="mb-3">
                      <h4 className="text-xs font-semibold text-slate-300 mb-1">📋 Root Cause Analysis</h4>
                      <p className="text-sm text-slate-300">{appealResult.rootCause}</p>
                    </div>
                  )}
                  {/* Appeal Letter Template */}
                  {appealResult?.poaTemplate && (
                    <div className="mb-3 rounded-lg bg-white/5 p-3">
                      <h4 className="text-xs font-semibold text-blue-300 mb-2">📝 Appeal Letter Template (English)</h4>
                      <div className="text-sm text-slate-200 whitespace-pre-wrap max-h-64 overflow-y-auto">
                        {appealResult.poaTemplate}
                      </div>
                    </div>
                  )}
                  {/* Corrective Actions */}
                  {appealResult.correctiveActions && (appealResult.correctiveActions as string[]).length > 0 && (
                    <div className="mb-2">
                      <h4 className="text-xs font-semibold text-green-300 mb-1">✅ Corrective Actions Taken</h4>
                      {(appealResult.correctiveActions as string[]).map((a, i) => (
                        <p key={i} className="text-xs text-slate-300 mb-1">• {String(a)}</p>
                      ))}
                    </div>
                  )}
                  {/* Preventive Measures */}
                  {appealResult.preventiveMeasures && (
                    <div className="mb-2">
                      <h4 className="text-xs font-semibold text-amber-300 mb-1">🛡️ Preventive Measures</h4>
                      {appealResult.preventiveMeasures!.map((p, i) => (
                        <p key={i} className="text-xs text-slate-300 mb-1">• {p}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6">
              <h2 className="text-lg font-semibold">Common Removal Reasons</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  { title: "Product Safety Complaint", desc: "Customer complaint about product safety, Amazon requires compliance proof" },
                  { title: "Missing Compliance Documents", desc: "Missing mandatory certification documents like FDA/CE/FCC" },
                  { title: "Non-Compliant Product Labeling", desc: "Missing warning labels, ingredient lists, or compliance marks" },
                  { title: "Restricted Product Violation", desc: "Product categorized as restricted but without submitted credentials" },
                  { title: "Intellectual Property Complaint", desc: "Patent, trademark, or copyright infringement complaint" },
                  { title: "Misclassified / Wrong Category", desc: "Product wrongly placed in a category requiring additional certification" },
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
              <h2 className="text-lg font-semibold">Appeal Steps</h2>
              <div className="mt-4 space-y-3">
                {[
                  { step: 1, title: "Identify Removal Reason", desc: "Log into Amazon Seller Central, check Performance Notifications for the specific removal reason. Confirm whether it is a compliance issue or performance issue." },
                  { step: 2, title: "Gather Compliance Documents", desc: "Prepare corresponding documents based on the removal reason: test reports, certification certificates, product images (with compliance info), supplier invoices, etc." },
                  { step: 3, title: "Develop Corrective Action Plan", desc: "Describe corrective measures already taken: updated product labels, switched suppliers, improved production process, added warning notices, etc." },
                  { step: 4, title: "Write Appeal Letter", desc: "Format: include Plan of Action (POA), root cause analysis, corrective actions taken, and preventive measures. Keep tone sincere and logic clear." },
                  { step: 5, title: "Submit Appeal", desc: "Submit through the Seller Central appeal channel. Ensure all files are PDF format, English-named, and clearly readable." },
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
              <h2 className="text-lg font-semibold">Appeal FAQ</h2>
              <div className="mt-4 space-y-2">
                {[
                  { q: "What if the appeal is rejected?", a: "First rejection is common. Read Amazon's rejection reason carefully, supplement materials accordingly, and resubmit. You can usually appeal up to 3 times." },
                  { q: "How long does an appeal take?", a: "Usually 1-2 weeks for a response; complex cases may take 2-4 weeks. Do not repeatedly submit appeals within 24 hours." },
                  { q: "Must the appeal letter be in English?", a: "Yes, recommended for US/EU markets. For the Japanese market, you can attach a Japanese translation." },
                  { q: "Do I need a lawyer?", a: "General compliance issues can be handled yourself. For legal disputes or intellectual property conflicts, consult a professional attorney." },
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
            <h1 className="text-2xl font-bold">Compliance Archive</h1>
            <p className="mt-1 text-sm text-slate-400">Manage your product compliance records and historical check reports</p>

            <div className="mt-8 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center">
              <FileText className="mx-auto h-12 w-12 text-slate-500" />
              <h3 className="mt-4 text-lg font-medium text-slate-300">No Compliance Records Yet</h3>
              <p className="mt-2 text-sm text-slate-500">Reports will be saved here automatically after completing compliance checks</p>
              <Link to="/" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700">
                <CheckCircle className="h-4 w-4" />
                Start a New Compliance Check
              </Link>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: Upload, title: "Upload Compliance Documents", desc: "Upload product test reports, certification certificates, etc. for unified management" },
                { icon: Mail, title: "Historical Notifications", desc: "Save Amazon performance notifications and compliance warning history" },
                { icon: MessageSquare, title: "Appeal Progress Tracking", desc: "Record appeal status after submission and Amazon's responses" },
                { icon: Calendar, title: "Compliance Expiry Reminders", desc: "Set certification expiry reminders to avoid risks from expired documents" },
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