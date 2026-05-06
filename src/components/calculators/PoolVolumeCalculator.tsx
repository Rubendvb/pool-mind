"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  calcRectangular,
  calcRound,
  calcOval,
  avgDepth,
  type PoolShape,
} from "@/lib/calculators/volume";
import { updatePoolVolume } from "@/app/(app)/actions";
import type { Pool } from "@/types";

type DepthMode = "single" | "variable";

const shapes: { value: PoolShape; label: string }[] = [
  { value: "rectangular", label: "Retangular" },
  { value: "round", label: "Redonda" },
  { value: "oval", label: "Oval" },
];

function NumInput({
  label,
  value,
  onChange,
  placeholder,
  unit = "m",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
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
          step="0.01"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full glass px-3 py-2.5 pr-9 text-white placeholder-ocean-400/50 outline-none focus:ring-1 focus:ring-ocean-500 rounded-xl text-sm"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/35 pointer-events-none">
          {unit}
        </span>
      </div>
    </div>
  );
}

export function PoolVolumeCalculator({ pool }: { pool: Pool | null }) {
  const router = useRouter();
  const [shape, setShape] = useState<PoolShape>("rectangular");
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [diameter, setDiameter] = useState("");
  const [depthMode, setDepthMode] = useState<DepthMode>("single");
  const [depth, setDepth] = useState("");
  const [depthShallow, setDepthShallow] = useState("");
  const [depthDeep, setDepthDeep] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const effectiveDepth = useMemo(() => {
    if (depthMode === "variable") {
      const s = parseFloat(depthShallow);
      const d = parseFloat(depthDeep);
      return !isNaN(s) && !isNaN(d) && s > 0 && d > 0 ? avgDepth(s, d) : NaN;
    }
    const d = parseFloat(depth);
    return !isNaN(d) && d > 0 ? d : NaN;
  }, [depthMode, depth, depthShallow, depthDeep]);

  const volume = useMemo((): number | null => {
    const d = effectiveDepth;
    if (isNaN(d)) return null;

    if (shape === "round") {
      const dm = parseFloat(diameter);
      return !isNaN(dm) && dm > 0 ? calcRound(dm, d) : null;
    }
    const l = parseFloat(length);
    const w = parseFloat(width);
    if (isNaN(l) || isNaN(w) || l <= 0 || w <= 0) return null;
    return shape === "rectangular" ? calcRectangular(l, w, d) : calcOval(l, w, d);
  }, [shape, length, width, diameter, effectiveDepth]);

  async function handleUseVolume() {
    if (!volume || !pool) return;
    setSaving(true);
    setError(null);
    const result = await updatePoolVolume(pool.id, Math.round(volume));
    setSaving(false);
    if (result?.error) {
      setError(result.error);
    } else {
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 3000);
    }
  }

  return (
    <div className="px-4 space-y-4">
      {/* Shape selector */}
      <div className="glass p-1 flex rounded-xl gap-1">
        {shapes.map((s) => (
          <button
            key={s.value}
            onClick={() => setShape(s.value)}
            className={`flex-1 py-2 text-sm font-medium rounded-xl transition-all ${
              shape === s.value
                ? "bg-ocean-700/80 text-white"
                : "text-white/50 hover:text-white/70"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Dimension inputs */}
      <div className="glass p-4 space-y-3">
        {shape === "round" ? (
          <NumInput
            label="Diâmetro"
            value={diameter}
            onChange={setDiameter}
            placeholder="6.00"
          />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <NumInput
              label="Comprimento"
              value={length}
              onChange={setLength}
              placeholder="8.00"
            />
            <NumInput
              label="Largura"
              value={width}
              onChange={setWidth}
              placeholder="4.00"
            />
          </div>
        )}

        {/* Depth */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs text-ocean-400 font-medium">Profundidade</label>
            <button
              onClick={() =>
                setDepthMode(depthMode === "single" ? "variable" : "single")
              }
              className="text-xs text-ocean-400 hover:text-ocean-300 transition-colors"
            >
              {depthMode === "single" ? "Usar profundidade variável" : "Usar profundidade única"}
            </button>
          </div>

          {depthMode === "single" ? (
            <NumInput label="" value={depth} onChange={setDepth} placeholder="1.50" />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <NumInput
                label="Parte rasa"
                value={depthShallow}
                onChange={setDepthShallow}
                placeholder="1.00"
              />
              <NumInput
                label="Parte funda"
                value={depthDeep}
                onChange={setDepthDeep}
                placeholder="2.00"
              />
            </div>
          )}

          {depthMode === "variable" && !isNaN(effectiveDepth) && (
            <p className="text-xs text-white/40">
              Profundidade média: {effectiveDepth.toFixed(2)} m
            </p>
          )}
        </div>
      </div>

      {/* Result */}
      {volume !== null ? (
        <div className="glass-strong p-5 text-center space-y-2">
          <p className="text-xs text-white/50 uppercase tracking-wider">Volume calculado</p>
          <p className="text-4xl font-bold text-ocean-300">
            {Math.round(volume).toLocaleString("pt-BR")}
            <span className="text-xl font-normal text-white/50 ml-1">L</span>
          </p>
          <p className="text-sm text-white/40">{(volume / 1000).toFixed(3)} m³</p>

          {error && (
            <p className="text-xs text-status-danger bg-status-danger/10 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          {pool ? (
            <button
              onClick={handleUseVolume}
              disabled={saving || saved}
              className="mt-2 w-full py-2.5 rounded-xl font-semibold text-sm transition-all bg-ocean-700 hover:bg-ocean-600 disabled:opacity-60 text-white"
            >
              {saving ? "Salvando..." : saved ? "Volume atualizado!" : "Usar este volume"}
            </button>
          ) : (
            <p className="text-xs text-white/30 pt-1">
              Cadastre uma piscina para salvar o volume
            </p>
          )}
        </div>
      ) : (
        <div className="glass p-5 text-center">
          <p className="text-white/40 text-sm">Preencha as dimensões para calcular</p>
        </div>
      )}
    </div>
  );
}
