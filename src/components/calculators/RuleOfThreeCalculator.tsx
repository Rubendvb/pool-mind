"use client";
import { useState, useEffect } from "react";

type Field = "a" | "b" | "c" | "x";

// A / B = C / X  →  A × X = B × C
function solve(vals: Record<Field, string>, target: Field): number | null {
  const get = (k: Field) => {
    if (k === target) return null;
    const v = parseFloat(vals[k]);
    return isNaN(v) ? null : v;
  };
  const a = get("a");
  const b = get("b");
  const c = get("c");
  const x = get("x");

  if (target === "x" && a !== null && b !== null && c !== null && a !== 0)
    return (b * c) / a;
  if (target === "c" && a !== null && b !== null && x !== null && b !== 0)
    return (a * x) / b;
  if (target === "a" && b !== null && c !== null && x !== null && x !== 0)
    return (b * c) / x;
  if (target === "b" && a !== null && c !== null && x !== null && c !== 0)
    return (a * x) / c;
  return null;
}

function NumInput({
  label,
  value,
  onChange,
  readOnly,
  highlight,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  readOnly: boolean;
  highlight: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-bold text-ocean-400 tracking-wider">{label}</label>
      <input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        readOnly={readOnly}
        placeholder={readOnly ? "resultado" : "0"}
        className={`glass px-3 py-2.5 text-sm rounded-xl outline-none placeholder-ocean-400/40 transition-all ${
          highlight
            ? "border border-ocean-400/60 text-ocean-300 bg-ocean-700/20"
            : "text-white focus:ring-1 focus:ring-ocean-500"
        } ${readOnly ? "cursor-default" : ""}`}
      />
    </div>
  );
}

export function RuleOfThreeCalculator() {
  const [values, setValues] = useState<Record<Field, string>>({
    a: "",
    b: "",
    c: "",
    x: "",
  });
  const [solveFor, setSolveFor] = useState<Field>("x");

  useEffect(() => {
    const empty = (Object.keys(values) as Field[]).filter((k) => values[k] === "");
    if (empty.length === 1) setSolveFor(empty[0]);
  }, [values]);

  const result = solve(values, solveFor);
  const displayResult =
    result !== null ? (Number.isInteger(result) ? result.toString() : result.toFixed(4).replace(/\.?0+$/, "")) : "";

  function set(field: Field) {
    return (v: string) => {
      setValues((prev) => ({ ...prev, [field]: v }));
    };
  }

  function clear() {
    setValues({ a: "", b: "", c: "", x: "" });
    setSolveFor("x");
  }

  const fields: Field[] = ["a", "b", "c", "x"];

  return (
    <div className="px-4 space-y-4">
      {/* Formula display */}
      <div className="glass p-4 text-center">
        <p className="text-ocean-300 font-mono text-lg tracking-widest">A ÷ B = C ÷ X</p>
        <p className="text-xs text-white/40 mt-1">
          Deixe o campo que deseja calcular em branco
        </p>
      </div>

      {/* Inputs */}
      <div className="glass p-4 grid grid-cols-2 gap-4">
        {fields.map((f) => (
          <NumInput
            key={f}
            label={f.toUpperCase()}
            value={f === solveFor ? displayResult : values[f]}
            onChange={f === solveFor ? () => {} : set(f)}
            readOnly={f === solveFor}
            highlight={f === solveFor}
          />
        ))}
      </div>

      {/* Result summary */}
      {result !== null && (
        <div className="glass-strong p-4 text-center">
          <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Resultado</p>
          <p className="text-3xl font-bold text-ocean-300">
            {solveFor.toUpperCase()} = {displayResult}
          </p>
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-2">
        <button
          onClick={clear}
          className="flex-1 glass py-2.5 text-sm font-medium text-white/60 hover:text-white rounded-xl transition-colors"
        >
          Limpar
        </button>
        <button
          onClick={() => {
            const next: Field[] = ["a", "b", "c", "x"];
            setSolveFor(next[(next.indexOf(solveFor) + 1) % 4]);
          }}
          className="flex-1 bg-ocean-700/60 hover:bg-ocean-700 py-2.5 text-sm font-medium text-white rounded-xl transition-colors"
        >
          Calcular {solveFor === "x" ? "A" : solveFor === "a" ? "B" : solveFor === "b" ? "C" : "X"}
        </button>
      </div>
    </div>
  );
}
