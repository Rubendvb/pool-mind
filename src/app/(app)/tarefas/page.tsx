import { Header } from "@/components/layout/Header";
import { TaskItem } from "@/components/tasks/TaskItem";
import { NewTaskButton } from "@/components/tasks/NewTaskButton";
import { getTasks } from "@/lib/supabase/queries";
import type { TaskCategory } from "@/types";

const sections: { category: TaskCategory; label: string; icon: string }[] = [
  { category: "piscina", label: "Piscina", icon: "🏊" },
  { category: "jardim", label: "Jardim", icon: "🌿" },
  { category: "casa", label: "Casa", icon: "🏠" },
];

export default async function TarefasPage() {
  const tasks = await getTasks() ?? [];
  const overdue = tasks.filter((t) => t?.status === "atrasada");

  return (
    <main className="pb-24 max-w-lg mx-auto w-full">
      <Header
        title="Tarefas"
        subtitle={overdue.length > 0 ? `${overdue.length} em atraso` : "Tudo em dia"}
        action={<NewTaskButton />}
      />

      <div className="px-4 flex flex-col gap-4">
        {tasks.length === 0 && (
          <div className="glass p-6 text-center">
            <span className="text-3xl">✅</span>
            <p className="text-sm text-ocean-300 mt-2">Nenhuma tarefa cadastrada.</p>
            <p className="text-xs text-ocean-400 mt-1">Toque em "+ Nova" para criar a primeira.</p>
          </div>
        )}

        {overdue.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-status-danger uppercase tracking-wider mb-2">
              Em Atraso
            </h2>
            <div className="glass px-4 border-l-2 border-status-danger/50">
              {overdue.map((t) => t && <TaskItem key={t.id} task={t} />)}
            </div>
          </section>
        )}

        {sections.map(({ category, label, icon }) => {
          const sectionTasks = tasks.filter(
            (t) => t?.category === category && t?.status !== "atrasada"
          );
          if (sectionTasks.length === 0) return null;
          return (
            <section key={category}>
              <h2 className="text-xs font-semibold text-ocean-400 uppercase tracking-wider mb-2">
                {icon} {label}
              </h2>
              <div className="glass px-4">
                {sectionTasks.map((t) => t && <TaskItem key={t.id} task={t} />)}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
