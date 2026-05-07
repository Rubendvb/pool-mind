import { OverallStatusCard } from "./OverallStatusCard";
import { ParameterCard } from "@/components/ui/ParameterCard";
import { DosageCard } from "./DosageCard";
import { getMeasurements, getProducts, getDosageRules } from "@/lib/supabase/queries";
import { buildParameters, calcDosages, overallStatus } from "@/lib/chemistry";

interface Props {
  poolId: string;
  poolVolume: number;
  poolName: string;
}

export async function ChemicalSection({ poolId, poolVolume, poolName }: Props) {
  const [measurements, products, rules] = await Promise.all([
    getMeasurements(poolId, 1),
    getProducts(),
    getDosageRules(),
  ]);
  const latest = measurements[0] ?? null;
  const params = latest ? buildParameters(latest) : [];
  const status = latest ? overallStatus(params) : ("unknown" as const);
  const dosages = latest && poolVolume > 0 ? calcDosages(latest, poolVolume, products, rules) : [];

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
