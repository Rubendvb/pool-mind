import { Header } from "@/components/layout/Header";
import { ProductItem } from "@/components/products/ProductItem";
import { ProductFormButton } from "@/components/products/ProductFormButton";
import { getProducts } from "@/lib/supabase/queries";

export default async function ProdutosPage() {
  const products = await getProducts();

  const activeCount = products.filter((p) => p.is_active).length;
  const subtitle = products.length === 0
    ? "Nenhum produto cadastrado"
    : `${activeCount} ativo${activeCount !== 1 ? "s" : ""} · ${products.length} total`;

  return (
    <main className="pb-24 max-w-lg mx-auto w-full">
      <Header
        title="Produtos"
        subtitle={subtitle}
        action={<ProductFormButton />}
      />

      <div className="px-4 flex flex-col gap-3">
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
