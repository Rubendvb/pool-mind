import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { ApplicationsReport } from "@/components/insights/ApplicationsReport";
import { NotificationSetup } from "@/components/push/NotificationSetup";
import { ParameterChartClient } from "@/components/insights/ParameterChartClient";
import { getPool, getMeasurements, getApplications } from "@/lib/supabase/queries";

export default async function InsightsPage() {
  const pool = await getPool();

  if (!pool) {
    return (
      <main className="pb-24 max-w-lg mx-auto w-full">
        <Header
        title="Insights"
        subtitle="Nenhuma piscina cadastrada"
        action={
          <Link href="/configuracoes" aria-label="Configurações" className="p-2 rounded-xl text-ocean-400/60 hover:text-ocean-300 hover:bg-white/10 transition-all">
            ⚙️
          </Link>
        }
      />
      </main>
    );
  }

  const [measurements, applications] = await Promise.all([
    getMeasurements(pool.id, 20),
    getApplications(30),
  ]);

  const avgPh = measurements.length
    ? (measurements.reduce((s, m) => s + m.ph, 0) / measurements.length).toFixed(2)
    : "—";
  const avgChlor = measurements.length
    ? (measurements.reduce((s, m) => s + m.chlorine, 0) / measurements.length).toFixed(2)
    : "—";

  return (
    <main className="pb-24 max-w-lg mx-auto w-full">
      <Header
        title="Insights"
        subtitle={pool.name}
        action={
          <Link
            href="/configuracoes"
            aria-label="Configurações"
            className="p-2 rounded-xl text-ocean-400/60 hover:text-ocean-300 hover:bg-white/10 transition-all"
          >
            ⚙️
          </Link>
        }
      />

      <div className="px-4 flex flex-col gap-4">
        {/* Resumo */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Medições", value: measurements.length },
            { label: "pH médio", value: avgPh },
            { label: "Cloro médio", value: avgChlor },
          ].map(({ label, value }) => (
            <div key={label} className="glass p-3 text-center">
              <p className="text-xl font-bold text-white">{value}</p>
              <p className="text-[10px] text-ocean-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Notificações */}
        <section>
          <h2 className="text-xs font-semibold text-ocean-400 uppercase tracking-wider mb-2">
            Notificações
          </h2>
          <NotificationSetup />
        </section>

        {/* Gráficos */}
        {measurements.length >= 2 ? (
          <section>
            <h2 className="text-xs font-semibold text-ocean-400 uppercase tracking-wider mb-2">
              Evolução dos Parâmetros
            </h2>
            <ParameterChartClient measurements={measurements} />
          </section>
        ) : (
          <div className="glass p-4 text-center">
            <p className="text-sm text-ocean-300">Registre pelo menos 2 medições para ver os gráficos.</p>
          </div>
        )}

        {/* Histórico de aplicações */}
        <section>
          <h2 className="text-xs font-semibold text-ocean-400 uppercase tracking-wider mb-2">
            Histórico de Aplicações
          </h2>
          <ApplicationsReport applications={applications} />
        </section>
      </div>
    </main>
  );
}
