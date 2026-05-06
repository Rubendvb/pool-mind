import { TaskItem } from "@/components/tasks/TaskItem";
import { getTasks } from "@/lib/supabase/queries";

export async function TasksPreview() {
  const tasks = await getTasks();
  const urgent = tasks
    .filter((t) => t.status === "atrasada" || t.status === "pendente")
    .slice(0, 3);

  if (urgent.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xs font-semibold text-ocean-400 uppercase tracking-wider">
          Próximas Tarefas
        </h2>
        <a href="/tarefas" className="text-xs text-ocean-600 hover:text-ocean-500">
          Ver todas →
        </a>
      </div>
      <div className="glass px-4">
        {urgent.map((t) => (
          <TaskItem key={t.id} task={t} />
        ))}
      </div>
    </section>
  );
}
