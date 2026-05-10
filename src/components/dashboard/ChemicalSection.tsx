import Link from "next/link";
import { OverallStatusCard } from "./OverallStatusCard";
import { ParameterCard } from "@/components/ui/ParameterCard";
import { DosageCard } from "./DosageCard";
import { getMeasurements, getProducts, getDosageRules } from "@/lib/supabase/queries";
import { buildParameters, calcDosages, overallStatus } from "@/lib/chemistry";
import { log } from "@/lib/logger";
import type { Product, ProductDosageRule, Measurement } from "@/types";

function isLowStock(p: Product): boolean {
  if (p.quantity === null || !p.is_active) return false;
  if (p.unit === "kg" || p.unit === "L") return p.quantity <= 1;
  return p.quantity <= 500;
}

interface Props {
  poolId: string;
  poolVolume: number;
  poolName: string;
}

export async function ChemicalSection({ poolId, poolVolume, poolName }: Props) {
  let measurements: Measurement[] = [];
  let products: Product[] = [];
  let rules: ProductDosageRule[] = [];

  try {
    [measurements, products, rules] = await Promise.all([
      getMeasurements(poolId, 1),
      getProducts(),
      getDosageRules(),
    ]);
  } catch (err) {
    log({ level: "error", action: "ChemicalSection", poolId, error: String(err) });
    return (
      <div className="glass p-4 flex items-center gap-2 border border-status-danger/30 rounded-xl">
        <span className="text-base flex-shrink-0">⚠️</span>
        <p className="text-sm text-status-danger">
          Erro ao carregar dados químicos. Recarregue a página para tentar novamente.
        </p>
      </div>
    );
  }

  const latest = measurements[0] ?? null;
  const params = latest ? buildParameters(latest) : [];
  const status = latest ? overallStatus(params) : ("unknown" as const);
  const dosages = latest && poolVolume > 0 ? calcDosages(latest, poolVolume, products, rules) : [];
  const lowStock = products.filter(isLowStock);

  return (
    <>
      {poolVolume <= 0 && (
        <div className="glass p-3 flex items-center gap-2 border border-status-warning/30 rounded-xl">
          <span className="text-sm">⚠️</span>
          <p className="text-xs text-status-warning">
            Volume da piscina não configurado. As dosagens não serão calculadas.
          </p>
        </div>
      )}

      {lowStock.length > 0 && (
        <Link
          href="/produtos"
          className="glass border border-status-warning/30 rounded-2xl px-4 py-3 flex items-start gap-3 hover:border-status-warning/60 transition-colors"
        >
          <span className="text-base flex-shrink-0 mt-0.5">⚠️</span>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-status-warning">Estoque baixo</p>
            <p className="text-xs text-ocean-300 mt-0.5 leading-relaxed">
              {lowStock.map((p) => p.name).join(", ")} —{" "}
              {lowStock.length === 1 ? "repor em breve" : "repor em breve"}.
            </p>
          </div>
        </Link>
      )}

      <OverallStatusCard
        status={status}
        poolName={poolName}
        lastMeasurementDate={latest?.measured_at ?? null}
      />
      {latest && (
        <>
          <section>
            <h2 className="text-xs font-semibold text-ocean-400 uppercase tracking-wider mb-2">
              Parâmetros Químicos
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {params.map((p) => (
                <ParameterCard key={p.key} param={p} />
              ))}
            </div>
          </section>
          <section>
            <h2 className="text-xs font-semibold text-ocean-400 uppercase tracking-wider mb-2">
              Recomendações
            </h2>
            <DosageCard dosages={dosages} products={products} measurementId={latest?.id ?? null} />
          </section>
        </>
      )}
    </>
  );
}
