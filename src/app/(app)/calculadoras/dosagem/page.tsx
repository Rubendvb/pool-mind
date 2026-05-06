import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { DosageSandbox } from "@/components/calculators/DosageSandbox";
import { getPool, getProducts } from "@/lib/supabase/queries";

export default async function DosagemSandboxPage() {
  const [pool, products] = await Promise.all([getPool(), getProducts()]);

  return (
    <main className="pb-24 max-w-lg mx-auto w-full">
      <Header
        title="Simulador de Dosagem"
        subtitle="Calcule sem salvar dados"
        action={
          <Link href="/calculadoras" className="text-sm text-ocean-400 hover:text-ocean-300">
            ‹ Voltar
          </Link>
        }
      />
      <DosageSandbox pool={pool} products={products} />
    </main>
  );
}
