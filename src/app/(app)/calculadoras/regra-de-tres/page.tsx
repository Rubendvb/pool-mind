import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { RuleOfThreeCalculator } from "@/components/calculators/RuleOfThreeCalculator";

export default function RegraDesTresPage() {
  return (
    <main className="pb-24 max-w-lg mx-auto w-full">
      <Header
        title="Regra de Três"
        subtitle="A ÷ B = C ÷ X"
        action={
          <Link href="/calculadoras" className="text-sm text-ocean-400 hover:text-ocean-300">
            ‹ Voltar
          </Link>
        }
      />
      <RuleOfThreeCalculator />
    </main>
  );
}
