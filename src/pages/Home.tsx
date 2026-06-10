import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ArrowRight, Sparkles, MessageSquare, Send, Loader2, Info } from "lucide-react";
import { productCategories } from "../data/site";
import { extractProductProfile, isProfileComplete, type ProductProfile, type ProfileExtractionResult } from "../lib/agent";
import { store } from "../lib/store";

// 市场快捷选择
const MARKET_OPTIONS = [
  { id: "US", label: "🇺🇸 美国", desc: "FDA, FCC, CPSC" },
  { id: "EU", label: "🇪🇺 欧盟", desc: "CE, REACH, RoHS" },
  { id: "UK", label: "🇬🇧 英国", desc: "UKCA, UK REACH" },
  { id: "JP", label: "🇯🇵 日本", desc: "PSE, TELEC" },
  { id: "CA", label: "🇨🇦 加拿大", desc: "IC, Health Canada" },
  { id: "AU", label: "🇦🇺 澳洲", desc: "RCM, EESS" },
];

// 示例提示
const EXAMPLES = [
  "我做蓝牙音箱，想卖到美国",
  "儿童毛绒玩具，欧盟市场",
  "充电宝，日本市场",
  "宠物零食，美国市场",
];

type ConversationMessage = {
  role: "user" | "assistant";
  content: string;
  type?: "text" | "profile" | "error";
};

export function Home() {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentProfile, setCurrentProfile] = useState<ProductProfile | null>(null);
  const [currentMarket, setCurrentMarket] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 发送用户消息 + 分析
  const handleSend = async (userMessage: string) => {
    if (!userMessage.trim() || isAnalyzing) return;

    const userMsg: ConversationMessage = { role: "user", content: userMessage };
    setMessages((prev) => [...prev, userMsg]);
    setIsAnalyzing(true);

    try {
      // 构建上下文消息
      const contextMessages = messages
        .filter((m) => m.role === "user" || m.type === "profile")
        .map((m) => m.content);
      
      const fullMessage = contextMessages.length > 0
        ? [...contextMessages, userMessage].join("\n")
        : userMessage;

      const result = await extractProductProfile(fullMessage);

      // 添加助手回复
      const assistantMsg: ConversationMessage = {
        role: "assistant",
        content: result.questions.length > 0
          ? `我理解你的产品是 **${result.profile.product_type}**。还有一些关键信息需要确认：\n\n${result.questions.map((q, i) => `${i + 1}. ${q}`).join("\n")}`
          : `好的，我帮你分析！`,
        type: result.informationSufficient ? "profile" : "text",
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // 更新画像和市场
      if (result.profile.product_type) {
        setCurrentProfile(result.profile);
      }
      if (result.market) {
        setCurrentMarket(result.market);
      }

      // 如果信息足够，跳转到报告页
      if (result.informationSufficient) {
        setTimeout(() => {
          navigate(`/report?ai=true&market=${result.market || "US"}&product=${encodeURIComponent(result.profile.product_type)}`, {
            state: { profile: result.profile },
          });
        }, 500);
      }
    } catch (err) {
      const errorMsg: ConversationMessage = {
        role: "assistant",
        content: "抱歉，分析时遇到了一点问题。请再试一次，或者用下方的快速入口开始。",
        type: "error",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(input);
    setInput("");
  };

  // 选择品类（快速入口）
  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    setInput(category);
    setIsExpanded(true);
  };

  // 选择市场
  const handleMarketSelect = (market: string) => {
    setCurrentMarket(market);
  };

  return (
    <div className="min-h-screen">
      {/* Hero 区域 */}
      <section className="relative overflow-hidden px-4 pb-8 pt-10 sm:px-6 sm:pt-14">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-1.5 text-sm text-blue-300">
            <Sparkles className="h-4 w-4" />
            AI 驱动的合规顾问
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            告诉我你的产品，
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              我帮你查合规
            </span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-base text-slate-400 sm:text-lg">
            输入产品描述和目标市场，AI 自动生成合规诊断报告
          </p>

          {/* 搜索框 */}
          <div className="mx-auto mt-6 max-w-xl">
            <form onSubmit={handleSubmit} className="relative">
              <input
                type="text"
                placeholder="描述你的产品，如：蓝牙耳机，想卖到美国..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onFocus={() => setIsExpanded(true)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-4 pr-28 text-white placeholder-slate-500 outline-none transition focus:border-blue-500/50 focus:bg-white/10"
              />
              <button
                type="submit"
                disabled={!input.trim() || isAnalyzing}
                className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    分析
                  </>
                )}
              </button>
            </form>
            <p className="mt-2 text-xs text-slate-500">试试输入："我做充电宝，想卖到日本"</p>
          </div>
        </div>
      </section>

      {/* 对话区（展开后显示） */}
      {isExpanded && (
        <section className="mx-auto max-w-2xl px-4 sm:px-6">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02]">
            {/* 对话消息 */}
            <div className="max-h-[50vh] overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="py-4 text-center">
                  <MessageSquare className="mx-auto h-8 w-8 text-slate-500" />
                  <p className="mt-2 text-sm text-slate-400">
                    直接输入你的产品描述，AI 会自动提取信息
                  </p>
                </div>
              )}
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`rounded-xl p-3 ${
                    msg.role === "user"
                      ? "bg-blue-600/20 border border-blue-500/20"
                      : msg.type === "error"
                      ? "bg-red-500/10 border border-red-500/20"
                      : "bg-white/5 border border-white/10"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap text-white">
                    {msg.content}
                  </p>
                </div>
              ))}
              {isAnalyzing && (
                <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    正在分析...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* 快捷市场选择 */}
            {messages.length === 0 && (
              <div className="border-t border-white/10 p-3">
                <p className="text-xs text-slate-500 mb-2">目标市场：</p>
                <div className="flex flex-wrap gap-2">
                  {MARKET_OPTIONS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => handleMarketSelect(m.id)}
                      className={`rounded-lg px-3 py-1.5 text-xs transition ${
                        currentMarket === m.id
                          ? "bg-blue-600 text-white"
                          : "bg-white/5 text-slate-400 hover:bg-white/10"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 示例提示 */}
          <div className="mt-3">
            <p className="text-xs text-slate-500 mb-1.5">💡 试试这些：</p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  onClick={() => handleSend(ex)}
                  disabled={isAnalyzing}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-slate-400 hover:border-blue-500/40 hover:bg-white/5 transition disabled:opacity-50"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 快速入口：品类卡片 */}
      {!isExpanded && (
        <section className="mx-auto mt-8 max-w-7xl px-4 sm:px-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg font-semibold">快速开始</span>
            <span className="rounded-full border border-white/10 px-2.5 py-0.5 text-xs text-slate-400">
              或输入产品描述
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {productCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.label)}
                className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center transition hover:border-blue-500/40 hover:bg-white/10"
              >
                <span className="text-3xl">{cat.icon}</span>
                <span className="text-sm font-medium text-slate-200">{cat.label}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* 功能入口 */}
      <section className="mx-auto mt-10 max-w-7xl px-4 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: "🛡️", label: "申诉指导", desc: "产品被下架？快速申诉", href: "/appeal" },
            { icon: "📁", label: "合规档案", desc: "我的产品记录", href: "/appeal#archive" },
            { icon: "📢", label: "法规更新", desc: "最新合规动态", href: "#" },
          ].map((action) => (
            <a
              key={action.label}
              href={action.href}
              className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-blue-500/40 hover:bg-white/10"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/5 text-2xl">
                {action.icon}
              </span>
              <div className="text-left">
                <h3 className="font-semibold text-white">{action.label}</h3>
                <p className="text-sm text-slate-400">{action.desc}</p>
              </div>
              <ArrowRight className="ml-auto h-5 w-5 shrink-0 text-slate-500" />
            </a>
          ))}
        </div>
      </section>

      {/* 流程说明 */}
      <section className="mx-auto mt-10 max-w-4xl px-4 sm:px-6 pb-8">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">使用流程</h3>
          <div className="flex items-center gap-2 text-sm text-slate-400 flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold">1</span>
              输入产品描述
            </span>
            <span>→</span>
            <span className="flex items-center gap-1.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold">2</span>
              AI 分析产品特征
            </span>
            <span>→</span>
            <span className="flex items-center gap-1.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold">3</span>
              查看合规诊断报告
            </span>
            <span>→</span>
            <span className="flex items-center gap-1.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold">4</span>
              下载 PDF 报告
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
