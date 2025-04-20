export function calculateMAE(real: number[], predicted: number[]): number {
  if (real.length !== predicted.length || real.length === 0) return NaN;
  const sum = real.reduce(
    (acc, val, idx) => acc + Math.abs(val - predicted[idx]),
    0,
  );
  return sum / real.length;
}

export function calculateMAPE(real: number[], predicted: number[]): number {
  if (real.length !== predicted.length || real.length === 0) return NaN;
  const sum = real.reduce(
    (acc, val, idx) => acc + Math.abs((val - predicted[idx]) / (val || 1)),
    0,
  );
  return (sum / real.length) * 100;
}
