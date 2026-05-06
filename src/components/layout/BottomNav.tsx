"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Dashboard", icon: "🏠" },
  { href: "/medicoes", label: "Medições", icon: "🧪" },
  { href: "/tarefas", label: "Tarefas", icon: "✅" },
  { href: "/produtos", label: "Produtos", icon: "🧴" },
  { href: "/insights", label: "Insights", icon: "📊" },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 nav-bar pb-safe">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {items.map(({ href, label, icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl transition-all duration-200 ${
                active ? "text-ocean-300" : "text-white/35 hover:text-white/60"
              }`}
            >
              {active && (
                <span className="absolute inset-0 rounded-xl bg-ocean-800/30 border border-ocean-600/20" />
              )}
              <span className={`text-xl relative transition-transform duration-200 ${active ? "scale-110" : ""}`}>
                {icon}
              </span>
              <span className={`text-[10px] font-semibold tracking-wide relative ${active ? "text-ocean-300" : ""}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
