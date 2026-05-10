"use client";
import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { editMeasurement } from "@/app/(app)/medicoes/actions";
import type { Measurement } from "@/types";

interface Props {
  measurement: Measurement;
  poolId: string;
  poolVolume: number;
}

const inputClass =
  "glass px-3 py-2.5 text-white placeholder-ocean-400/50 outline-none focus:ring-1 focus:ring-ocean-500 rounded-xl text-sm";

function toDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function EditMeasurementButton({ measurement, poolId, poolVolume }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const raw = formData.get("measured_at") as string;
    if (raw) formData.set("measured_at", new Date(raw).toISOString());

    const result = await editMeasurement(measurement.id, formData);
    if (result?.error) {
      setError(result.error);
      setPending(false);
    } else {
      setOpen(false);
      setPending(false);
      toast("Medição atualizada!");
    }
  }

  return (
    <>
      <button
        onClick={() => { setError(null); setOpen(true); }}
        title="Editar medição"
        className="p-1.5 rounded-lg text-ocean-400/50 hover:text-ocean-300 hover:bg-white/10 transition-all"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      </button>

      <Modal open={open} onClose={() => { if (!pending) setOpen(false); }} title="Editar medição">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-ocean-400 font-medium">Data e hora</label>
            <input
              name="measured_at"
              type="datetime-local"
              defaultValue={toDatetimeLocal(measurement.measured_at)}
              required
              className={inputClass}
            />
          </div>

          <div className="border-t border-white/10 my-1" />

          <div className="flex flex-col gap-1">
            <label className="text-xs text-ocean-400 font-medium">Volume da piscina (L)</label>
            <input name="pool_volume" type="number" min="1" step="1" defaultValue={poolVolume} required className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { name: "ph", label: "pH", defaultValue: measurement.ph, step: "0.1", min: "0", max: "14" },
              { name: "chlorine", label: "Cloro Livre (mg/L)", defaultValue: measurement.chlorine, step: "0.1", min: "0", max: "20" },
              { name: "alkalinity", label: "Alcalinidade (ppm)", defaultValue: measurement.alkalinity, step: "1", min: "0", max: "500" },
              { name: "hardness", label: "Dureza (mg/L) — opcional", defaultValue: measurement.hardness ?? "", step: "1", min: "1", max: "1000" },
            ].map((f) => (
              <div key={f.name} className="flex flex-col gap-1">
                <label className="text-xs text-ocean-400 font-medium">{f.label}</label>
                <input
                  name={f.name}
                  type="number"
                  min={f.min}
                  max={f.max}
                  step={f.step}
                  defaultValue={String(f.defaultValue)}
                  required={f.name !== "hardness"}
                  className={inputClass}
                />
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-ocean-400 font-medium">Observações (opcional)</label>
            <input
              name="notes"
              type="text"
              defaultValue={measurement.notes ?? ""}
              placeholder="Ex: Após chuva forte"
              className={inputClass}
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-status-danger bg-status-danger/10 px-3 py-2 rounded-lg">{error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            aria-busy={pending}
            className="bg-ocean-700 hover:bg-ocean-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors mt-1"
          >
            {pending ? "Salvando..." : "Salvar alterações"}
          </button>
        </form>
      </Modal>
    </>
  );
}
