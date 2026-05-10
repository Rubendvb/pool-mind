"use client";
import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { updateTask } from "@/app/(app)/tarefas/actions";
import type { Task } from "@/types";

const inputClass =
  "glass px-3 py-2.5 text-white placeholder-ocean-400/50 outline-none focus:ring-1 focus:ring-ocean-500 rounded-xl text-sm";
const selectClass =
  "glass px-3 py-2.5 text-white outline-none focus:ring-1 focus:ring-ocean-500 rounded-xl text-sm bg-transparent";

export function EditTaskButton({ task }: { task: Task }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const result = await updateTask(task.id, new FormData(e.currentTarget));
    if (result?.error) {
      setError(result.error);
      setPending(false);
    } else {
      setOpen(false);
      setPending(false);
      toast("Tarefa atualizada!");
    }
  }

  return (
    <>
      <button
        onClick={() => { setError(null); setOpen(true); }}
        title="Editar tarefa"
        className="p-1 rounded-lg text-ocean-400/40 hover:text-ocean-300 hover:bg-white/10 transition-all flex-shrink-0"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      </button>

      <Modal open={open} onClose={() => { if (!pending) setOpen(false); }} title="Editar tarefa">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-ocean-400 font-medium">Título</label>
            <input name="title" type="text" defaultValue={task.title} required className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-ocean-400 font-medium">Categoria</label>
              <select name="category" required defaultValue={task.category} className={selectClass}>
                <option value="piscina" style={{ background: "#03045e" }}>🏊 Piscina</option>
                <option value="jardim"  style={{ background: "#03045e" }}>🌿 Jardim</option>
                <option value="casa"    style={{ background: "#03045e" }}>🏠 Casa</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-ocean-400 font-medium">Frequência</label>
              <select name="frequency" required defaultValue={task.frequency} className={selectClass}>
                <option value="unica"     style={{ background: "#03045e" }}>Única vez</option>
                <option value="diaria"    style={{ background: "#03045e" }}>Diária</option>
                <option value="semanal"   style={{ background: "#03045e" }}>Semanal</option>
                <option value="quinzenal" style={{ background: "#03045e" }}>Quinzenal</option>
                <option value="mensal"    style={{ background: "#03045e" }}>Mensal</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-ocean-400 font-medium">Próxima execução</label>
            <input name="next_due" type="date" defaultValue={task.next_due} required className={inputClass} />
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
