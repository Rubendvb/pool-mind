"use client";
import { useState, useEffect } from "react";
import {
  getDosageRulesForProduct,
  addDosageRule,
  deleteDosageRule,
  toggleDosageRule,
} from "@/app/(app)/produtos/actions";
import type { ProductDosageRule, DosageUsageType, ProductUnit } from "@/types";

const USAGE_TYPE_OPTIONS: { value: DosageUsageType; label: string }[] = [
  { value: "maintenance", label: "Manutenção" },
  { value: "shock", label: "Choque" },
  { value: "ph_correction", label: "Correção de pH" },
  { value: "alkalinity_correction", label: "Correção de alcalinidade" },
  { value: "low_turbidity", label: "Água pouco turva" },
  { value: "medium_turbidity", label: "Água turva" },
  { value: "high_turbidity", label: "Água muito turva" },
  { value: "clarification", label: "Clarificação" },
  { value: "custom", label: "Personalizado" },
];

const UNITS: ProductUnit[] = ["g", "kg", "ml", "L"];

const labelClass = "text-xs text-ocean-400 font-medium";
const inputClass =
  "glass px-3 py-2.5 text-white placeholder-ocean-400/50 outline-none focus:ring-1 focus:ring-ocean-500 rounded-xl text-sm";
const selectClass =
  "glass px-3 py-2.5 text-white outline-none focus:ring-1 focus:ring-ocean-500 rounded-xl text-sm bg-transparent appearance-none";

interface Props {
  productId: string;
}

export function DosageRulesSection({ productId }: Props) {
  const [rules, setRules] = useState<ProductDosageRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // New rule form state
  const [newType, setNewType] = useState<DosageUsageType>("maintenance");
  const [newName, setNewName] = useState("Manutenção");
  const [newAmount, setNewAmount] = useState("");
  const [newUnit, setNewUnit] = useState<ProductUnit>("g");
  const [newVolume, setNewVolume] = useState("1000");
  const [newCondition, setNewCondition] = useState("");

  useEffect(() => {
    getDosageRulesForProduct(productId)
      .then(setRules)
      .finally(() => setLoading(false));
  }, [productId]);

  function handleTypeChange(type: DosageUsageType) {
    setNewType(type);
    const option = USAGE_TYPE_OPTIONS.find((o) => o.value === type);
    if (option) setNewName(option.label);
  }

  function resetAddForm() {
    setNewType("maintenance");
    setNewName("Manutenção");
    setNewAmount("");
    setNewUnit("g");
    setNewVolume("1000");
    setNewCondition("");
    setAddError(null);
    setShowAddForm(false);
  }

  async function handleAddRule() {
    if (!newName.trim() || !newAmount) {
      setAddError("Nome e quantidade são obrigatórios.");
      return;
    }
    setSaving(true);
    setAddError(null);

    const formData = new FormData();
    formData.set("name", newName);
    formData.set("usage_type", newType);
    formData.set("amount", newAmount);
    formData.set("unit", newUnit);
    formData.set("reference_volume_liters", newVolume);
    formData.set("condition_label", newCondition);

    const result = await addDosageRule(productId, formData);
    if (result?.error) {
      setAddError(result.error);
    } else if (result?.data) {
      setRules((prev) => [...prev, result.data as ProductDosageRule]);
      resetAddForm();
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    setRules((prev) => prev.filter((r) => r.id !== id));
    await deleteDosageRule(id);
  }

  async function handleToggle(rule: ProductDosageRule) {
    setRules((prev) =>
      prev.map((r) => (r.id === rule.id ? { ...r, is_active: !r.is_active } : r))
    );
    await toggleDosageRule(rule.id, !rule.is_active);
  }

  if (loading) {
    return <p className="text-xs text-ocean-400/60">Carregando regras...</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-ocean-400/60 leading-relaxed">
        Cada regra define quanto usar para um tipo de aplicação. Ex: 4 g a cada 1000 L para manutenção.
      </p>

      {rules.map((rule) => (
        <div key={rule.id} className="flex items-center gap-2 glass rounded-xl px-3 py-2.5">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate">{rule.name}</p>
            <p className="text-xs text-ocean-400">
              {rule.amount} {rule.unit} / {rule.reference_volume_liters} L
              {rule.condition_label && (
                <span className="text-ocean-400/60"> · {rule.condition_label}</span>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleToggle(rule)}
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors flex-shrink-0 ${
              rule.is_active
                ? "bg-status-ok/20 text-status-ok"
                : "bg-white/10 text-ocean-400"
            }`}
          >
            {rule.is_active ? "Ativa" : "Inativa"}
          </button>
          <button
            type="button"
            onClick={() => handleDelete(rule.id)}
            aria-label="Remover regra"
            className="p-1 text-ocean-400/40 hover:text-status-danger transition-colors flex-shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      ))}

      {rules.length === 0 && !showAddForm && (
        <p className="text-xs text-ocean-400/40 italic">
          Nenhuma regra — o cálculo padrão será usado.
        </p>
      )}

      {showAddForm ? (
        <div className="flex flex-col gap-3 glass rounded-xl px-3 py-3 border border-white/10">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Tipo de uso</label>
              <select
                value={newType}
                onChange={(e) => handleTypeChange(e.target.value as DosageUsageType)}
                className={selectClass}
              >
                {USAGE_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value} style={{ background: "#03045e" }}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Nome da regra</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
                placeholder="Ex: Manutenção"
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Quantidade</label>
              <input
                type="number"
                min="0.001"
                step="0.001"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                required
                placeholder="Ex: 4"
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Unidade</label>
              <select
                value={newUnit}
                onChange={(e) => setNewUnit(e.target.value as ProductUnit)}
                className={selectClass}
              >
                {UNITS.map((u) => (
                  <option key={u} value={u} style={{ background: "#03045e" }}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Por (L)</label>
              <input
                type="number"
                min="1"
                step="1"
                value={newVolume}
                onChange={(e) => setNewVolume(e.target.value)}
                required
                placeholder="1000"
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className={labelClass}>Condição (opcional)</label>
            <input
              type="text"
              value={newCondition}
              onChange={(e) => setNewCondition(e.target.value)}
              placeholder="Ex: cloro &lt; 0,5 mg/L"
              className={inputClass}
            />
          </div>

          {addError && (
            <p role="alert" className="text-xs text-status-danger">{addError}</p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={resetAddForm}
              className="flex-1 py-2 text-xs font-semibold text-ocean-400 hover:text-white transition-colors glass rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleAddRule}
              disabled={saving}
              aria-busy={saving}
              className="flex-1 py-2 text-xs font-semibold text-white bg-ocean-700 hover:bg-ocean-600 disabled:opacity-50 transition-colors rounded-xl"
            >
              {saving ? "Salvando..." : "Salvar regra"}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="text-xs text-ocean-300 hover:text-white transition-colors text-left py-0.5"
        >
          + Adicionar regra
        </button>
      )}
    </div>
  );
}
