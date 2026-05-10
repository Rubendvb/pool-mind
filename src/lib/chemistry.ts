import type {
  Measurement,
  ChemicalParameter,
  ParameterStatus,
  DosageRecommendation,
  Product,
  ProductDosageRule,
  DosageUsageType,
} from "@/types";
import { getTodayBrazil } from "@/lib/utils/date";

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
      unit: "ppm",
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
      // Treat 0 as unknown — a reading of 0 hardness is not physically plausible
      // and almost certainly means "not measured".
      status:
        m.hardness !== null && m.hardness > 0
          ? getStatus(m.hardness, IDEALS.hardness.min, IDEALS.hardness.max)
          : "unknown",
    },
  ];
}

// Reference concentrations used in generic fallback formulas (%)
const REF_CONCENTRATION: Record<string, number> = {
  chlorine: 90,        // Triclorado 90%
  ph_up: 100,          // Barrilha (carbonato de sódio puro)
  alkalinity_up: 100,  // Bicarbonato de Sódio puro
  hardness_up: 100,    // Cloreto de Cálcio anidro puro
};

function findBestProduct(
  products: Product[],
  category: string,
  today: string
): Product | undefined {
  return products.find(
    (p) =>
      p.category === category &&
      p.is_active &&
      (p.expiration_date === null || p.expiration_date >= today) &&
      (p.quantity === null || p.quantity > 0)
  );
}

function hasCustomDosage(p: Product): boolean {
  return (
    p.dosage_reference_amount !== null &&
    p.dosage_reference_liters !== null &&
    p.dosage_effect_value !== null &&
    p.dosage_effect_value > 0
  );
}

// Applies the custom dosage formula stored on the product.
// required = ceil((delta / effect_value) * reference_amount * (volume / reference_liters))
// Delta is rounded to 4 decimal places to neutralise floating-point noise from subtraction.
function calcProductDosage(
  delta: number,
  volumeLiters: number,
  p: Product
): number {
  const cleanDelta = Math.round(delta * 10000) / 10000;
  return Math.ceil(
    (cleanDelta / p.dosage_effect_value!) *
      p.dosage_reference_amount! *
      (volumeLiters / p.dosage_reference_liters!)
  );
}

function findRule(
  rules: ProductDosageRule[],
  productId: string,
  usageType: DosageUsageType
): ProductDosageRule | undefined {
  return rules.find(
    (r) => r.product_id === productId && r.usage_type === usageType && r.is_active
  );
}

function calcRuleDosage(volumeLiters: number, rule: ProductDosageRule): number {
  return Math.ceil((volumeLiters / rule.reference_volume_liters) * rule.amount);
}

// Resolves amount + label + unit using four-tier priority:
//   1. Matching dosage rule (usage_type-aware, most specific)
//   2. Custom dosage formula (product-level formula)
//   3. Concentration-adjusted generic formula
//   4. Generic fallback (no product configured)
function resolveAmount(
  delta: number,
  volumeLiters: number,
  genericAmount: number,
  refConcentration: number,
  userProduct: Product | undefined,
  fallbackName: string,
  fallbackUnit: string,
  rules: ProductDosageRule[],
  usageType: DosageUsageType
): { amount: number; productName: string; unit: string; productId?: string; ruleName?: string } {
  if (!userProduct) {
    return { amount: genericAmount, productName: fallbackName, unit: fallbackUnit };
  }

  const productName = userProduct.name;
  const productId = userProduct.id;

  const rule = findRule(rules, productId, usageType);
  if (rule) {
    return {
      amount: calcRuleDosage(volumeLiters, rule),
      productName,
      unit: rule.unit,
      productId,
      ruleName: rule.name,
    };
  }

  const unit = userProduct.unit;

  if (hasCustomDosage(userProduct)) {
    return { amount: calcProductDosage(delta, volumeLiters, userProduct), productName, unit, productId };
  }

  if (userProduct.concentration !== null) {
    return {
      amount: Math.ceil(genericAmount * (refConcentration / userProduct.concentration)),
      productName,
      unit,
      productId,
    };
  }

  return { amount: genericAmount, productName, unit, productId };
}

export function calcDosages(
  m: Measurement,
  volumeLiters: number,
  products: Product[] = [],
  rules: ProductDosageRule[] = []
): DosageRecommendation[] {
  const today = getTodayBrazil();
  const recs: DosageRecommendation[] = [];

  // pH correction
  if (m.ph < IDEALS.ph.min) {
    const delta = IDEALS.ph.min - m.ph;
    const genericAmount = Math.ceil((delta / 0.2) * 20 * (volumeLiters / 10000));
    const userProduct = findBestProduct(products, "ph_up", today);
    const { amount, productName, unit, productId, ruleName } = resolveAmount(
      delta, volumeLiters, genericAmount, REF_CONCENTRATION.ph_up,
      userProduct, "pH+ (Barrilha)", "g", rules, "ph_correction"
    );
    recs.push({ product: productName, amount, unit, action: "add", priority: delta > 0.4 ? "urgent" : "soon", productId, ruleName });
  } else if (m.ph > IDEALS.ph.max) {
    const delta = m.ph - IDEALS.ph.max;
    const genericAmount = Math.ceil((delta / 0.2) * 20 * (volumeLiters / 10000));
    const userProduct = findBestProduct(products, "ph_down", today);

    let amount = genericAmount;
    let productName = "pH- (Ácido Muriático)";
    let unit = "ml";
    let productId: string | undefined;
    let ruleName: string | undefined;

    if (userProduct) {
      productName = userProduct.name;
      productId = userProduct.id;
      const rule = findRule(rules, productId, "ph_correction");
      if (rule) {
        amount = calcRuleDosage(volumeLiters, rule);
        unit = rule.unit;
        ruleName = rule.name;
      } else {
        unit = userProduct.unit;
        if (hasCustomDosage(userProduct)) {
          amount = calcProductDosage(delta, volumeLiters, userProduct);
        }
        // Concentration adjustment omitted for pH-: molarity varies widely; rule or custom formula preferred
      }
    }

    recs.push({ product: productName, amount, unit, action: "add", priority: delta > 0.4 ? "urgent" : "soon", productId, ruleName });
  }

  // Chlorine correction — low value picks shock vs maintenance based on severity
  if (m.chlorine < IDEALS.chlorine.min) {
    const isShock = m.chlorine < 0.5;
    const usageType: DosageUsageType = isShock ? "shock" : "maintenance";
    const delta = IDEALS.chlorine.min - m.chlorine;
    const genericAmount = Math.ceil((delta / 0.5) * 10 * (volumeLiters / 10000));
    const userProduct = findBestProduct(products, "chlorine", today);
    const { amount, productName, unit, productId, ruleName } = resolveAmount(
      delta, volumeLiters, genericAmount, REF_CONCENTRATION.chlorine,
      userProduct, "Triclorado 90%", "g", rules, usageType
    );
    recs.push({ product: productName, amount, unit, action: "add", priority: isShock ? "urgent" : "soon", productId, ruleName });
  } else if (m.chlorine > IDEALS.chlorine.max) {
    recs.push({ product: "Cloro Livre", amount: 0, unit: "", action: "reduce", priority: m.chlorine > 5 ? "urgent" : "soon" });
  }

  // Alkalinity correction — manufacturer formula: 20g raises 10 ppm per 1000L, targeting 100 ppm
  if (m.alkalinity < IDEALS.alkalinity.min) {
    const target = (IDEALS.alkalinity.min + IDEALS.alkalinity.max) / 2; // 100 ppm
    const delta = target - m.alkalinity;
    const genericAmount = Math.ceil((delta / 10) * (volumeLiters / 1000) * 20);
    const userProduct = findBestProduct(products, "alkalinity_up", today);
    const { amount, productName, unit, productId, ruleName } = resolveAmount(
      delta, volumeLiters, genericAmount, REF_CONCENTRATION.alkalinity_up,
      userProduct, "Bicarbonato de Sódio", "g", rules, "alkalinity_correction"
    );
    recs.push({ product: productName, amount, unit, action: "add", priority: "soon", productId, ruleName });
  }

  // Hardness correction (skip if null or 0 — treated as "not measured")
  if (m.hardness !== null && m.hardness > 0 && m.hardness < IDEALS.hardness.min) {
    const delta = IDEALS.hardness.min - m.hardness;
    const genericAmount = Math.ceil((delta / 10) * 15 * (volumeLiters / 10000));
    const userProduct = findBestProduct(products, "hardness_up", today);
    const { amount, productName, unit, productId, ruleName } = resolveAmount(
      delta, volumeLiters, genericAmount, REF_CONCENTRATION.hardness_up,
      userProduct, "Cloreto de Cálcio", "g", rules, "custom"
    );
    recs.push({ product: productName, amount, unit, action: "add", priority: "soon", productId, ruleName });
  }

  return recs;
}

export function overallStatus(params: ChemicalParameter[]): ParameterStatus {
  if (params.some((p) => p.status === "danger")) return "danger";
  if (params.some((p) => p.status === "warning")) return "warning";
  return "ok";
}
