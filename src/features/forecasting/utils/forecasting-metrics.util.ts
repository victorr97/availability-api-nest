/**
 * Calculates Mean Absolute Error (MAE) between real and predicted values.
 * Returns NaN if arrays are empty or of different lengths.
 */
export function calculateMAE(real: number[], predicted: number[]): number {
  if (real.length !== predicted.length || real.length === 0) return NaN;
  const sum = real.reduce(
    (acc, val, idx) => acc + Math.abs(val - predicted[idx]),
    0,
  );
  return sum / real.length;
}

/**
 * Calculates Mean Absolute Percentage Error (MAPE) between real and predicted values.
 * Returns NaN if arrays are empty or of different lengths.
 * Uses (val || 1) to avoid division by zero.
 */
export function calculateMAPE(real: number[], predicted: number[]): number {
  if (real.length !== predicted.length || real.length === 0) return NaN;
  const sum = real.reduce(
    (acc, val, idx) => acc + Math.abs((val - predicted[idx]) / (val || 1)),
    0,
  );
  return (sum / real.length) * 100;
}
