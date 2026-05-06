"use client";
import { useState, useMemo } from "react";
import { calcDosages } from "@/lib/chemistry";
import type { Pool, Product, DosageRecommendation, Measurement } from "@/types";

interface Props {
  pool: Pool | null;
  products: Product[];
}

const priorityBadge: Record<string, string> = {
  urgent: "bg-status-danger/20 text-status-danger border-status-danger/30",
  soon: "bg-status-warning/20 text-status-warning border-status-warning/30",
  ok: "bg-status-ok/20 text-status-ok border-status-ok/30",
};

function NumInput({
  label,
  value,
  onChange,
  placeholder,
  step = "0.1",
  unit,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  step?: string;
  unit?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-ocean-400 font-medium">{label}</label>
      <div className="relative">
        <input
          type="number"
          inputMode="decimal"
          min="0"
          step={step}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full glass px-3 py-2.5 text-white text-sm placeholder-ocean-400/40 outline-none focus:ring-1 focus:ring-ocean-500 rounded-xl ${unit ? "pr-14" : ""}`}
        />
        {unit && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/35 pointer-events-none">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

export function DosageSandbox({ pool, products }: Props) {
  const [volume, setVolume] = useState(pool?.volume.toString() ?? "10000");
  const [ph, setPh] = useState("7.4");
  const [chlorine, setChlorine] = useState("1.5");
  const [alkalinity, setAlkalinity] = useState("100");
  const [hardness, setHardness] = useState("250");

  const recs = useMemo((): DosageRecommendation[] => {
    const vol = parseFloat(volume);
    const phVal = parseFloat(ph);
    const clVal = parseFloat(chlorine);
    const alkVal = parseFloat(alkalinity);
    const hardVal = parseFloat(hardness);

    if (isNaN(vol) || vol <= 0 || isNaN(phVal) || isNaN(clVal) || isNaN(alkVal)) return [];

    const mock: Measurement = {
      id: "sandbox",
      pool_id: pool?.id ?? "sandbox",
      measured_at: new Date().toISOString(),
      ph: phVal,
      chlorine: clVal,
      alkalinity: alkVal,
      hardness: isNaN(hardVal) ? null : hardVal,
    };

    return calcDosages(mock, vol, products);
  }, [volume, ph, chlorine, alkalinity, hardness, pool, products]);

  function reset() {
    setVolume(pool?.volume.toString() ?? "10000");
    setPh("7.4");
    setChlorine("1.5");
    setAlkalinity("100");
    setHardness("250");
  }

  return (
    <div className="px-4 space-y-4">
      {/* Disclaimer */}
      <div className="glass p-3 flex items-start gap-2">
        <span className="text-sm">🧪</span>
        <p className="text-xs text-white/50">
          Simulação — ajuste os valores abaixo para ver as recomendações. Nenhum dado será
          salvo.
        </p>
      </div>

      {/* Inputs */}
      <div className="glass p-4 space-y-3">
        <p className="text-xs font-semibold text-ocean-300 uppercase tracking-wider">
          Parâmetros
        </p>
        <NumInput
          label="Volume da piscina"
          value={volume}
          onChange={setVolume}
          placeholder="10000"
          step="100"
          unit="L"
        />
        <div className="grid grid-cols-2 gap-3">
          <NumInput
            label="pH"
            value={ph}
            onChange={setPh}
            placeholder="7.4"
            step="0.1"
          />
          <NumInput
            label="Cloro Livre"
            value={chlorine}
            onChange={setChlorine}
            placeholder="1.5"
            step="0.1"
            unit="mg/L"
          />
          <NumInput
            label="Alcalinidade"
            value={alkalinity}
            onChange={setAlkalinity}
            placeholder="100"
            step="1"
            unit="ppm"
          />
          <NumInput
            label="Dureza (opcional)"
            value={hardness}
            onChange={setHardness}
            placeholder="250"
            step="1"
            unit="ppm"
          />
        </div>
        <button
          onClick={reset}
          className="w-full glass py-2 text-xs text-white/50 hover:text-white/70 rounded-xl transition-colors"
        >
          Resetar valores
        </button>
      </div>

      {/* Recommendations */}
      <div className="glass p-4 flex flex-col gap-3">
        <p className="text-xs font-semibold text-ocean-300 uppercase tracking-wider">
          Recomendações simuladas
        </p>

        {recs.length === 0 ? (
          <div className="text-center py-3">
            <span className="text-2xl">✨</span>
            <p className="text-sm text-ocean-300 mt-1">Nenhuma correção necessária!</p>
          </div>
        ) : (
          recs.map((d, i) => (
            <div key={i} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-lg flex-shrink-0">
                  {d.action === "add" ? "➕" : "🔽"}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{d.product}</p>
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
                className={`text-xs font-semibold px-2 py-0.5 rounded-full border flex-shrink-0 ${
                  priorityBadge[d.priority]
                }`}
              >
                {d.priority === "urgent" ? "Urgente" : "Em breve"}
              </span>
            </div>
          ))
        )}
      </div>

      {products.length > 0 && (
        <p className="text-xs text-white/30 text-center px-2">
          Usando {products.filter((p) => p.is_active).length} produto(s) ativo(s) cadastrado(s)
        </p>
      )}
    </div>
  );
}
