import type {
  Measurement,
  ChemicalParameter,
  ParameterStatus,
  DosageRecommendation,
  Product,
} from "@/types";

const IDEALS = {
  ph: { min: 7.2, max: 7.6 },
  chlorine: { min: 1.0, max: 3.0 },
  alkalinity: { min: 80, max: 120 },
  hardness: { min: 200, max: 400 },
};

function getStatus(value: number, min: number, max: number): ParameterStatus {
  if (value >= min && value <= max) return "ok";
  const range = max - min;
  const tolerance = range * 0.25;
  if (value >= min - tolerance && value <= max + tolerance) return "warning";
  return "danger";
}

export function buildParameters(m: Measurement): ChemicalParameter[] {
  return [
    {
      key: "ph",
      label: "pH",
      value: m.ph,
      unit: "",
      ideal: IDEALS.ph,
      status: getStatus(m.ph, IDEALS.ph.min, IDEALS.ph.max),
    },
    {
      key: "chlorine",
      label: "Cloro Livre",
      value: m.chlorine,
      unit: "mg/L",
      ideal: IDEALS.chlorine,
      status: getStatus(m.chlorine, IDEALS.chlorine.min, IDEALS.chlorine.max),
    },
    {
      key: "alkalinity",
      label: "Alcalinidade",
      value: m.alkalinity,
      unit: "mg/L",
      ideal: IDEALS.alkalinity,
      status: getStatus(
        m.alkalinity,
        IDEALS.alkalinity.min,
        IDEALS.alkalinity.max
      ),
    },
    {
      key: "hardness",
      label: "Dureza",
      value: m.hardness,
      unit: "mg/L",
      ideal: IDEALS.hardness,
      status: m.hardness !== null ? getStatus(m.hardness, IDEALS.hardness.min, IDEALS.hardness.max) : "unknown",
    },
  ];
}

// Concentrações de referência usadas nas fórmulas base (%)
const REF_CONCENTRATION: Record<string, number> = {
  chlorine: 90,      // Triclorado 90%
  ph_up: 100,        // Barrilha (carbonato de sódio puro)
  alkalinity_up: 100, // Bicarbonato de Sódio puro
};

function findBestProduct(products: Product[], category: string, today: string): Product | undefined {
  return products.find(
    (p) =>
      p.category === category &&
      p.is_active &&
      (p.expiration_date === null || p.expiration_date >= today) &&
      (p.quantity === null || p.quantity > 0)
  );
}

export function calcDosages(
  m: Measurement,
  volumeLiters: number,
  products: Product[] = []
): DosageRecommendation[] {
  const today = new Date().toISOString().split("T")[0];
  const recs: DosageRecommendation[] = [];

  // pH correction
  if (m.ph < IDEALS.ph.min) {
    const delta = IDEALS.ph.min - m.ph;
    const baseAmount = Math.ceil((delta / 0.2) * 20 * (volumeLiters / 10000));
    const userProduct = findBestProduct(products, "ph_up", today);

    let amount = baseAmount;
    let productName = "pH+ (Barrilha)";
    let unit: string = "g";

    if (userProduct) {
      productName = userProduct.name;
      unit = userProduct.unit;
      if (userProduct.concentration !== null) {
        amount = Math.ceil(baseAmount * (REF_CONCENTRATION.ph_up / userProduct.concentration));
      }
    }

    recs.push({ product: productName, amount, unit, action: "add", priority: delta > 0.4 ? "urgent" : "soon" });
  } else if (m.ph > IDEALS.ph.max) {
    const delta = m.ph - IDEALS.ph.max;
    const baseAmount = Math.ceil((delta / 0.2) * 20 * (volumeLiters / 10000));
    const userProduct = findBestProduct(products, "ph_down", today);

    // Fórmula de pH- é em ml (molalidade); apenas substitui o nome, sem ajuste de concentração
    recs.push({
      product: userProduct ? userProduct.name : "pH- (Ácido Muriático)",
      amount: baseAmount,
      unit: userProduct ? userProduct.unit : "ml",
      action: "add",
      priority: delta > 0.4 ? "urgent" : "soon",
    });
  }

  // Chlorine correction
  if (m.chlorine < IDEALS.chlorine.min) {
    const delta = IDEALS.chlorine.min - m.chlorine;
    const baseAmount = Math.ceil((delta / 0.5) * 10 * (volumeLiters / 10000));
    const userProduct = findBestProduct(products, "chlorine", today);

    let amount = baseAmount;
    let productName = "Triclorado 90%";
    let unit: string = "g";

    if (userProduct) {
      productName = userProduct.name;
      unit = userProduct.unit;
      if (userProduct.concentration !== null) {
        amount = Math.ceil(baseAmount * (REF_CONCENTRATION.chlorine / userProduct.concentration));
      }
    }

    recs.push({ product: productName, amount, unit, action: "add", priority: m.chlorine < 0.5 ? "urgent" : "soon" });
  } else if (m.chlorine > IDEALS.chlorine.max) {
    recs.push({
      product: "Cloro Livre",
      amount: 0,
      unit: "",
      action: "reduce",
      priority: m.chlorine > 5 ? "urgent" : "soon",
    });
  }

  // Alkalinity correction
  if (m.alkalinity < IDEALS.alkalinity.min) {
    const delta = IDEALS.alkalinity.min - m.alkalinity;
    const baseAmount = Math.ceil((delta / 10) * 15 * (volumeLiters / 10000));
    const userProduct = findBestProduct(products, "alkalinity_up", today);

    let amount = baseAmount;
    let productName = "Bicarbonato de Sódio";
    let unit: string = "g";

    if (userProduct) {
      productName = userProduct.name;
      unit = userProduct.unit;
      if (userProduct.concentration !== null) {
        amount = Math.ceil(baseAmount * (REF_CONCENTRATION.alkalinity_up / userProduct.concentration));
      }
    }

    recs.push({ product: productName, amount, unit, action: "add", priority: "soon" });
  }

  return recs;
}

export function overallStatus(
  params: ChemicalParameter[]
): ParameterStatus {
  if (params.some((p) => p.status === "danger")) return "danger";
  if (params.some((p) => p.status === "warning")) return "warning";
  return "ok";
}
