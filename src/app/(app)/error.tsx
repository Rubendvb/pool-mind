"use client";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="pb-24 max-w-lg mx-auto w-full px-4 py-16 flex flex-col items-center gap-4">
      <span className="text-5xl">⚠️</span>
      <div className="text-center">
        <p className="text-base font-semibold text-white">Algo deu errado</p>
        <p className="text-sm text-ocean-400 mt-1">
          {error.message || "Erro inesperado ao carregar esta página."}
        </p>
      </div>
      <button
        onClick={reset}
        className="glass px-5 py-2.5 text-sm font-semibold text-ocean-300 hover:text-white rounded-xl transition-colors"
      >
        Tentar novamente
      </button>
    </main>
  );
}
