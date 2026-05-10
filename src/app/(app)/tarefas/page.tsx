import { Header } from "@/components/layout/Header";
import { TaskItem } from "@/components/tasks/TaskItem";
import { DeleteTaskButton } from "@/components/tasks/DeleteTaskButton";
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

  const activeTasks = tasks.filter((t) => t?.status !== "concluida");
  const completedTasks = tasks.filter((t) => t?.status === "concluida");
  const overdue = activeTasks.filter((t) => t?.status === "atrasada");

  const subtitle =
    overdue.length > 0
      ? `${overdue.length} em atraso`
      : activeTasks.length === 0
      ? "Nenhuma tarefa ativa"
      : "Tudo em dia";

  return (
    <main className="pb-24 max-w-lg mx-auto w-full">
      <Header
        title="Tarefas"
        subtitle={subtitle}
        action={<NewTaskButton />}
      />

      <div className="px-4 flex flex-col gap-4">
        {activeTasks.length === 0 && completedTasks.length === 0 && (
          <div className="glass p-6 text-center">
            <span className="text-3xl">✅</span>
            <p className="text-sm text-ocean-300 mt-2">Nenhuma tarefa cadastrada.</p>
            <p className="text-xs text-ocean-400 mt-1">Toque em "+ Nova" para criar a primeira.</p>
          </div>
        )}

        {/* Tarefas em atraso */}
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

        {/* Tarefas ativas por categoria */}
        {sections.map(({ category, label, icon }) => {
          const sectionTasks = activeTasks.filter(
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

        {/* Tarefas concluídas — colapsável */}
        {completedTasks.length > 0 && (
          <section>
            <details className="group">
              <summary className="flex items-center justify-between cursor-pointer list-none py-1">
                <h2 className="text-xs font-semibold text-ocean-400 uppercase tracking-wider">
                  ✅ Concluídas ({completedTasks.length})
                </h2>
                <span className="text-xs text-ocean-400/60 group-open:hidden">▼ ver</span>
                <span className="text-xs text-ocean-400/60 hidden group-open:inline">▲ ocultar</span>
              </summary>

              <div className="glass px-4 mt-2">
                {completedTasks.map((t) => {
                  if (!t) return null;
                  const date = new Date(t.next_due + "T00:00:00").toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                  });
                  return (
                    <div
                      key={t.id}
                      className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-ocean-300 line-through truncate">{t.title}</p>
                        <p className="text-xs text-ocean-400/60 mt-0.5">
                          {t.category.charAt(0).toUpperCase() + t.category.slice(1)} · {date}
                        </p>
                      </div>
                      <DeleteTaskButton taskId={t.id} />
                    </div>
                  );
                })}
              </div>
            </details>
          </section>
        )}
      </div>
    </main>
  );
}
