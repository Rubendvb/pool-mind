import type { Product } from "@/types";

// Base conversion factors: all mass units → grams, all volume units → milliliters
const TO_BASE: Record<string, number> = { g: 1, kg: 1000, ml: 1, L: 1000 };
const IS_MASS: Record<string, boolean> = { g: true, kg: true, ml: false, L: false };

function toBase(value: number, unit: string): number | null {
  const factor = TO_BASE[unit];
  return factor !== undefined ? value * factor : null;
}

// Calculates the cost of applying `quantityUsed` [quantityUnit] of a product.
// Returns null when the product has no price data or units are incompatible.
export function calcApplicationCost(
  quantityUsed: number,
  quantityUnit: string,
  product: Product
): number | null {
  if (!product.price || !product.package_quantity || !product.price_unit) return null;

  const packageBase = toBase(product.package_quantity, product.price_unit);
  const quantityBase = toBase(quantityUsed, quantityUnit);

  if (packageBase === null || quantityBase === null || packageBase === 0) return null;

  // Reject mixed dimensions (mass ↔ volume)
  if (IS_MASS[product.price_unit] !== IS_MASS[quantityUnit]) return null;

  const pricePerBase = product.price / packageBase;
  return Math.round(pricePerBase * quantityBase * 100) / 100;
}

// Estimated market value of the current stock.
export function calcStockValue(product: Product): number | null {
  if (product.quantity === null) return null;
  return calcApplicationCost(product.quantity, product.unit, product);
}

export function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
