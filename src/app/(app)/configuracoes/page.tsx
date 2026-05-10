import { Header } from "@/components/layout/Header";
import { LogoutButton } from "@/components/layout/LogoutButton";
import { createClient } from "@/lib/supabase/server";

export default async function ConfiguracoesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <main className="pb-24 max-w-lg mx-auto w-full">
      <Header title="Configurações" subtitle="Conta e preferências" />

      <div className="px-4 flex flex-col gap-4">
        {/* Conta */}
        <section>
          <h2 className="text-xs font-semibold text-ocean-400 uppercase tracking-wider mb-2">
            Conta
          </h2>
          <div className="glass p-4 flex flex-col gap-3">
            <div>
              <p className="text-xs text-ocean-400 font-medium">E-mail</p>
              <p className="text-sm text-white mt-0.5">{user?.email ?? "—"}</p>
            </div>
            <div className="border-t border-white/10" />
            <div>
              <p className="text-xs text-ocean-400 font-medium mb-1">Senha</p>
              <p className="text-xs text-ocean-400/60">
                Para alterar sua senha, saia e use a opção &quot;Esqueci minha senha&quot; na tela de login.
              </p>
            </div>
          </div>
        </section>

        {/* Sessão */}
        <section>
          <h2 className="text-xs font-semibold text-ocean-400 uppercase tracking-wider mb-2">
            Sessão
          </h2>
          <div className="glass p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Sair da conta</p>
                <p className="text-xs text-ocean-400/60 mt-0.5">
                  Encerra a sessão neste dispositivo
                </p>
              </div>
              <LogoutButton />
            </div>
          </div>
        </section>

        {/* Versão */}
        <p className="text-center text-xs text-ocean-400/30 pb-2">
          Pool Mind v0.1.0
        </p>
      </div>
    </main>
  );
}
