import { Header } from "@/components/layout/Header";
import { ParameterCard } from "@/components/ui/ParameterCard";
import { StatusDot } from "@/components/ui/StatusBadge";
import { NewMeasurementButton } from "@/components/measurements/NewMeasurementButton";
import { DeleteMeasurementButton } from "@/components/measurements/DeleteMeasurementButton";
import { getPool, getMeasurements } from "@/lib/supabase/queries";
import { buildParameters, overallStatus } from "@/lib/chemistry";

export default async function MedicoesPage() {
  const pool = await getPool();

  if (!pool) {
    return (
      <main className="pb-24 max-w-lg mx-auto w-full">
        <Header title="Medições" subtitle="Nenhuma piscina cadastrada" />
        <p className="px-4 text-sm text-ocean-400">Configure sua piscina no dashboard primeiro.</p>
      </main>
    );
  }

  const measurements = await getMeasurements(pool.id, 10);

  return (
    <main className="pb-24 max-w-lg mx-auto w-full">
      <Header
        title="Medições"
        subtitle={pool.name}
        action={<NewMeasurementButton poolId={pool.id} poolVolume={pool.volume} />}
      />

      <div className="px-4 flex flex-col gap-4">
        {measurements.length === 0 && (
          <div className="glass p-6 text-center">
            <span className="text-3xl">🧪</span>
            <p className="text-sm text-ocean-300 mt-2">Nenhuma medição ainda.</p>
            <p className="text-xs text-ocean-400 mt-1">Toque em "+ Nova" para registrar a primeira.</p>
          </div>
        )}

        {measurements.map((m, i) => {
          const params = buildParameters(m);
          const status = overallStatus(params);
          const date = new Date(m.measured_at).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short",
            year: i === 0 ? undefined : "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <section key={m.id} className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <StatusDot status={status} />
                <span className="text-sm font-semibold text-white">
                  {i === 0 ? "Última medição" : date}
                </span>
                {i === 0 && <span className="text-xs text-ocean-400">{date}</span>}
                {m.notes && (
                  <span className="text-xs text-ocean-400/70 italic truncate max-w-32">
                    {m.notes}
                  </span>
                )}
                <div className="ml-auto">
                  <DeleteMeasurementButton measurementId={m.id} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {params.map((p) => (
                  <ParameterCard key={p.key} param={p} />
                ))}
              </div>
              {i < measurements.length - 1 && (
                <div className="border-b border-white/5 mt-1" />
              )}
            </section>
          );
        })}
      </div>
    </main>
  );
}
