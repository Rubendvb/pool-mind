import { Header } from "@/components/layout/Header";
import { OverallStatusCard } from "@/components/dashboard/OverallStatusCard";
import { ParameterCard } from "@/components/ui/ParameterCard";
import { DosageCard } from "@/components/dashboard/DosageCard";
import { TaskItem } from "@/components/tasks/TaskItem";
import { CreatePoolForm } from "@/components/dashboard/CreatePoolForm";
import { getPool, getMeasurements, getTasks } from "@/lib/supabase/queries";
import { buildParameters, calcDosages, overallStatus } from "@/lib/chemistry";

export default async function DashboardPage() {
  const pool = await getPool();

  if (!pool) {
    return (
      <main className="pb-24 max-w-lg mx-auto w-full">
        <Header title="Pool Mind" subtitle="Bem-vindo!" action={<span className="text-2xl">🌊</span>} />
        <CreatePoolForm />
      </main>
    );
  }

  const [measurements, tasks] = await Promise.all([
    getMeasurements(pool.id, 1),
    getTasks(),
  ]);

  const latest = measurements[0] ?? null;
  const params = latest ? buildParameters(latest) : [];
  const status = latest ? overallStatus(params) : "unknown" as const;
  const dosages = latest ? calcDosages(latest, pool.volume) : [];

  const urgentTasks = (tasks ?? [])
    .filter((t) => t?.status === "atrasada" || t?.status === "pendente")
    .sort((a, b) => (a!.next_due > b!.next_due ? 1 : -1))
    .slice(0, 3);

  return (
    <main className="pb-24 max-w-lg mx-auto w-full">
      <Header
        title="Pool Mind"
        subtitle={`${pool.name} · ${(pool.volume / 1000).toFixed(0)} mil L`}
        action={<span className="text-2xl">🌊</span>}
      />

      <div className="px-4 flex flex-col gap-4">
        <OverallStatusCard
          status={status}
          poolName={pool.name}
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
              <DosageCard dosages={dosages} />
            </section>
          </>
        )}

        {urgentTasks.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-semibold text-ocean-400 uppercase tracking-wider">
                Próximas Tarefas
              </h2>
              <a href="/tarefas" className="text-xs text-ocean-600 hover:text-ocean-500">
                Ver todas →
              </a>
            </div>
            <div className="glass px-4">
              {urgentTasks.map((t) => t && <TaskItem key={t.id} task={t} />)}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
