"use client";
import { useState } from "react";
import { toggleProductActive } from "@/app/(app)/produtos/actions";

interface Props {
  productId: string;
  isActive: boolean;
}

export function ToggleProductButton({ productId, isActive }: Props) {
  const [pending, setPending] = useState(false);

  async function handleClick() {
    if (pending) return;
    setPending(true);
    await toggleProductActive(productId, !isActive);
    setPending(false);
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      title={isActive ? "Desativar produto" : "Ativar produto"}
      className={`relative w-9 h-5 rounded-full transition-colors duration-200 disabled:opacity-40 flex-shrink-0 ${
        isActive ? "bg-status-ok/60" : "bg-white/15"
      }`}
    >
      <span
        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${
          isActive ? "left-4" : "left-0.5"
        }`}
      />
    </button>
  );
}
