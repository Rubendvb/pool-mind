import { describe, it, expect } from "vitest";
import { calcApplicationCost, calcStockValue, formatCurrency } from "../finance";
import type { Product } from "@/types";

// ─── helpers ───────────────────────────────────────────────────────────────

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: "prod-1",
    user_id: "user-1",
    name: "Produto Teste",
    category: "chlorine",
    manufacturer: null,
    concentration: null,
    unit: "g",
    quantity: null,
    expiration_date: null,
    notes: null,
    is_active: true,
    created_at: new Date().toISOString(),
    dosage_reference_amount: null,
    dosage_reference_liters: null,
    dosage_effect_value: null,
    dosage_effect_type: null,
    price: null,
    price_unit: null,
    package_quantity: null,
    ...overrides,
  };
}

function makeProductWithPrice(
  price: number,
  packageQuantity: number,
  priceUnit: Product["price_unit"],
  unit: Product["unit"] = "g"
): Product {
  return makeProduct({ price, package_quantity: packageQuantity, price_unit: priceUnit, unit });
}

// ─── calcApplicationCost ───────────────────────────────────────────────────

describe("calcApplicationCost", () => {
  describe("retorna null quando dados de preço estão ausentes", () => {
    it("sem price → null", () => {
      const p = makeProduct({ price: null, package_quantity: 1000, price_unit: "g" });
      expect(calcApplicationCost(100, "g", p)).toBeNull();
    });

    it("sem package_quantity → null", () => {
      const p = makeProduct({ price: 10, package_quantity: null, price_unit: "g" });
      expect(calcApplicationCost(100, "g", p)).toBeNull();
    });

    it("sem price_unit → null", () => {
      const p = makeProduct({ price: 10, package_quantity: 1000, price_unit: null });
      expect(calcApplicationCost(100, "g", p)).toBeNull();
    });

    it("package_quantity = 0 → null (evita divisão por zero)", () => {
      const p = makeProductWithPrice(10, 0, "g");
      expect(calcApplicationCost(100, "g", p)).toBeNull();
    });
  });

  describe("retorna null para unidades incompatíveis (massa ↔ volume)", () => {
    it("usar g em produto com embalagem em ml → null", () => {
      const p = makeProductWithPrice(10, 1000, "ml");
      expect(calcApplicationCost(100, "g", p)).toBeNull();
    });

    it("usar ml em produto com embalagem em kg → null", () => {
      const p = makeProductWithPrice(10, 1, "kg");
      expect(calcApplicationCost(500, "ml", p)).toBeNull();
    });

    it("usar L em produto com embalagem em g → null", () => {
      const p = makeProductWithPrice(10, 1000, "g");
      expect(calcApplicationCost(1, "L", p)).toBeNull();
    });
  });

  describe("calcula custo corretamente para mesma unidade", () => {
    it("100g de embalagem 1000g a R$10 → R$1,00", () => {
      const p = makeProductWithPrice(10, 1000, "g");
      expect(calcApplicationCost(100, "g", p)).toBeCloseTo(1.0);
    });

    it("500g de embalagem 1000g a R$20 → R$10,00", () => {
      const p = makeProductWithPrice(20, 1000, "g");
      expect(calcApplicationCost(500, "g", p)).toBeCloseTo(10.0);
    });

    it("1000g de embalagem 1000g (uso total) → preço cheio", () => {
      const p = makeProductWithPrice(15, 1000, "g");
      expect(calcApplicationCost(1000, "g", p)).toBeCloseTo(15.0);
    });

    it("250ml de embalagem 1000ml a R$8 → R$2,00", () => {
      const p = makeProductWithPrice(8, 1000, "ml");
      expect(calcApplicationCost(250, "ml", p)).toBeCloseTo(2.0);
    });

    it("0.5L de embalagem 1L a R$12 → R$6,00", () => {
      const p = makeProductWithPrice(12, 1, "L");
      expect(calcApplicationCost(0.5, "L", p)).toBeCloseTo(6.0);
    });
  });

  describe("converte entre unidades da mesma dimensão", () => {
    it("100g de embalagem 1kg (1000g) a R$10 → R$1,00", () => {
      const p = makeProductWithPrice(10, 1, "kg");
      expect(calcApplicationCost(100, "g", p)).toBeCloseTo(1.0);
    });

    it("0.1kg de embalagem 1kg a R$20 → R$2,00", () => {
      const p = makeProductWithPrice(20, 1, "kg");
      expect(calcApplicationCost(0.1, "kg", p)).toBeCloseTo(2.0);
    });

    it("500ml de embalagem 1L (1000ml) a R$5 → R$2,50", () => {
      const p = makeProductWithPrice(5, 1, "L");
      expect(calcApplicationCost(500, "ml", p)).toBeCloseTo(2.5);
    });

    it("1.5L de embalagem 1L a R$6 → R$9,00 (mais que uma embalagem)", () => {
      const p = makeProductWithPrice(6, 1, "L");
      expect(calcApplicationCost(1.5, "L", p)).toBeCloseTo(9.0);
    });
  });

  describe("casos de borda", () => {
    it("quantidade zero → R$0,00", () => {
      const p = makeProductWithPrice(10, 1000, "g");
      expect(calcApplicationCost(0, "g", p)).toBeCloseTo(0);
    });

    it("resultado é arredondado para 2 casas decimais", () => {
      // 1g de embalagem 3g a R$1 → 0.333... → arredonda para 0.33
      const p = makeProductWithPrice(1, 3, "g");
      const result = calcApplicationCost(1, "g", p);
      expect(result).not.toBeNull();
      const decimals = String(result!).split(".")[1]?.length ?? 0;
      expect(decimals).toBeLessThanOrEqual(2);
    });
  });
});

// ─── calcStockValue ─────────────────────────────────────────────────────────

describe("calcStockValue", () => {
  it("quantity null → null (estoque ilimitado/não rastreado)", () => {
    const p = makeProductWithPrice(10, 1000, "g");
    expect(calcStockValue({ ...p, quantity: null })).toBeNull();
  });

  it("sem dados de preço → null", () => {
    const p = makeProduct({ quantity: 500 });
    expect(calcStockValue(p)).toBeNull();
  });

  it("500g em estoque de embalagem 1000g a R$20 → R$10,00", () => {
    const p = makeProductWithPrice(20, 1000, "g");
    expect(calcStockValue({ ...p, quantity: 500 })).toBeCloseTo(10.0);
  });

  it("estoque zerado → R$0,00", () => {
    const p = makeProductWithPrice(20, 1000, "g");
    expect(calcStockValue({ ...p, quantity: 0 })).toBeCloseTo(0);
  });

  it("estoque equivalente a embalagem inteira → preço cheio", () => {
    const p = makeProductWithPrice(35, 1, "kg");
    expect(calcStockValue({ ...p, quantity: 1, unit: "kg" })).toBeCloseTo(35.0);
  });
});

// ─── formatCurrency ─────────────────────────────────────────────────────────

describe("formatCurrency", () => {
  it("inclui símbolo R$", () => {
    expect(formatCurrency(10)).toContain("R$");
  });

  it("formata zero corretamente", () => {
    expect(formatCurrency(0)).toMatch(/0[,.]?00/);
  });

  it("formata valor simples", () => {
    const result = formatCurrency(9.9);
    expect(result).toContain("9");
  });

  it("retorna string", () => {
    expect(typeof formatCurrency(123.45)).toBe("string");
  });

  it("sempre inclui duas casas decimais", () => {
    const result = formatCurrency(5);
    // Should have two decimal places: "R$ 5,00" or "R$5.00" depending on locale
    expect(result).toMatch(/\d{1,3}[,.]00/);
  });
});
