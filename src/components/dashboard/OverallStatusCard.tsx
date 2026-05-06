import type { ParameterStatus } from "@/types";
import { StatusDot } from "@/components/ui/StatusBadge";

const messages: Record<ParameterStatus, { title: string; desc: string }> = {
  ok: {
    title: "Água em perfeitas condições",
    desc: "Todos os parâmetros estão dentro do ideal. Continue monitorando.",
  },
  warning: {
    title: "Atenção necessária",
    desc: "Um ou mais parâmetros estão fora do ideal. Verifique as recomendações.",
  },
  danger: {
    title: "Ação imediata necessária",
    desc: "Parâmetros críticos detectados. Corrija antes de usar a piscina.",
  },
  unknown: {
    title: "Sem dados recentes",
    desc: "Registre uma nova medição para ver o diagnóstico.",
  },
};

interface Props {
  status: ParameterStatus;
  poolName: string;
  lastMeasurementDate: string | null;
}

export function OverallStatusCard({ status, poolName, lastMeasurementDate }: Props) {
  const { title, desc } = messages[status];
  const borderColor =
    status === "ok"
      ? "border-status-ok/40"
      : status === "warning"
      ? "border-status-warning/40"
      : status === "danger"
      ? "border-status-danger/40"
      : "border-white/20";

  const date = lastMeasurementDate
    ? new Date(lastMeasurementDate).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className={`glass p-5 border-l-4 ${borderColor}`}>
      <div className="flex items-center gap-2 mb-2">
        <StatusDot status={status} />
        <span className="text-xs text-ocean-400 font-medium">
          {poolName}{date ? ` · ${date}` : ""}
        </span>
      </div>
      <h2 className="text-lg font-bold text-white">{title}</h2>
      <p className="text-sm text-ocean-300 mt-1">{desc}</p>
    </div>
  );
}
