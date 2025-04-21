export function calculateTrend(
  initial: number,
  mid: number,
  final: number,
): string {
  const soldFirstHalf = initial - mid;
  const soldSecondHalf = mid - final;
  if (final === 0) return '';
  if (soldSecondHalf > soldFirstHalf) return 'Accelerating';
  if (soldSecondHalf < soldFirstHalf) return 'Slowing down';
  return 'Constant';
}
