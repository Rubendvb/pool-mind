"use client";
import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { deleteMeasurement } from "@/app/(app)/medicoes/actions";

export function DeleteMeasurementButton({ measurementId }: { measurementId: string }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleOpen() {
    setError(null);
    setOpen(true);
  }

  async function handleConfirm() {
    if (pending) return;
    setPending(true);
    setError(null);
    const result = await deleteMeasurement(measurementId);
    if (result?.error) {
      setError(result.error);
      setPending(false);
    }
    // em caso de sucesso, revalidatePath desmonta o componente automaticamente
  }

  return (
    <>
      <button
        onClick={handleOpen}
        title="Excluir medição"
        className="p-1.5 rounded-lg text-ocean-400/50 hover:text-status-danger hover:bg-status-danger/10 transition-all"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6M14 11v6" />
          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        </svg>
      </button>

      <Modal
        open={open}
        onClose={() => { if (!pending) setOpen(false); }}
        title="Excluir medição?"
      >
        <p className="text-sm text-ocean-300 mb-2">
          Tem certeza que deseja remover esta medição do histórico? Esta ação não poderá ser desfeita.
        </p>

        {error && (
          <p className="text-xs text-status-danger mb-4">{error}</p>
        )}

        <div className="flex gap-3 justify-end mt-6">
          <button
            onClick={() => setOpen(false)}
            disabled={pending}
            className="px-4 py-2 rounded-xl text-sm font-medium text-ocean-300 hover:text-white hover:bg-white/10 disabled:opacity-40 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={pending}
            autoFocus
            className="px-4 py-2 rounded-xl text-sm font-bold bg-status-danger/15 text-status-danger hover:bg-status-danger/25 disabled:opacity-40 transition-all flex items-center gap-2"
          >
            {pending && (
              <span className="w-3.5 h-3.5 border border-status-danger/40 border-t-status-danger rounded-full animate-spin" />
            )}
            Excluir
          </button>
        </div>
      </Modal>
    </>
  );
}
