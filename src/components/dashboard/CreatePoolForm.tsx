"use client";
import { useState } from "react";
import { createPool } from "@/app/(app)/actions";

export function CreatePoolForm() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const result = await createPool(new FormData(e.currentTarget));
    if (result?.error) setError(result.error);
    setPending(false);
  }

  return (
    <div className="px-4">
      <div className="glass-strong p-6 flex flex-col gap-5">
        <div className="text-center">
          <span className="text-4xl">🏊</span>
          <h2 className="text-lg font-bold text-white mt-2">Configurar Piscina</h2>
          <p className="text-sm text-ocean-400 mt-1">Vamos começar com os dados da sua piscina</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            name="name"
            placeholder="Nome (ex: Piscina Principal)"
            defaultValue="Piscina Principal"
            required
            className="glass px-4 py-3 text-white placeholder-ocean-400/60 outline-none focus:ring-1 focus:ring-ocean-500 rounded-xl"
          />
          <div className="flex gap-3">
            <input
              name="volume"
              type="number"
              placeholder="Volume (litros)"
              min={1000}
              required
              className="glass px-4 py-3 text-white placeholder-ocean-400/60 outline-none focus:ring-1 focus:ring-ocean-500 rounded-xl flex-1 min-w-0"
            />
            <select
              name="type"
              required
              className="glass px-4 py-3 text-white outline-none focus:ring-1 focus:ring-ocean-500 rounded-xl bg-transparent"
            >
              <option value="fibra" className="bg-ocean-900">Fibra</option>
              <option value="vinil" className="bg-ocean-900">Vinil</option>
              <option value="alvenaria" className="bg-ocean-900">Alvenaria</option>
            </select>
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
            className="bg-ocean-700 hover:bg-ocean-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {pending ? "Salvando..." : "Salvar piscina"}
          </button>
        </form>
      </div>
    </div>
  );
}
