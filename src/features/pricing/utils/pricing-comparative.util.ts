export function calculateComparative(
  soldRatio: number,
  avgSoldRatio: number,
): string {
  if (soldRatio > avgSoldRatio * 1.2) return 'Hot timeslot';
  if (soldRatio < avgSoldRatio * 0.8) return 'Cold timeslot';
  return 'Normal timeslot';
}
