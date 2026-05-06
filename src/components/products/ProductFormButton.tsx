"use client";
import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { addProduct, updateProduct } from "@/app/(app)/produtos/actions";
import type { Product, ProductCategory, ProductUnit } from "@/types";

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
              <select name="category" required defaultValue={product?.category ?? "other"} className={selectClass}>
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

          {error && (
            <p className="text-sm text-status-danger bg-status-danger/10 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="bg-ocean-700 hover:bg-ocean-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors mt-1"
          >
            {pending ? "Salvando..." : isEdit ? "Salvar alterações" : "Adicionar produto"}
          </button>
        </form>
      </Modal>
    </>
  );
}
