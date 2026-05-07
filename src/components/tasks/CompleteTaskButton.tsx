"use client";
import { useState } from "react";
import { completeTask } from "@/app/(app)/tarefas/actions";
import { useToast } from "@/components/ui/Toast";

export function CompleteTaskButton({ taskId }: { taskId: string }) {
  const [pending, setPending] = useState(false);
  const { toast } = useToast();

  async function handleClick() {
    setPending(true);
    const result = await completeTask(taskId);
    if (result?.error) {
      toast(result.error, "error");
    } else {
      toast("Tarefa concluída!");
    }
    setPending(false);
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      title="Concluir tarefa"
      className="w-7 h-7 rounded-full border-2 border-white/20 hover:border-status-ok hover:bg-status-ok/10 disabled:opacity-40 transition-all flex items-center justify-center flex-shrink-0"
    >
      {pending ? (
        <span className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" />
      ) : (
        <span className="text-xs text-white/40 hover:text-status-ok">✓</span>
      )}
    </button>
  );
}
