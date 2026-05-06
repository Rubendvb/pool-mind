export type PoolShape = "rectangular" | "round" | "oval";

// All dimensions in meters; result in liters
export function calcRectangular(length: number, width: number, depth: number): number {
  return length * width * depth * 1000;
}

export function calcRound(diameter: number, depth: number): number {
  return Math.PI * (diameter / 2) ** 2 * depth * 1000;
}

export function calcOval(length: number, width: number, depth: number): number {
  return length * width * depth * 0.785 * 1000;
}

export function avgDepth(shallow: number, deep: number): number {
  return (shallow + deep) / 2;
}
