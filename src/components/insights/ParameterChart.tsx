"use client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { Measurement } from "@/types";

interface Props {
  measurements: Measurement[];
}

const PARAMS = [
  { key: "ph", label: "pH", color: "#48cae4", min: 7.2, max: 7.6, decimals: 1 },
  { key: "chlorine", label: "Cloro (mg/L)", color: "#06d6a0", min: 1.0, max: 3.0, decimals: 1 },
  { key: "alkalinity", label: "Alcalinidade (ppm)", color: "#ffd166", min: 80, max: 120, decimals: 0 },
];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { color: string; name: string; value: number }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong px-3 py-2 text-xs">
      <p className="text-ocean-300 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
};

export function ParameterChart({ measurements }: Props) {
  const data = [...measurements]
    .reverse()
    .map((m) => ({
      date: new Date(m.measured_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
      ph: m.ph,
      chlorine: m.chlorine,
      alkalinity: m.alkalinity,
    }));

  return (
    <div className="flex flex-col gap-6">
      {PARAMS.map(({ key, label, color, min, max }) => (
        <div key={key} className="glass p-4">
          <p className="text-xs font-semibold text-ocean-400 uppercase tracking-wider mb-3">{label}</p>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="date" tick={{ fill: "#90e0ef", fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: "#90e0ef", fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={min} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4" />
              <ReferenceLine y={max} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4" />
              <Line
                type="monotone"
                dataKey={key}
                name={label}
                stroke={color}
                strokeWidth={2}
                dot={{ fill: color, r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex justify-between text-[10px] text-ocean-400/60 mt-1">
            <span>Ideal: {min} – {max}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
