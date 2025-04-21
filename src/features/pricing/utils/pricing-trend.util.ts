/**
 * Calculates the sales trend for a timeslot based on stock at three points: initial, mid, and final.
 *
 * @param initial - Stock at the beginning of the period
 * @param mid - Stock at the midpoint of the period
 * @param final - Stock at the end of the period
 * @returns A string indicating the trend: 'Accelerating', 'Slowing down', 'Constant', or '' if final is zero
 */
export function calculateTrend(
  initial: number,
  mid: number,
  final: number,
): string {
  // Calculate tickets sold in the first and second halves of the period
  const soldFirstHalf = initial - mid;
  const soldSecondHalf = mid - final;
  // If no stock left at the end, return empty string
  if (final === 0) return '';
  // If more tickets were sold in the second half, sales are accelerating
  if (soldSecondHalf > soldFirstHalf) return 'Accelerating';
  // If fewer tickets were sold in the second half, sales are slowing down
  if (soldSecondHalf < soldFirstHalf) return 'Slowing down';
  // Otherwise, sales are constant
  return 'Constant';
}
