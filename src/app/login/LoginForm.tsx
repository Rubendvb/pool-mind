"use client";
import { useState } from "react";
import { signInWithEmail, signUpWithEmail } from "./actions";

export function LoginForm() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<{ error?: string; message?: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setFeedback(null);
    const data = new FormData(e.currentTarget);
    const result = mode === "login"
      ? await signInWithEmail(data)
      : await signUpWithEmail(data);
    if (result) setFeedback(result);
    setPending(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        type="email"
        name="email"
        placeholder="seu@email.com"
        required
        className="glass px-4 py-3 text-white placeholder-ocean-400/60 outline-none focus:ring-1 focus:ring-ocean-500 rounded-xl"
      />
      <input
        type="password"
        name="password"
        placeholder="Senha"
        required
        minLength={6}
        className="glass px-4 py-3 text-white placeholder-ocean-400/60 outline-none focus:ring-1 focus:ring-ocean-500 rounded-xl"
      />

      {feedback?.error && (
        <p className="text-sm text-status-danger bg-status-danger/10 px-3 py-2 rounded-lg">
          {feedback.error}
        </p>
      )}
      {feedback?.message && (
        <p className="text-sm text-status-ok bg-status-ok/10 px-3 py-2 rounded-lg">
          {feedback.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="bg-ocean-700 hover:bg-ocean-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
      >
        {pending ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}
      </button>

      <button
        type="button"
        onClick={() => { setMode(mode === "login" ? "signup" : "login"); setFeedback(null); }}
        className="text-sm text-ocean-400 hover:text-ocean-300 transition-colors"
      >
        {mode === "login" ? "Não tem conta? Criar agora" : "Já tenho conta"}
      </button>
    </form>
  );
}
