"use client";
import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { addTask } from "@/app/(app)/tarefas/actions";

export function NewTaskButton() {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const today = new Date().toLocaleDateString("en-CA");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const result = await addTask(new FormData(e.currentTarget));
    if (result?.error) {
      setError(result.error);
      setPending(false);
    } else {
      setOpen(false);
      setPending(false);
      toast("Tarefa criada!");
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

      <Modal open={open} onClose={() => setOpen(false)} title="Nova Tarefa">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-ocean-400 font-medium">Título</label>
            <input
              name="title"
              type="text"
              placeholder="Ex: Limpar skimmer"
              required
              className="glass px-3 py-2.5 text-white placeholder-ocean-400/50 outline-none focus:ring-1 focus:ring-ocean-500 rounded-xl text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-ocean-400 font-medium">Categoria</label>
              <select
                name="category"
                required
                className="glass px-3 py-2.5 text-white outline-none focus:ring-1 focus:ring-ocean-500 rounded-xl text-sm bg-transparent"
              >
                <option value="piscina" className="bg-ocean-900">🏊 Piscina</option>
                <option value="jardim" className="bg-ocean-900">🌿 Jardim</option>
                <option value="casa" className="bg-ocean-900">🏠 Casa</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-ocean-400 font-medium">Frequência</label>
              <select
                name="frequency"
                required
                className="glass px-3 py-2.5 text-white outline-none focus:ring-1 focus:ring-ocean-500 rounded-xl text-sm bg-transparent"
              >
                <option value="diaria" className="bg-ocean-900">Diária</option>
                <option value="semanal" className="bg-ocean-900">Semanal</option>
                <option value="quinzenal" className="bg-ocean-900">Quinzenal</option>
                <option value="mensal" className="bg-ocean-900">Mensal</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-ocean-400 font-medium">Próxima execução</label>
            <input
              name="next_due"
              type="date"
              defaultValue={today}
              required
              className="glass px-3 py-2.5 text-white outline-none focus:ring-1 focus:ring-ocean-500 rounded-xl text-sm"
            />
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
            {pending ? "Salvando..." : "Criar tarefa"}
          </button>
        </form>
      </Modal>
    </>
  );
}
