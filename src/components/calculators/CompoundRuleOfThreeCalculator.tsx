"use client";
import { useState } from "react";

type ProportionType = "direct" | "inverse";

interface Row {
  id: number;
  before: string;
  after: string;
  type: ProportionType;
}

let _nextId = 3;

function compute(reference: string, rows: Row[]): number | null {
  const ref = parseFloat(reference);
  if (isNaN(ref)) return null;

  let result = ref;
  for (const row of rows) {
    const a = parseFloat(row.before);
    const b = parseFloat(row.after);
    if (isNaN(a) || isNaN(b) || a === 0 || b === 0) return null;
    result *= row.type === "direct" ? b / a : a / b;
  }
  return result;
}

function format(n: number): string {
  return Number.isInteger(n) ? n.toString() : n.toFixed(4).replace(/\.?0+$/, "");
}

const inputClass =
  "glass flex-1 min-w-0 px-3 py-2 text-sm rounded-xl outline-none text-white placeholder-ocean-400/40 focus:ring-1 focus:ring-ocean-500";

export function CompoundRuleOfThreeCalculator() {
  const [reference, setReference] = useState("");
  const [rows, setRows] = useState<Row[]>([
    { id: 1, before: "", after: "", type: "direct" },
    { id: 2, before: "", after: "", type: "direct" },
  ]);

  function addRow() {
    setRows((prev) => [...prev, { id: _nextId++, before: "", after: "", type: "direct" }]);
  }

  function removeRow(id: number) {
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  function update(id: number, field: Omit<keyof Row, "id">, value: string) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field as string]: value } : r)));
  }

  function toggleType(id: number) {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, type: r.type === "direct" ? "inverse" : "direct" } : r
      )
    );
  }

  function clear() {
    setReference("");
    setRows([
      { id: _nextId++, before: "", after: "", type: "direct" },
      { id: _nextId++, before: "", after: "", type: "direct" },
    ]);
  }

  const result = compute(reference, rows);
  const displayResult = result !== null ? format(result) : null;

  return (
    <div className="px-4 space-y-4">
      {/* Fórmula */}
      <div className="glass p-4 text-center">
        <p className="text-ocean-300 font-mono text-sm tracking-wide">
          X = ref × ∏ diretas(B÷A) × ∏ inversas(A÷B)
        </p>
        <p className="text-xs text-white/40 mt-1">
          Informe o valor de referência e as proporções
        </p>
      </div>

      {/* Referência */}
      <div className="glass p-4 flex flex-col gap-2">
        <label className="text-xs font-bold text-ocean-400 tracking-wider">
          VALOR DE REFERÊNCIA
        </label>
        <div className="flex items-center gap-3">
          <input
            type="number"
            inputMode="decimal"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="valor conhecido"
            className="glass flex-1 px-3 py-2.5 text-sm rounded-xl outline-none text-white placeholder-ocean-400/40 focus:ring-1 focus:ring-ocean-500"
          />
          <span className="text-ocean-300 font-bold text-sm shrink-0">→ X = ?</span>
        </div>
      </div>

      {/* Proporções */}
      <div className="glass p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-ocean-400 tracking-wider">PROPORÇÕES</label>
          <div className="flex gap-2 text-xs text-ocean-400/50 mr-6">
            <span className="w-16 text-center">Antes</span>
            <span className="w-16 text-center">Depois</span>
          </div>
        </div>

        {rows.map((row) => (
          <div key={row.id} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => toggleType(row.id)}
              title={row.type === "direct" ? "Direta — clique para inversa" : "Inversa — clique para direta"}
              className={`shrink-0 w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                row.type === "direct"
                  ? "bg-ocean-600/40 text-ocean-300"
                  : "bg-amber-600/30 text-amber-300"
              }`}
            >
              {row.type === "direct" ? "D" : "I"}
            </button>
            <input
              type="number"
              inputMode="decimal"
              value={row.before}
              onChange={(e) => update(row.id, "before", e.target.value)}
              placeholder="antes"
              className={inputClass}
            />
            <span className="text-ocean-400/50 text-xs shrink-0">→</span>
            <input
              type="number"
              inputMode="decimal"
              value={row.after}
              onChange={(e) => update(row.id, "after", e.target.value)}
              placeholder="depois"
              className={inputClass}
            />
            {rows.length > 1 && (
              <button
                type="button"
                onClick={() => removeRow(row.id)}
                className="shrink-0 text-ocean-400/30 hover:text-red-400 transition-colors text-xl leading-none"
              >
                ×
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={addRow}
          className="text-xs text-ocean-400 hover:text-ocean-300 transition-colors text-left"
        >
          + Adicionar proporção
        </button>
      </div>

      {/* Resultado */}
      {displayResult !== null && (
        <div className="glass-strong p-4 text-center">
          <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Resultado</p>
          <p className="text-3xl font-bold text-ocean-300">X = {displayResult}</p>
        </div>
      )}

      <button
        type="button"
        onClick={clear}
        className="w-full glass py-2.5 text-sm font-medium text-white/60 hover:text-white rounded-xl transition-colors"
      >
        Limpar
      </button>
    </div>
  );
}
