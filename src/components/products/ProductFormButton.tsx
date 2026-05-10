"use client";
import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { useToast } from "@/components/ui/Toast";
import { addProduct, updateProduct } from "@/app/(app)/produtos/actions";
import { DosageRulesSection } from "./DosageRulesSection";
import type { Product, ProductCategory, ProductUnit, DosageEffectType } from "@/types";

const CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: "chlorine", label: "Cloro" },
  { value: "ph_up", label: "pH+" },
  { value: "ph_down", label: "pH-" },
  { value: "alkalinity_up", label: "Alcalinidade" },
  { value: "algaecide", label: "Algicida" },
  { value: "clarifier", label: "Clarificante" },
  { value: "stabilizer", label: "Estabilizante" },
  { value: "hardness_up", label: "Dureza" },
  { value: "other", label: "Outro" },
];

const UNITS: ProductUnit[] = ["g", "kg", "ml", "L"];

const EFFECT_TYPES: { value: DosageEffectType; label: string }[] = [
  { value: "chlorine_ppm", label: "Cloro (mg/L)" },
  { value: "ph_delta", label: "Delta de pH" },
  { value: "alkalinity_ppm", label: "Alcalinidade (ppm)" },
  { value: "hardness_ppm", label: "Dureza (mg/L)" },
];

const DEFAULT_EFFECT_TYPE: Partial<Record<ProductCategory, DosageEffectType>> = {
  chlorine: "chlorine_ppm",
  ph_up: "ph_delta",
  ph_down: "ph_delta",
  alkalinity_up: "alkalinity_ppm",
  hardness_up: "hardness_ppm",
};

const selectClass =
  "glass px-3 py-2.5 text-white outline-none focus:ring-1 focus:ring-ocean-500 rounded-xl text-sm bg-transparent appearance-none";
const inputClass =
  "glass px-3 py-2.5 text-white placeholder-ocean-400/50 outline-none focus:ring-1 focus:ring-ocean-500 rounded-xl text-sm";
const labelClass = "text-xs text-ocean-400 font-medium";

interface Props {
  product?: Product;
}

export function ProductFormButton({ product }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [showDosage, setShowDosage] = useState(
    !!(product?.dosage_reference_amount || product?.dosage_effect_value)
  );
  const [showPrice, setShowPrice] = useState(!!(product?.price || product?.package_quantity));
  const [showRules, setShowRules] = useState(false);
  const [category, setCategory] = useState<ProductCategory>(product?.category ?? "other");
  const isEdit = !!product;

  function handleOpen() {
    setError(null);
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = isEdit
      ? await updateProduct(product.id, formData)
      : await addProduct(formData);
    if (result?.error) {
      setError(result.error);
      setPending(false);
    } else {
      setOpen(false);
      setPending(false);
      toast(isEdit ? "Produto atualizado!" : "Produto adicionado!");
    }
  }

  return (
    <>
      {isEdit ? (
        <button
          onClick={handleOpen}
          title="Editar produto"
          className="p-1.5 rounded-lg text-ocean-400/50 hover:text-ocean-300 hover:bg-white/10 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
      ) : (
        <button
          onClick={handleOpen}
          className="glass px-4 py-2 text-sm font-semibold text-ocean-300 hover:text-white transition-colors rounded-xl"
        >
          + Produto
        </button>
      )}

      <Modal
        open={open}
        onClose={() => { if (!pending) setOpen(false); }}
        title={isEdit ? "Editar produto" : "Novo produto"}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Nome */}
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Nome *</label>
            <input
              name="name"
              type="text"
              required
              defaultValue={product?.name}
              placeholder="Ex: Cloro granulado 90%"
              className={inputClass}
            />
          </div>

          {/* Categoria + Unidade */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Categoria *</label>
              <select
                name="category"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className={selectClass}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value} style={{ background: "#03045e" }}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Unidade *</label>
              <select name="unit" required defaultValue={product?.unit ?? "g"} className={selectClass}>
                {UNITS.map((u) => (
                  <option key={u} value={u} style={{ background: "#03045e" }}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Concentração + Quantidade */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Concentração (%)</label>
              <input
                name="concentration"
                type="number"
                min="0"
                max="100"
                step="0.1"
                defaultValue={product?.concentration ?? ""}
                placeholder="Ex: 90"
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Quantidade disponível</label>
              <input
                name="quantity"
                type="number"
                min="0"
                step="0.01"
                defaultValue={product?.quantity ?? ""}
                placeholder="Ex: 1000"
                className={inputClass}
              />
            </div>
          </div>

          {/* Fabricante */}
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Fabricante</label>
            <input
              name="manufacturer"
              type="text"
              defaultValue={product?.manufacturer ?? ""}
              placeholder="Ex: Astral Pool"
              className={inputClass}
            />
          </div>

          {/* Validade */}
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Validade</label>
            <input
              name="expiration_date"
              type="date"
              defaultValue={product?.expiration_date ?? ""}
              className={inputClass}
            />
          </div>

          {/* Observações */}
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Observações</label>
            <input
              name="notes"
              type="text"
              defaultValue={product?.notes ?? ""}
              placeholder="Ex: Guardar em local fresco e seco"
              className={inputClass}
            />
          </div>

          {/* Dosagem personalizada */}
          <div className="flex flex-col gap-2 pt-1 border-t border-white/10">
            <button
              type="button"
              onClick={() => setShowDosage((v) => !v)}
              className="flex items-center justify-between text-xs font-semibold text-ocean-300 hover:text-white transition-colors"
            >
              <span>Dosagem personalizada</span>
              <span className="text-ocean-400">{showDosage ? "▲ ocultar" : "▼ configurar"}</span>
            </button>

            {showDosage && (
              <div className="flex flex-col gap-3">
                <p className="text-xs text-ocean-400/70 leading-relaxed">
                  Ex: 10 g deste produto em 10.000 L eleva o cloro em 0,5 mg/L → preencha: ref. 10, vol. 10.000, efeito 0,5.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className={labelClass}>Qtd. referência</label>
                    <input
                      name="dosage_reference_amount"
                      type="number"
                      min="0"
                      step="0.001"
                      defaultValue={product?.dosage_reference_amount ?? ""}
                      placeholder="Ex: 10"
                      className={inputClass}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className={labelClass}>Volume ref. (L)</label>
                    <input
                      name="dosage_reference_liters"
                      type="number"
                      min="0"
                      step="1"
                      defaultValue={product?.dosage_reference_liters ?? ""}
                      placeholder="Ex: 10000"
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className={labelClass}>Efeito por ref.</label>
                    <input
                      name="dosage_effect_value"
                      type="number"
                      min="0"
                      step="0.0001"
                      defaultValue={product?.dosage_effect_value ?? ""}
                      placeholder="Ex: 0.5"
                      className={inputClass}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className={labelClass}>Tipo de efeito</label>
                    <select
                      name="dosage_effect_type"
                      defaultValue={product?.dosage_effect_type ?? DEFAULT_EFFECT_TYPE[category] ?? ""}
                      className={selectClass}
                    >
                      <option value="" style={{ background: "#03045e" }}>—</option>
                      {EFFECT_TYPES.map((e) => (
                        <option key={e.value} value={e.value} style={{ background: "#03045e" }}>
                          {e.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Preço e embalagem */}
          <div className="flex flex-col gap-2 pt-1 border-t border-white/10">
            <button
              type="button"
              onClick={() => setShowPrice((v) => !v)}
              className="flex items-center justify-between text-xs font-semibold text-ocean-300 hover:text-white transition-colors"
            >
              <span>Preço e embalagem</span>
              <span className="text-ocean-400">{showPrice ? "▲ ocultar" : "▼ configurar"}</span>
            </button>

            {showPrice && (
              <div className="flex flex-col gap-3">
                <p className="text-xs text-ocean-400/70 leading-relaxed">
                  Ex: saco de 10 kg por R$ 89,90 → preencha: preço 89,90, qtd. 10, unidade kg.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className={labelClass}>Preço (R$)</label>
                    <CurrencyInput
                      name="price"
                      defaultValue={product?.price}
                      placeholder="89,90"
                      className={inputClass}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className={labelClass}>Qtd. embalagem</label>
                    <input
                      name="package_quantity"
                      type="number"
                      min="0"
                      step="0.001"
                      defaultValue={product?.package_quantity ?? ""}
                      placeholder="Ex: 10"
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className={labelClass}>Unidade da embalagem</label>
                  <select
                    name="price_unit"
                    defaultValue={product?.price_unit ?? ""}
                    className={selectClass}
                  >
                    <option value="" style={{ background: "#03045e" }}>—</option>
                    {UNITS.map((u) => (
                      <option key={u} value={u} style={{ background: "#03045e" }}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Regras de dosagem */}
          <div className="flex flex-col gap-2 pt-1 border-t border-white/10">
            <button
              type="button"
              onClick={() => setShowRules((v) => !v)}
              className="flex items-center justify-between text-xs font-semibold text-ocean-300 hover:text-white transition-colors"
            >
              <span>Regras de dosagem</span>
              <span className="text-ocean-400">{showRules ? "▲ ocultar" : "▼ configurar"}</span>
            </button>

            {showRules && (
              isEdit ? (
                <DosageRulesSection productId={product.id} />
              ) : (
                <p className="text-xs text-ocean-400/60">
                  Salve o produto primeiro para configurar regras de dosagem.
                </p>
              )
            )}
          </div>

          {error && (
            <p role="alert" className="text-sm text-status-danger bg-status-danger/10 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            aria-busy={pending}
            className="bg-ocean-700 hover:bg-ocean-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors mt-1"
          >
            {pending ? "Salvando..." : isEdit ? "Salvar alterações" : "Adicionar produto"}
          </button>
        </form>
      </Modal>
    </>
  );
}
