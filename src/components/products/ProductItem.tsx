import type { Product, ProductCategory } from "@/types";
import { ProductFormButton } from "./ProductFormButton";
import { DeleteProductButton } from "./DeleteProductButton";
import { ToggleProductButton } from "./ToggleProductButton";
import { calcStockValue, formatCurrency } from "@/lib/finance";

const CATEGORY_LABELS: Record<ProductCategory, string> = {
  chlorine: "Cloro",
  ph_up: "pH+",
  ph_down: "pH-",
  alkalinity_up: "Alcalinidade",
  algaecide: "Algicida",
  clarifier: "Clarificante",
  stabilizer: "Estabilizante",
  hardness_up: "Dureza",
  other: "Outro",
};

const CATEGORY_ICONS: Record<ProductCategory, string> = {
  chlorine: "⚗️",
  ph_up: "🔼",
  ph_down: "🔽",
  alkalinity_up: "⚖️",
  algaecide: "🦠",
  clarifier: "💧",
  stabilizer: "🔒",
  hardness_up: "💎",
  other: "📦",
};

function getStatus(product: Product): "ok" | "low" | "expired" | "inactive" {
  if (!product.is_active) return "inactive";
  if (product.expiration_date) {
    const today = new Date().toISOString().split("T")[0];
    if (product.expiration_date < today) return "expired";
  }
  if (product.quantity !== null) {
    const lowThreshold = product.unit === "kg" || product.unit === "L" ? 0.5 : 500;
    if (product.quantity <= lowThreshold) return "low";
  }
  return "ok";
}

const STATUS_COLORS = {
  ok: "bg-status-ok/20 text-status-ok",
  low: "bg-status-warning/20 text-status-warning",
  expired: "bg-status-danger/20 text-status-danger",
  inactive: "bg-white/10 text-ocean-400",
};

const STATUS_LABELS = {
  ok: "OK",
  low: "Estoque baixo",
  expired: "Vencido",
  inactive: "Inativo",
};

export function ProductItem({ product }: { product: Product }) {
  const status = getStatus(product);
  const categoryLabel = CATEGORY_LABELS[product.category as ProductCategory] ?? product.category;
  const categoryIcon = CATEGORY_ICONS[product.category as ProductCategory] ?? "📦";

  return (
    <div className={`glass p-4 flex gap-3 items-start ${!product.is_active ? "opacity-60" : ""}`}>
      {/* Icon */}
      <span className="text-2xl mt-0.5 flex-shrink-0">{categoryIcon}</span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-white text-sm truncate">{product.name}</span>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${STATUS_COLORS[status]}`}>
            {STATUS_LABELS[status]}
          </span>
        </div>

        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <span className="text-xs text-ocean-400">{categoryLabel}</span>
          {product.concentration !== null && (
            <span className="text-xs text-ocean-400">{product.concentration}%</span>
          )}
          {product.quantity !== null && (
            <span className="text-xs text-ocean-300 font-medium">
              {product.quantity} {product.unit} restante{product.quantity !== 1 ? "s" : ""}
            </span>
          )}
          {product.manufacturer && (
            <span className="text-xs text-ocean-400/70">{product.manufacturer}</span>
          )}
        </div>

        {product.expiration_date && (
          <p className="text-xs text-ocean-400/60 mt-0.5">
            Validade: {new Date(product.expiration_date + "T00:00:00").toLocaleDateString("pt-BR")}
          </p>
        )}
        {(() => {
          const stockValue = calcStockValue(product);
          return stockValue !== null ? (
            <p className="text-xs text-ocean-300/80 mt-0.5">
              Valor em estoque: {formatCurrency(stockValue)}
            </p>
          ) : null;
        })()}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <ToggleProductButton productId={product.id} isActive={product.is_active} />
        <ProductFormButton product={product} />
        <DeleteProductButton productId={product.id} productName={product.name} />
      </div>
    </div>
  );
}
