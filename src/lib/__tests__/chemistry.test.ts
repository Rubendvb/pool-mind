import { describe, it, expect } from "vitest";
import { buildParameters, calcDosages, overallStatus } from "../chemistry";
import type { Measurement, Product } from "@/types";

// ─── helpers ───────────────────────────────────────────────────────────────

function makeMeasurement(overrides: Partial<Measurement> = {}): Measurement {
  return {
    id: "test",
    pool_id: "pool-1",
    measured_at: new Date().toISOString(),
    ph: 7.4,
    chlorine: 1.5,
    alkalinity: 100,
    hardness: 250,
    ...overrides,
  };
}

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

// ─── buildParameters ───────────────────────────────────────────────────────

describe("buildParameters", () => {
  it("retorna 4 parâmetros com as chaves corretas", () => {
    const params = buildParameters(makeMeasurement());
    expect(params.map((p) => p.key)).toEqual(["ph", "chlorine", "alkalinity", "hardness"]);
  });

  it("pH ideal → status ok", () => {
    const params = buildParameters(makeMeasurement({ ph: 7.4 }));
    expect(params.find((p) => p.key === "ph")?.status).toBe("ok");
  });

  it("pH no limite inferior ideal → status ok", () => {
    const params = buildParameters(makeMeasurement({ ph: 7.2 }));
    expect(params.find((p) => p.key === "ph")?.status).toBe("ok");
  });

  it("pH no limite superior ideal → status ok", () => {
    const params = buildParameters(makeMeasurement({ ph: 7.6 }));
    expect(params.find((p) => p.key === "ph")?.status).toBe("ok");
  });

  it("pH levemente fora (7.15) → status warning", () => {
    const params = buildParameters(makeMeasurement({ ph: 7.15 }));
    expect(params.find((p) => p.key === "ph")?.status).toBe("warning");
  });

  it("pH muito baixo (6.0) → status danger", () => {
    const params = buildParameters(makeMeasurement({ ph: 6.0 }));
    expect(params.find((p) => p.key === "ph")?.status).toBe("danger");
  });

  it("pH muito alto (9.0) → status danger", () => {
    const params = buildParameters(makeMeasurement({ ph: 9.0 }));
    expect(params.find((p) => p.key === "ph")?.status).toBe("danger");
  });

  it("cloro ideal → status ok", () => {
    const params = buildParameters(makeMeasurement({ chlorine: 2.0 }));
    expect(params.find((p) => p.key === "chlorine")?.status).toBe("ok");
  });

  it("cloro muito baixo (0.1) → status danger", () => {
    const params = buildParameters(makeMeasurement({ chlorine: 0.1 }));
    expect(params.find((p) => p.key === "chlorine")?.status).toBe("danger");
  });

  it("alcalinidade ideal → status ok", () => {
    const params = buildParameters(makeMeasurement({ alkalinity: 100 }));
    expect(params.find((p) => p.key === "alkalinity")?.status).toBe("ok");
  });

  it("dureza null → status unknown", () => {
    const params = buildParameters(makeMeasurement({ hardness: null }));
    expect(params.find((p) => p.key === "hardness")?.status).toBe("unknown");
  });

  it("dureza ideal → status ok", () => {
    const params = buildParameters(makeMeasurement({ hardness: 300 }));
    expect(params.find((p) => p.key === "hardness")?.status).toBe("ok");
  });
});

// ─── overallStatus ─────────────────────────────────────────────────────────

describe("overallStatus", () => {
  it("todos ok → ok", () => {
    const params = buildParameters(makeMeasurement());
    expect(overallStatus(params)).toBe("ok");
  });

  it("um warning → warning", () => {
    const params = buildParameters(makeMeasurement({ ph: 7.15 }));
    expect(overallStatus(params)).toBe("warning");
  });

  it("um danger → danger", () => {
    const params = buildParameters(makeMeasurement({ ph: 6.0 }));
    expect(overallStatus(params)).toBe("danger");
  });

  it("danger tem prioridade sobre warning", () => {
    const params = buildParameters(makeMeasurement({ ph: 6.0, chlorine: 0.8 }));
    expect(overallStatus(params)).toBe("danger");
  });

  it("lista vazia → ok", () => {
    expect(overallStatus([])).toBe("ok");
  });
});

// ─── calcDosages ───────────────────────────────────────────────────────────

describe("calcDosages", () => {
  const volume = 10000; // 10.000L para simplificar os cálculos

  it("água ideal → sem recomendações", () => {
    const dosages = calcDosages(makeMeasurement(), volume);
    expect(dosages).toHaveLength(0);
  });

  describe("correção de pH", () => {
    it("pH baixo → recomenda pH+", () => {
      const dosages = calcDosages(makeMeasurement({ ph: 7.0 }), volume);
      const rec = dosages.find((d) => d.product === "pH+ (Barrilha)");
      expect(rec).toBeDefined();
      expect(rec?.action).toBe("add");
      expect(rec?.amount).toBeGreaterThan(0);
      expect(rec?.unit).toBe("g");
    });

    it("pH alto → recomenda pH-", () => {
      const dosages = calcDosages(makeMeasurement({ ph: 8.0 }), volume);
      const rec = dosages.find((d) => d.product === "pH- (Ácido Muriático)");
      expect(rec).toBeDefined();
      expect(rec?.action).toBe("add");
      expect(rec?.unit).toBe("ml");
    });

    it("pH muito baixo (6.8) → prioridade urgente", () => {
      const dosages = calcDosages(makeMeasurement({ ph: 6.8 }), volume);
      const rec = dosages.find((d) => d.product === "pH+ (Barrilha)");
      expect(rec?.priority).toBe("urgent");
    });

    it("pH levemente baixo (7.1) → prioridade soon", () => {
      const dosages = calcDosages(makeMeasurement({ ph: 7.1 }), volume);
      const rec = dosages.find((d) => d.product === "pH+ (Barrilha)");
      expect(rec?.priority).toBe("soon");
    });

    it("pH ideal → nenhuma recomendação de pH", () => {
      const dosages = calcDosages(makeMeasurement({ ph: 7.4 }), volume);
      const phRec = dosages.filter(
        (d) => d.product.includes("pH")
      );
      expect(phRec).toHaveLength(0);
    });
  });

  describe("correção de cloro", () => {
    it("cloro baixo → recomenda Triclorado", () => {
      const dosages = calcDosages(makeMeasurement({ chlorine: 0.5 }), volume);
      const rec = dosages.find((d) => d.product === "Triclorado 90%");
      expect(rec).toBeDefined();
      expect(rec?.amount).toBeGreaterThan(0);
    });

    it("cloro crítico (0.3) → prioridade urgente", () => {
      const dosages = calcDosages(makeMeasurement({ chlorine: 0.3 }), volume);
      const rec = dosages.find((d) => d.product === "Triclorado 90%");
      expect(rec?.priority).toBe("urgent");
    });

    it("cloro alto → recomenda redução", () => {
      const dosages = calcDosages(makeMeasurement({ chlorine: 4.0 }), volume);
      const rec = dosages.find((d) => d.action === "reduce");
      expect(rec).toBeDefined();
    });

    it("cloro muito alto (6.0) → redução urgente", () => {
      const dosages = calcDosages(makeMeasurement({ chlorine: 6.0 }), volume);
      const rec = dosages.find((d) => d.action === "reduce");
      expect(rec?.priority).toBe("urgent");
    });
  });

  describe("correção de alcalinidade", () => {
    it("alcalinidade baixa → recomenda Bicarbonato", () => {
      const dosages = calcDosages(makeMeasurement({ alkalinity: 60 }), volume);
      const rec = dosages.find((d) => d.product === "Bicarbonato de Sódio");
      expect(rec).toBeDefined();
      expect(rec?.amount).toBeGreaterThan(0);
      expect(rec?.unit).toBe("g");
    });

    it("alcalinidade ideal → sem bicarbonato", () => {
      const dosages = calcDosages(makeMeasurement({ alkalinity: 100 }), volume);
      const rec = dosages.find((d) => d.product === "Bicarbonato de Sódio");
      expect(rec).toBeUndefined();
    });
  });

  describe("dosagem proporcional ao volume", () => {
    it("piscina 2× maior → dose 2× maior para pH+", () => {
      const m = makeMeasurement({ ph: 7.0 });
      const dose10k = calcDosages(m, 10000).find((d) => d.product === "pH+ (Barrilha)")!;
      const dose20k = calcDosages(m, 20000).find((d) => d.product === "pH+ (Barrilha)")!;
      expect(dose20k.amount).toBeGreaterThan(dose10k.amount);
    });

    it("piscina 2× maior → dose 2× maior para Triclorado", () => {
      const m = makeMeasurement({ chlorine: 0.5 });
      const dose10k = calcDosages(m, 10000).find((d) => d.product === "Triclorado 90%")!;
      const dose20k = calcDosages(m, 20000).find((d) => d.product === "Triclorado 90%")!;
      expect(dose20k.amount).toBeGreaterThan(dose10k.amount);
    });
  });

  describe("múltiplos problemas simultâneos", () => {
    it("pH baixo + cloro baixo + alcalinidade baixa → 3 recomendações", () => {
      const dosages = calcDosages(
        makeMeasurement({ ph: 6.9, chlorine: 0.3, alkalinity: 50 }),
        volume
      );
      expect(dosages.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe("correção de dureza", () => {
    it("dureza baixa → recomenda Cloreto de Cálcio", () => {
      const dosages = calcDosages(makeMeasurement({ hardness: 150 }), volume);
      const rec = dosages.find((d) => d.product === "Cloreto de Cálcio");
      expect(rec).toBeDefined();
      expect(rec?.amount).toBeGreaterThan(0);
      expect(rec?.unit).toBe("g");
    });

    it("dureza null → sem recomendação de dureza", () => {
      const dosages = calcDosages(makeMeasurement({ hardness: null }), volume);
      const rec = dosages.find((d) => d.product === "Cloreto de Cálcio");
      expect(rec).toBeUndefined();
    });
  });

  describe("fórmula customizada de produto (Fase 2)", () => {
    it("produto com fórmula própria calcula dosagem exata para cloro", () => {
      // 10g em 10.000L eleva 0.5 ppm → para elevar 0.5 ppm em 10.000L: 10g
      const product = makeProduct({
        name: "Cloro Custom",
        category: "chlorine",
        dosage_reference_amount: 10,
        dosage_reference_liters: 10000,
        dosage_effect_value: 0.5,
        dosage_effect_type: "chlorine_ppm",
      });
      const m = makeMeasurement({ chlorine: 0.5 }); // delta = 0.5
      const dosages = calcDosages(m, 10000, [product]);
      const rec = dosages.find((d) => d.product === "Cloro Custom");
      expect(rec).toBeDefined();
      expect(rec?.amount).toBe(10); // ceil((0.5/0.5)*10*(10000/10000))
    });

    it("fórmula customizada é proporcional ao volume", () => {
      const product = makeProduct({
        name: "Cloro Custom",
        category: "chlorine",
        dosage_reference_amount: 10,
        dosage_reference_liters: 10000,
        dosage_effect_value: 0.5,
        dosage_effect_type: "chlorine_ppm",
      });
      const m = makeMeasurement({ chlorine: 0.5 });
      const dose10k = calcDosages(m, 10000, [product]).find((d) => d.product === "Cloro Custom")!;
      const dose20k = calcDosages(m, 20000, [product]).find((d) => d.product === "Cloro Custom")!;
      expect(dose20k.amount).toBe(dose10k.amount * 2);
    });

    it("produto com fórmula customizada de pH+", () => {
      // 20g em 10.000L eleva pH em 0.2 → para elevar 0.2 em 10.000L: 20g
      const product = makeProduct({
        name: "pH+ Custom",
        category: "ph_up",
        dosage_reference_amount: 20,
        dosage_reference_liters: 10000,
        dosage_effect_value: 0.2,
        dosage_effect_type: "ph_delta",
      });
      const m = makeMeasurement({ ph: 7.0 }); // delta = 0.2
      const dosages = calcDosages(m, 10000, [product]);
      const rec = dosages.find((d) => d.product === "pH+ Custom");
      expect(rec?.amount).toBe(20);
    });

    it("produto sem fórmula customizada usa ajuste por concentração", () => {
      // Cloro 45% (ref: 90%) → dose base dobra
      const product = makeProduct({
        name: "Cloro 45%",
        category: "chlorine",
        concentration: 45,
      });
      const m = makeMeasurement({ chlorine: 0.5 }); // delta = 0.5
      // baseAmount = ceil((0.5/0.5)*10*(10000/10000)) = 10
      // adjusted  = ceil(10 * (90/45)) = 20
      const dosages = calcDosages(m, 10000, [product]);
      const rec = dosages.find((d) => d.product === "Cloro 45%");
      expect(rec?.amount).toBe(20);
    });

    it("produto sem fórmula e sem concentração usa quantidade genérica", () => {
      const product = makeProduct({ name: "Cloro sem config", category: "chlorine" });
      const m = makeMeasurement({ chlorine: 0.5 });
      const generic = calcDosages(m, 10000);
      const withProduct = calcDosages(m, 10000, [product]);
      const recGeneric = generic.find((d) => d.product === "Triclorado 90%")!;
      const recProduct = withProduct.find((d) => d.product === "Cloro sem config")!;
      expect(recProduct.amount).toBe(recGeneric.amount);
    });
  });
});

// ─── integração: medição → diagnóstico completo ────────────────────────────

describe("integração: fluxo medição → recomendação", () => {
  it("água com múltiplos problemas gera diagnóstico danger e recomendações", () => {
    const measurement = makeMeasurement({ ph: 6.5, chlorine: 0.2, alkalinity: 50 });

    const params = buildParameters(measurement);
    const status = overallStatus(params);
    const dosages = calcDosages(measurement, 50000);

    expect(status).toBe("danger");
    expect(dosages.some((d) => d.priority === "urgent")).toBe(true);
    expect(dosages.every((d) => d.amount >= 0)).toBe(true);
  });

  it("água perfeita gera diagnóstico ok e zero recomendações", () => {
    const measurement = makeMeasurement({
      ph: 7.4,
      chlorine: 1.8,
      alkalinity: 100,
      hardness: 280,
    });

    const params = buildParameters(measurement);
    const status = overallStatus(params);
    const dosages = calcDosages(measurement, 50000);

    expect(status).toBe("ok");
    expect(dosages).toHaveLength(0);
  });

  it("dosagens nunca retornam valores negativos", () => {
    const cases: Partial<Measurement>[] = [
      { ph: 14, chlorine: 20, alkalinity: 500 },
      { ph: 0, chlorine: 0, alkalinity: 0 },
      { ph: 7.2, chlorine: 1.0, alkalinity: 80 },
    ];
    for (const c of cases) {
      const dosages = calcDosages(makeMeasurement(c), 50000);
      dosages.forEach((d) => expect(d.amount).toBeGreaterThanOrEqual(0));
    }
  });
});
