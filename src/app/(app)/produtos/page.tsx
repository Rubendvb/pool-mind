import { Header } from "@/components/layout/Header";
import { ProductItem } from "@/components/products/ProductItem";
import { ProductFormButton } from "@/components/products/ProductFormButton";
import { ShoppingListButton } from "@/components/products/ShoppingListButton";
import { getProducts } from "@/lib/supabase/queries";
import type { Product } from "@/types";

function isLowStock(p: Product): boolean {
  if (p.quantity === null) return false;
  if (p.unit === "kg" || p.unit === "L") return p.quantity <= 1;
  return p.quantity <= 500;
}

function isExpiringSoon(p: Product): boolean {
  if (!p.expiration_date) return false;
  const exp = new Date(p.expiration_date + "T00:00:00");
  const diffMs = exp.getTime() - Date.now();
  return diffMs >= 0 && diffMs <= 30 * 864e5;
}

export default async function ProdutosPage() {
  const products = await getProducts();

  const activeCount = products.filter((p) => p.is_active).length;
  const subtitle = products.length === 0
    ? "Nenhum produto cadastrado"
    : `${activeCount} ativo${activeCount !== 1 ? "s" : ""} · ${products.length} total`;

  const lowStock = products.filter(isLowStock);
  const expiringSoon = products.filter(isExpiringSoon);

  return (
    <main className="pb-24 max-w-lg mx-auto w-full">
      <Header
        title="Produtos"
        subtitle={subtitle}
        action={
          <div className="flex items-center gap-2">
            <ShoppingListButton lowStock={lowStock} expiringSoon={expiringSoon} />
            <ProductFormButton />
          </div>
        }
      />

      <div className="px-4 flex flex-col gap-3">
        {(lowStock.length > 0 || expiringSoon.length > 0) && (
          <div className="glass border border-status-warning/30 rounded-2xl px-4 py-3 flex flex-col gap-1">
            <p className="text-xs font-semibold text-status-warning">Atenção</p>
            {lowStock.length > 0 && (
              <p className="text-xs text-ocean-300">
                {lowStock.length} produto{lowStock.length > 1 ? "s" : ""} com estoque baixo:{" "}
                {lowStock.map((p) => p.name).join(", ")}.
              </p>
            )}
            {expiringSoon.length > 0 && (
              <p className="text-xs text-ocean-300">
                {expiringSoon.length} produto{expiringSoon.length > 1 ? "s" : ""} vencendo em breve:{" "}
                {expiringSoon.map((p) => p.name).join(", ")}.
              </p>
            )}
          </div>
        )}

        {products.length === 0 && (
          <div className="glass p-8 text-center flex flex-col items-center gap-3">
            <span className="text-4xl">🧴</span>
            <div>
              <p className="text-sm font-semibold text-white">Nenhum produto cadastrado</p>
              <p className="text-xs text-ocean-400 mt-1">
                Adicione os produtos que você usa para receber dosagens personalizadas.
              </p>
            </div>
          </div>
        )}

        {products.map((product) => (
          <ProductItem key={product.id} product={product} />
        ))}

        {products.length > 0 && (
          <p className="text-xs text-ocean-400/60 text-center py-2">
            Produtos ativos são usados nos cálculos de dosagem do dashboard.
          </p>
        )}
      </div>
    </main>
  );
}
