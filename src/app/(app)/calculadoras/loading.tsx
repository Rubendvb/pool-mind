import { Header } from "@/components/layout/Header";

export default function Loading() {
  return (
    <main className="pb-24 max-w-lg mx-auto w-full">
      <Header title="Calculadoras" subtitle="Ferramentas de cálculo rápido" />
      <div className="px-4 flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass p-4 flex items-center gap-4 animate-pulse">
            <div className="w-8 h-8 rounded-lg bg-white/10" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-36 rounded bg-white/10" />
              <div className="h-3 w-48 rounded bg-white/10" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
