import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { ConverterCalculator } from "@/components/calculators/ConverterCalculator";

export default function ConversorPage() {
  return (
    <main className="pb-24 max-w-lg mx-auto w-full">
      <Header
        title="Conversores"
        subtitle="Litros, m³, gramas, kg e mL"
        action={
          <Link href="/calculadoras" className="text-sm text-ocean-400 hover:text-ocean-300">
            ‹ Voltar
          </Link>
        }
      />
      <ConverterCalculator />
    </main>
  );
}
