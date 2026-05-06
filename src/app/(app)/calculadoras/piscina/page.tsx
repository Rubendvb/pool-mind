import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { PoolVolumeCalculator } from "@/components/calculators/PoolVolumeCalculator";
import { getPool } from "@/lib/supabase/queries";

export default async function CalculadoraPiscinaPage() {
  const pool = await getPool();

  return (
    <main className="pb-24 max-w-lg mx-auto w-full">
      <Header
        title="Volume da Piscina"
        subtitle="Retangular, redonda e oval"
        action={
          <Link href="/calculadoras" className="text-sm text-ocean-400 hover:text-ocean-300">
            ‹ Voltar
          </Link>
        }
      />
      <PoolVolumeCalculator pool={pool} />
    </main>
  );
}
