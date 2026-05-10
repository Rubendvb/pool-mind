"use client";
import { useState, useTransition, useRef } from "react";
import { updatePoolVolume } from "@/app/(app)/actions";

interface Props {
  poolId: string;
  volume: number;
}

const inputClass =
  "glass flex-1 min-w-0 px-3 py-2 text-white text-sm outline-none focus:ring-1 focus:ring-ocean-500 rounded-xl";

export function VolumeEditor({ poolId, volume }: Props) {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function startEdit() {
    setInputValue(String(volume));
    setError(null);
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  }

  function cancel() {
    setEditing(false);
    setError(null);
  }

  function save() {
    const num = Number(inputValue);
    if (!num || num <= 0 || isNaN(num)) {
      setError("O volume deve ser maior que zero");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await updatePoolVolume(poolId, num);
      if (result?.error) {
        setError(result.error);
      } else {
        setEditing(false);
      }
    });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") save();
    if (e.key === "Escape") cancel();
  }

  if (editing) {
    return (
      <div className="glass px-4 py-3 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="number"
            min="1"
            step="100"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isPending}
            className={inputClass}
            autoFocus
          />
          <span className="text-sm text-ocean-400 flex-shrink-0">L</span>
          <button
            onClick={save}
            disabled={isPending}
            aria-busy={isPending}
            className="bg-ocean-700 hover:bg-ocean-600 disabled:opacity-50 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors flex-shrink-0"
          >
            {isPending ? "..." : "Salvar"}
          </button>
          <button
            onClick={cancel}
            disabled={isPending}
            className="text-ocean-400/60 hover:text-white text-lg leading-none px-1 py-2 transition-colors flex-shrink-0"
            aria-label="Cancelar"
          >
            ✕
          </button>
        </div>
        {error && <p role="alert" className="text-xs text-status-danger pl-1">{error}</p>}
      </div>
    );
  }

  return (
    <div className="glass px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <span className="text-base">💧</span>
        <div>
          <p className="text-xs text-ocean-400 font-medium leading-none mb-0.5">Volume da piscina</p>
          <p className="text-sm font-semibold text-white">
            {volume.toLocaleString("pt-BR")} L
          </p>
        </div>
      </div>
      <button
        onClick={startEdit}
        className="p-1.5 rounded-lg text-ocean-400/50 hover:text-ocean-300 hover:bg-white/10 transition-all"
        title="Editar volume"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      </button>
    </div>
  );
}
