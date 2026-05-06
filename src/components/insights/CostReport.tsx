import type { Measurement } from "@/types";
import { calcDosages } from "@/lib/chemistry";

const PRICES: Record<string, { unit: string; pricePerUnit: number }> = {
  "pH+ (Barrilha)":       { unit: "g",  pricePerUnit: 0.05 },
  "pH- (Ácido Muriático)": { unit: "ml", pricePerUnit: 0.02 },
  "Triclorado 90%":        { unit: "g",  pricePerUnit: 0.15 },
  "Bicarbonato de Sódio":  { unit: "g",  pricePerUnit: 0.03 },
};

interface Props {
  measurements: Measurement[];
  poolVolume: number;
}

export function CostReport({ measurements, poolVolume }: Props) {
  const totals: Record<string, { amount: number; cost: number; unit: string }> = {};

  for (const m of measurements) {
    for (const d of calcDosages(m, poolVolume)) {
      if (d.action !== "add" || d.amount === 0) continue;
      const price = PRICES[d.product];
      if (!price) continue;
      if (!totals[d.product]) totals[d.product] = { amount: 0, cost: 0, unit: d.unit };
      totals[d.product].amount += d.amount;
      totals[d.product].cost += d.amount * price.pricePerUnit;
    }
  }

  const entries = Object.entries(totals);
  const totalCost = entries.reduce((acc, [, v]) => acc + v.cost, 0);

  if (entries.length === 0) {
    return (
      <div className="glass p-4 text-center">
        <p className="text-sm text-ocean-300">Nenhum dado de consumo ainda.</p>
      </div>
    );
  }

  return (
    <div className="glass p-4 flex flex-col gap-3">
      <h3 className="text-xs font-semibold text-ocean-400 uppercase tracking-wider">
        Consumo estimado (histórico)
      </h3>
      {entries.map(([product, { amount, cost, unit }]) => (
        <div key={product} className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white">{product}</p>
            <p className="text-xs text-ocean-400">
              {amount.toFixed(0)} {unit} consumidos
            </p>
          </div>
          <span className="text-sm font-semibold text-ocean-300">
            R$ {cost.toFixed(2)}
          </span>
        </div>
      ))}
      <div className="border-t border-white/10 pt-3 flex justify-between">
        <span className="text-sm font-semibold text-white">Total estimado</span>
        <span className="text-sm font-bold text-status-ok">R$ {totalCost.toFixed(2)}</span>
      </div>
      <p className="text-[10px] text-ocean-400/60">
        * Estimativa baseada nas medições registradas. Preços podem variar.
      </p>
    </div>
  );
}
