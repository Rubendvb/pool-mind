import type { ParameterStatus } from "@/types";

const config: Record<ParameterStatus, { label: string; classes: string }> = {
  ok: { label: "Ideal", classes: "bg-status-ok/20 text-status-ok border-status-ok/30" },
  warning: { label: "Atenção", classes: "bg-status-warning/20 text-status-warning border-status-warning/30" },
  danger: { label: "Perigo", classes: "bg-status-danger/20 text-status-danger border-status-danger/30" },
  unknown: { label: "—", classes: "bg-white/10 text-white/40 border-white/10" },
};

export function StatusBadge({ status }: { status: ParameterStatus }) {
  const { label, classes } = config[status];
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${classes}`}>
      {label}
    </span>
  );
}

export function StatusDot({ status }: { status: ParameterStatus }) {
  const colors: Record<ParameterStatus, string> = {
    ok: "bg-status-ok shadow-[0_0_6px_theme(colors.status-ok)]",
    warning: "bg-status-warning shadow-[0_0_6px_theme(colors.status-warning)]",
    danger: "bg-status-danger shadow-[0_0_6px_theme(colors.status-danger)] animate-pulse",
    unknown: "bg-white/30",
  };
  const labels: Record<ParameterStatus, string> = {
    ok: "Status: ideal",
    warning: "Status: atenção",
    danger: "Status: perigo",
    unknown: "Status: desconhecido",
  };
  return (
    <span
      role="img"
      aria-label={labels[status]}
      className={`inline-block w-2.5 h-2.5 rounded-full ${colors[status]}`}
    />
  );
}
