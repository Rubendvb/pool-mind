import type { Task, TaskCategory } from "@/types";
import { CompleteTaskButton } from "./CompleteTaskButton";

const categoryIcon: Record<TaskCategory, string> = {
  piscina: "🏊",
  casa: "🏠",
  jardim: "🌿",
};

const categoryColors: Record<TaskCategory, string> = {
  piscina: "text-ocean-400",
  casa: "text-ocean-300",
  jardim: "text-status-ok",
};

interface Props {
  task: Task;
}

export function TaskItem({ task }: Props) {
  const due = new Date(task.next_due + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diffDays = Math.round((due.getTime() - now.getTime()) / 864e5);

  const dueLabel =
    task.status === "atrasada"
      ? `${Math.abs(diffDays)}d atrasado`
      : diffDays === 0
      ? "Hoje"
      : diffDays === 1
      ? "Amanhã"
      : `Em ${diffDays}d`;

  const dueColor =
    task.status === "atrasada"
      ? "text-status-danger"
      : diffDays <= 1
      ? "text-status-warning"
      : "text-ocean-400";

  return (
    <div className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0">
      <div className="w-10 h-10 rounded-xl glass flex items-center justify-center text-xl flex-shrink-0">
        {categoryIcon[task.category]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{task.title}</p>
        <p className={`text-xs font-medium ${categoryColors[task.category]}`}>
          {task.category.charAt(0).toUpperCase() + task.category.slice(1)} · {task.frequency}
        </p>
      </div>
      <span className={`text-xs font-semibold flex-shrink-0 ${dueColor}`}>
        {dueLabel}
      </span>
      <CompleteTaskButton taskId={task.id} />
    </div>
  );
}
