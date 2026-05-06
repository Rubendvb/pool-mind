import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-dvh flex items-center justify-center px-6">
      <div className="w-full max-w-sm flex flex-col gap-8">
        <div className="text-center">
          <span className="text-5xl">🌊</span>
          <h1 className="text-3xl font-bold text-white mt-3">Pool Mind</h1>
          <p className="text-ocean-400 mt-1 text-sm">
            Controle inteligente da sua piscina
          </p>
        </div>
        <div className="glass-strong p-6">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
