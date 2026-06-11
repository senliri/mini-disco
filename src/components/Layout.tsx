import { Link, useLocation } from "react-router-dom";
import { siteConfig } from "../data/site";

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navItems = [
    { label: "AI Diagnosis", href: "/" },
    { label: "Compliance Report", href: "/report" },
    { label: "Appeal Assistant", href: "/appeal" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🐱</span>
            <span className="text-lg font-bold tracking-tight">{siteConfig.name}</span>
            <span className="hidden text-sm text-slate-400 sm:inline">{siteConfig.tagline}</span>
          </Link>
          <nav className="flex items-center gap-1 overflow-x-auto text-sm sm:gap-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`rounded-lg px-3 py-1.5 transition ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t border-white/10 px-4 py-8 text-center text-sm text-slate-500">
        <p>© 2026 Compliance Cat — Amazon Compliance Assistant | For reference only, not legal advice</p>
      </footer>
    </div>
  );
}