/**
 * Classifies a timeslot as "Hot", "Cold", or "Normal" based on its sold ratio compared to the average.
 * - "Hot timeslot": soldRatio is significantly above average (> 20% higher)
 * - "Cold timeslot": soldRatio is significantly below average (> 20% lower)
 * - "Normal timeslot": soldRatio is within ±20% of the average
 *
 * @param soldRatio - The sold ratio for the current timeslot
 * @param avgSoldRatio - The average sold ratio for comparison
 * @returns A string classification for the timeslot
 */
export function calculateComparative(
  soldRatio: number,
  avgSoldRatio: number,
): string {
  if (soldRatio > avgSoldRatio * 1.2) return 'Hot timeslot';
  if (soldRatio < avgSoldRatio * 0.8) return 'Cold timeslot';
  return 'Normal timeslot';
}
