// Converts raw digit string to BRL display (no R$ prefix).
// "8990" → "89,90"  |  "123456" → "1.234,56"
export function maskBRL(rawDigits: string): string {
  const digits = rawDigits.replace(/\D/g, "").slice(0, 13);
  if (!digits) return "";
  return (parseInt(digits, 10) / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Extracts numeric value from BRL display string.
// "1.234,56" → 1234.56  |  "89,90" → 89.9
export function parseBRL(display: string): number {
  const digits = display.replace(/\D/g, "");
  if (!digits) return 0;
  return parseInt(digits, 10) / 100;
}

// Converts a stored number to the initial digit string for the mask.
// 89.9 → "8990"  |  1234.56 → "123456"
export function numberToMaskDigits(value: number): string {
  return String(Math.round(value * 100));
}
