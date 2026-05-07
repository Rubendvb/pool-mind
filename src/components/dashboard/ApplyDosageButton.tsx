"use client";
import { useState, useTransition } from "react";
import type { Product, DosageRecommendation } from "@/types";
import { confirmProductApplication } from "@/app/(app)/actions";
import { calcApplicationCost, formatCurrency } from "@/lib/finance";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

interface Props {
  dosage: DosageRecommendation;
  product: Product;
  measurementId: string | null;
}

const inputClass =
  "glass px-3 py-2.5 text-white placeholder-ocean-400/50 outline-none focus:ring-1 focus:ring-ocean-500 rounded-xl text-sm";
const labelClass = "text-xs text-ocean-400 font-medium";

export function ApplyDosageButton({ dosage, product, measurementId }: Props) {
  const [open, setOpen] = useState(false);
  const [qty, setQty] = useState(String(dosage.amount));
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const qtyNum = parseFloat(qty) || 0;
  const cost = calcApplicationCost(qtyNum, dosage.unit, product);

  function handleOpen() {
    setQty(String(dosage.amount));
    setNotes("");
    setError(null);
    setOpen(true);
  }

  function handleSubmit() {
    if (!qtyNum || qtyNum <= 0) {
      setError("Quantidade deve ser maior que zero");
      return;
    }
    startTransition(async () => {
      const result = await confirmProductApplication(
        product.id,
        qtyNum,
        dosage.unit,
        cost,
        measurementId,
        notes || null
      );
      if (result?.error) {
        setError(result.error);
      } else {
        setOpen(false);
        toast("Aplicação registrada!");
      }
    });
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="text-xs px-2 py-0.5 rounded-lg bg-ocean-700/50 hover:bg-ocean-600/70 text-ocean-300 hover:text-white transition-colors font-medium"
      >
        Aplicar
      </button>

      <Modal
        open={open}
        onClose={() => { if (!isPending) setOpen(false); }}
        title="Confirmar aplicação"
      >
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-sm font-semibold text-white">{product.name}</p>
            {product.quantity !== null && (
              <p className="text-xs text-ocean-400 mt-0.5">
                Estoque atual: {product.quantity} {product.unit}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className={labelClass}>Quantidade usada ({dosage.unit})</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              className={inputClass}
            />
          </div>

          {cost !== null && (
            <div className="glass p-3 text-center">
              <p className="text-xs text-ocean-400">Custo estimado</p>
              <p className="text-lg font-bold text-white">{formatCurrency(cost)}</p>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className={labelClass}>Observações</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Opcional"
              className={inputClass}
            />
          </div>

          {error && (
            <p className="text-sm text-status-danger bg-status-danger/10 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="bg-ocean-700 hover:bg-ocean-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {isPending ? "Registrando..." : "Confirmar aplicação"}
          </button>
        </div>
      </Modal>
    </>
  );
}
