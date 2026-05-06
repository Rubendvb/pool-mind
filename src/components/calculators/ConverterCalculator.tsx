"use client";
import { useState } from "react";

interface Conversion {
  label: string;
  unitA: string;
  unitB: string;
  factor: number; // A * factor = B
}

const conversions: Conversion[] = [
  { label: "Volume", unitA: "Litros (L)", unitB: "m³", factor: 1 / 1000 },
  { label: "Massa", unitA: "Gramas (g)", unitB: "Quilogramas (kg)", factor: 1 / 1000 },
  { label: "Volume líquido", unitA: "Mililitros (mL)", unitB: "Litros (L)", factor: 1 / 1000 },
];

function formatNum(n: number): string {
  const s = parseFloat(n.toPrecision(8)).toString();
  return s;
}

function ConversionRow({ label, unitA, unitB, factor }: Conversion) {
  const [a, setA] = useState("");
  const [b, setB] = useState("");

  function handleA(v: string) {
    setA(v);
    const n = parseFloat(v);
    setB(isNaN(n) ? "" : formatNum(n * factor));
  }

  function handleB(v: string) {
    setB(v);
    const n = parseFloat(v);
    setA(isNaN(n) ? "" : formatNum(n / factor));
  }

  return (
    <div className="glass p-4 space-y-3">
      <p className="text-xs font-semibold text-ocean-300 uppercase tracking-wider">{label}</p>
      <div className="flex items-end gap-2">
        <div className="flex-1 flex flex-col gap-1">
          <label className="text-xs text-white/50">{unitA}</label>
          <input
            type="number"
            inputMode="decimal"
            value={a}
            onChange={(e) => handleA(e.target.value)}
            placeholder="0"
            className="glass px-3 py-2.5 text-white text-sm placeholder-ocean-400/40 outline-none focus:ring-1 focus:ring-ocean-500 rounded-xl"
          />
        </div>

        <span className="text-white/30 pb-2.5 text-lg select-none">⇄</span>

        <div className="flex-1 flex flex-col gap-1">
          <label className="text-xs text-white/50">{unitB}</label>
          <input
            type="number"
            inputMode="decimal"
            value={b}
            onChange={(e) => handleB(e.target.value)}
            placeholder="0"
            className="glass px-3 py-2.5 text-white text-sm placeholder-ocean-400/40 outline-none focus:ring-1 focus:ring-ocean-500 rounded-xl"
          />
        </div>
      </div>
    </div>
  );
}

export function ConverterCalculator() {
  return (
    <div className="px-4 space-y-3">
      {conversions.map((c) => (
        <ConversionRow key={c.label} {...c} />
      ))}
    </div>
  );
}
