import Link from "next/link";
import { Header } from "@/components/layout/Header";

const items = [
  {
    href: "/calculadoras/piscina",
    icon: "🏊",
    title: "Volume da Piscina",
    description: "Retangular, redonda ou oval — em litros e m³",
  },
  {
    href: "/calculadoras/dosagem",
    icon: "🧪",
    title: "Simulador de Dosagem",
    description: "Simule correções químicas sem salvar dados",
  },
  {
    href: "/calculadoras/conversor",
    icon: "⚖️",
    title: "Conversores",
    description: "Litros ↔ m³, gramas ↔ kg, mL ↔ L",
  },
  {
    href: "/calculadoras/regra-de-tres",
    icon: "📐",
    title: "Regra de Três",
    description: "Proporções e cálculos rápidos A ÷ B = C ÷ X",
  },
];

export default function CalculadorasPage() {
  return (
    <main className="pb-24 max-w-lg mx-auto w-full">
      <Header title="Calculadoras" subtitle="Ferramentas de cálculo rápido" />
      <div className="px-4 flex flex-col gap-3">
        {items.map(({ href, icon, title, description }) => (
          <Link
            key={href}
            href={href}
            className="glass p-4 flex items-center gap-4 hover:bg-white/10 active:scale-[0.98] transition-all rounded-2xl"
          >
            <span className="text-3xl">{icon}</span>
            <div className="min-w-0">
              <p className="font-semibold text-ocean-200">{title}</p>
              <p className="text-xs text-white/45 mt-0.5">{description}</p>
            </div>
            <span className="ml-auto text-white/25 text-xl">›</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
