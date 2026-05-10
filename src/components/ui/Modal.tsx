"use client";
import { useEffect, useRef } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Modal({ open, onClose, title, children }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  // Mantém o ref sempre atualizado sem re-executar o effect principal
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open || !containerRef.current) return;

    const container = containerRef.current;
    const focusable = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE));
    focusable[0]?.focus();

    // Prevent background scroll while modal is open
    document.body.classList.add("overflow-hidden");

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onCloseRef.current(); return; }
      if (e.key !== "Tab" || !focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.classList.remove("overflow-hidden");
    };
  }, [open]); // onClose removido das deps — acessado via ref para evitar re-focus a cada re-render

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="absolute inset-0 bg-ocean-950/70 backdrop-blur-sm" onClick={onClose} />
      <div ref={containerRef} className="relative w-full max-w-lg glass-strong rounded-2xl flex flex-col max-h-[85dvh]">
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-white/10 flex-shrink-0">
          <h2 id="modal-title" className="text-lg font-bold text-white">{title}</h2>
          <button onClick={onClose} aria-label="Fechar" className="text-ocean-400 hover:text-white text-xl leading-none p-1">
            ✕
          </button>
        </div>
        <div className="overflow-y-auto px-4 pt-4 pb-6">
          {children}
        </div>
      </div>
    </div>
  );
}
