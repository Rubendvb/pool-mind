import type { ProductApplication } from "@/types";
import { formatCurrency } from "@/lib/finance";

interface Props {
  applications: ProductApplication[];
}

export function ApplicationsReport({ applications }: Props) {
  if (applications.length === 0) {
    return (
      <div className="glass p-4 text-center">
        <p className="text-sm text-ocean-300">
          Nenhuma aplicação registrada. Confirme uma dosagem recomendada no Dashboard.
        </p>
      </div>
    );
  }

  const totalCost = applications.reduce((acc, a) => acc + (a.cost ?? 0), 0);

  return (
    <div className="glass p-4 flex flex-col gap-3">
      {totalCost > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-ocean-400 uppercase tracking-wider">
            Total gasto
          </span>
          <span className="text-sm font-bold text-status-ok">{formatCurrency(totalCost)}</span>
        </div>
      )}
      {applications.map((a) => (
        <div key={a.id} className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{a.product_name}</p>
            <p className="text-xs text-ocean-400">
              {a.quantity_used} {a.unit} ·{" "}
              {new Date(a.applied_at).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>
            {a.notes && <p className="text-xs text-ocean-400/60 mt-0.5">{a.notes}</p>}
          </div>
          {a.cost !== null ? (
            <span className="text-sm font-semibold text-ocean-300 flex-shrink-0">
              {formatCurrency(a.cost)}
            </span>
          ) : (
            <span className="text-xs text-ocean-400/50 flex-shrink-0">sem custo</span>
          )}
        </div>
      ))}
    </div>
  );
}
