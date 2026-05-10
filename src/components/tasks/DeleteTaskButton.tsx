"use client";
import { useState } from "react";
import { deleteTask } from "@/app/(app)/tarefas/actions";
import { useToast } from "@/components/ui/Toast";

export function DeleteTaskButton({ taskId }: { taskId: string }) {
  const [pending, setPending] = useState(false);
  const { toast } = useToast();

  async function handleClick() {
    setPending(true);
    const result = await deleteTask(taskId);
    if (result?.error) {
      toast(result.error, "error");
    } else {
      toast("Tarefa excluída.");
    }
    setPending(false);
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      title="Excluir tarefa"
      className="p-1.5 rounded-lg text-ocean-400/40 hover:text-status-danger hover:bg-status-danger/10 disabled:opacity-40 transition-all flex-shrink-0"
    >
      {pending ? (
        <span className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin block" />
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6" />
          <path d="M14 11v6" />
          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        </svg>
      )}
    </button>
  );
}
