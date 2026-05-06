"use client";
import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { addMeasurement } from "@/app/(app)/medicoes/actions";

interface Props {
  poolId: string;
  poolVolume: number;
}

const fields = [
  { name: "ph", label: "pH", min: "0", max: "14", step: "0.1", placeholder: "7.2 – 7.6", required: true },
  { name: "chlorine", label: "Cloro Livre (mg/L)", min: "0", max: "20", step: "0.1", placeholder: "1.0 – 3.0", required: true },
  { name: "alkalinity", label: "Alcalinidade (ppm)", min: "0", max: "500", step: "1", placeholder: "80 – 120", required: true },
  { name: "hardness", label: "Dureza (mg/L) — opcional", min: "0", max: "1000", step: "1", placeholder: "200 – 400", required: false },
];

export function NewMeasurementButton({ poolId, poolVolume }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const result = await addMeasurement(poolId, new FormData(e.currentTarget));
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
      <button
        onClick={() => setOpen(true)}
        className="glass px-4 py-2 text-sm font-semibold text-ocean-300 hover:text-white transition-colors rounded-xl"
      >
        + Nova
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Nova Medição">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-ocean-400 font-medium">Volume atual da piscina (L)</label>
            <input
              name="pool_volume"
              type="number"
              min="1"
              step="100"
              defaultValue={poolVolume}
              required
              className="glass px-3 py-2.5 text-white placeholder-ocean-400/50 outline-none focus:ring-1 focus:ring-ocean-500 rounded-xl text-sm"
            />
            <p className="text-xs text-ocean-400/60 mt-0.5">
              Ajuste o volume caso a piscina esteja com mais ou menos água antes de calcular as dosagens.
            </p>
          </div>
          <div className="border-t border-white/10 my-1" />
          <div className="grid grid-cols-2 gap-3">
            {fields.map((f) => (
              <div key={f.name} className="flex flex-col gap-1">
                <label className="text-xs text-ocean-400 font-medium">{f.label}</label>
                <input
                  name={f.name}
                  type="number"
                  min={f.min}
                  max={f.max}
                  step={f.step}
                  placeholder={f.placeholder}
                  required={f.required}
                  className="glass px-3 py-2.5 text-white placeholder-ocean-400/50 outline-none focus:ring-1 focus:ring-ocean-500 rounded-xl text-sm"
                />
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-ocean-400 font-medium">Observações (opcional)</label>
            <input
              name="notes"
              type="text"
              placeholder="Ex: Após chuva forte"
              className="glass px-3 py-2.5 text-white placeholder-ocean-400/50 outline-none focus:ring-1 focus:ring-ocean-500 rounded-xl text-sm"
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
            {pending ? "Salvando..." : "Salvar medição"}
          </button>
        </form>
      </Modal>
    </>
  );
}
