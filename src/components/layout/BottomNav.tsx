"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "./LogoutButton";

const items = [
  { href: "/", label: "Dashboard", icon: "🏠" },
  { href: "/medicoes", label: "Medições", icon: "🧪" },
  { href: "/tarefas", label: "Tarefas", icon: "✅" },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 glass-strong border-t border-white/10 pb-safe">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {items.map(({ href, label, icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all ${
                active
                  ? "text-ocean-300 scale-105"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              <span className="text-xl">{icon}</span>
              <span className="text-[10px] font-semibold tracking-wide">{label}</span>
            </Link>
          );
        })}
        <LogoutButton />
      </div>
    </nav>
  );
}
