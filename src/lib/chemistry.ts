import type {
  Measurement,
  ChemicalParameter,
  ParameterStatus,
  DosageRecommendation,
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

export function calcDosages(
  m: Measurement,
  volumeLiters: number
): DosageRecommendation[] {
  const recs: DosageRecommendation[] = [];

  // pH correction
  if (m.ph < IDEALS.ph.min) {
    // Need to raise pH: use pH+/barrilha (soda ash)
    // ~20g per 10,000L raises pH by ~0.2
    const delta = IDEALS.ph.min - m.ph;
    const amount = Math.ceil((delta / 0.2) * 20 * (volumeLiters / 10000));
    recs.push({
      product: "pH+ (Barrilha)",
      amount,
      unit: "g",
      action: "add",
      priority: delta > 0.4 ? "urgent" : "soon",
    });
  } else if (m.ph > IDEALS.ph.max) {
    // Need to lower pH: use pH-/ácido muriático
    // ~20ml per 10,000L lowers pH by ~0.2
    const delta = m.ph - IDEALS.ph.max;
    const amount = Math.ceil((delta / 0.2) * 20 * (volumeLiters / 10000));
    recs.push({
      product: "pH- (Ácido Muriático)",
      amount,
      unit: "ml",
      action: "add",
      priority: delta > 0.4 ? "urgent" : "soon",
    });
  }

  // Chlorine correction
  if (m.chlorine < IDEALS.chlorine.min) {
    // ~10g triclorado (90%) per 10,000L raises ~0.5 mg/L
    const delta = IDEALS.chlorine.min - m.chlorine;
    const amount = Math.ceil((delta / 0.5) * 10 * (volumeLiters / 10000));
    recs.push({
      product: "Triclorado 90%",
      amount,
      unit: "g",
      action: "add",
      priority: m.chlorine < 0.5 ? "urgent" : "soon",
    });
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
    // ~15g bicarbonato per 10,000L raises ~10 mg/L
    const delta = IDEALS.alkalinity.min - m.alkalinity;
    const amount = Math.ceil((delta / 10) * 15 * (volumeLiters / 10000));
    recs.push({
      product: "Bicarbonato de Sódio",
      amount,
      unit: "g",
      action: "add",
      priority: "soon",
    });
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
