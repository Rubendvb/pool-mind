import type { DosageRecommendation } from "@/types";

interface Props {
  dosages: DosageRecommendation[];
}

const priorityBadge: Record<string, string> = {
  urgent: "bg-status-danger/20 text-status-danger border-status-danger/30",
  soon: "bg-status-warning/20 text-status-warning border-status-warning/30",
  ok: "bg-status-ok/20 text-status-ok border-status-ok/30",
};

export function DosageCard({ dosages }: Props) {
  if (dosages.length === 0) {
    return (
      <div className="glass p-4 text-center">
        <span className="text-2xl">✨</span>
        <p className="text-sm text-ocean-300 mt-1">Nenhuma correção necessária!</p>
      </div>
    );
  }

  return (
    <div className="glass p-4 flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-ocean-300 uppercase tracking-wider">
        Correções Recomendadas
      </h3>
      {dosages.map((d, i) => (
        <div key={i} className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{d.action === "add" ? "➕" : "🔽"}</span>
            <div>
              <p className="text-sm font-medium text-white">{d.product}</p>
              {d.action === "add" && d.amount > 0 && (
                <p className="text-xs text-ocean-400">
                  {d.amount} {d.unit}
                </p>
              )}
              {d.action === "reduce" && (
                <p className="text-xs text-ocean-400">Aguardar dissipação natural</p>
              )}
            </div>
          </div>
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
              priorityBadge[d.priority]
            }`}
          >
            {d.priority === "urgent" ? "Urgente" : "Em breve"}
          </span>
        </div>
      ))}
    </div>
  );
}
