import type { ChemicalParameter } from "@/types";
import { StatusBadge } from "./StatusBadge";

interface Props {
  param: ChemicalParameter;
}

export function ParameterCard({ param }: Props) {
  const { label, value, unit, ideal, status } = param;
  const pct = value !== null
    ? Math.min(100, Math.max(0, ((value - ideal.min) / (ideal.max - ideal.min)) * 100))
    : 50;

  const barColor =
    status === "ok"
      ? "bg-status-ok"
      : status === "warning"
      ? "bg-status-warning"
      : "bg-status-danger";

  return (
    <div className="glass p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-ocean-300 font-medium">{label}</span>
        <StatusBadge status={status} />
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-bold text-white">
          {value !== null ? value : "—"}
        </span>
        {unit && <span className="text-sm text-ocean-400">{unit}</span>}
      </div>
      {/* Progress bar relative to ideal range */}
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-ocean-400/70">
        <span>{ideal.min}{unit}</span>
        <span>ideal</span>
        <span>{ideal.max}{unit}</span>
      </div>
    </div>
  );
}
