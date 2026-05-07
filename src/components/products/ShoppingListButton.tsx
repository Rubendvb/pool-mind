"use client";
import { useToast } from "@/components/ui/Toast";
import type { Product } from "@/types";

interface Props {
  lowStock: Product[];
  expiringSoon: Product[];
}

function formatItem(p: Product, reason: string): string {
  const qty = p.quantity !== null ? `${p.quantity} ${p.unit} restantes` : "sem controle de estoque";
  return `• ${p.name} (${reason} — ${qty})`;
}

export function ShoppingListButton({ lowStock, expiringSoon }: Props) {
  const { toast } = useToast();
  const total = lowStock.length + expiringSoon.length;
  if (total === 0) return null;

  async function handleCopy() {
    const lines: string[] = [
      "📋 Lista de Compras — Pool Mind",
      `Data: ${new Date().toLocaleDateString("pt-BR")}`,
      "",
    ];

    if (lowStock.length > 0) {
      lines.push("ESTOQUE BAIXO:");
      lowStock.forEach((p) => lines.push(formatItem(p, "estoque baixo")));
      lines.push("");
    }

    if (expiringSoon.length > 0) {
      lines.push("VENCENDO EM BREVE:");
      expiringSoon.forEach((p) => {
        const exp = p.expiration_date
          ? new Date(p.expiration_date + "T00:00:00").toLocaleDateString("pt-BR")
          : "data desconhecida";
        lines.push(`• ${p.name} (vence ${exp})`);
      });
      lines.push("");
    }

    lines.push("Gerado pelo Pool Mind");

    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      toast("Lista copiada para a área de transferência!");
    } catch {
      toast("Não foi possível copiar. Tente manualmente.", "error");
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="glass px-3 py-1.5 text-xs font-semibold text-ocean-300 hover:text-white transition-colors rounded-xl flex items-center gap-1.5"
    >
      <span>📋</span>
      Copiar lista ({total})
    </button>
  );
}
