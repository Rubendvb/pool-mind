import type { ProductApplication } from "@/types";
import { formatCurrency } from "@/lib/finance";

interface Props {
  applications: ProductApplication[];
}

interface MonthGroup {
  key: string;
  label: string;
  total: number;
  count: number;
}

export function MonthlyFinanceReport({ applications }: Props) {
  const paid = applications.filter((a) => a.cost !== null && a.cost > 0);

  if (paid.length === 0) {
    return (
      <div className="glass p-4 text-center">
        <p className="text-sm text-ocean-300">
          Nenhuma aplicação com custo registrado ainda.
        </p>
      </div>
    );
  }

  const byMonth = new Map<string, MonthGroup>();
  for (const a of paid) {
    const date = new Date(a.applied_at);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const label = date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
    const group = byMonth.get(key) ?? { key, label, total: 0, count: 0 };
    group.total += a.cost!;
    group.count += 1;
    byMonth.set(key, group);
  }

  const months = Array.from(byMonth.values()).sort((a, b) => b.key.localeCompare(a.key));
  const currentKey = new Date().toISOString().slice(0, 7);
  const currentMonth = byMonth.get(currentKey);
  const grandTotal = paid.reduce((s, a) => s + (a.cost ?? 0), 0);

  return (
    <div className="glass p-4 flex flex-col gap-3">
      {/* Destaque do mês atual */}
      {currentMonth && (
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <p className="text-xs font-semibold text-ocean-400 uppercase tracking-wider">Este mês</p>
            <p className="text-xs text-ocean-400/60 mt-0.5">
              {currentMonth.count} aplicaç{currentMonth.count === 1 ? "ão" : "ões"}
            </p>
          </div>
          <span className="text-lg font-bold text-status-ok">
            {formatCurrency(currentMonth.total)}
          </span>
        </div>
      )}

      {/* Lista por mês */}
      {months.map((m) => (
        <div key={m.key} className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white capitalize">{m.label}</p>
            <p className="text-xs text-ocean-400">
              {m.count} aplicaç{m.count === 1 ? "ão" : "ões"}
            </p>
          </div>
          <span className="text-sm font-semibold text-ocean-300">{formatCurrency(m.total)}</span>
        </div>
      ))}

      {/* Total geral */}
      {months.length > 1 && (
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <span className="text-xs font-semibold text-ocean-400 uppercase tracking-wider">Total geral</span>
          <span className="text-sm font-bold text-white">{formatCurrency(grandTotal)}</span>
        </div>
      )}
    </div>
  );
}
