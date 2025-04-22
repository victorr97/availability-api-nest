/**
 * Calculates the dynamic threshold for low demand (decrease) based on days left.
 * The threshold decreases linearly from max (0.4) when 1 day left to min (0.1) at 40+ days.
 * @param daysLeft - Number of days left until the event or timeslot
 * @returns The decrease threshold as a number between 0.1 and 0.4
 */
export function getDecreaseThreshold(daysLeft: number): number {
  const min = 0.1;
  const max = 0.4;
  // Cap daysLeft between 1 and 40 to avoid out-of-range values
  const cappedDays = Math.max(Math.min(daysLeft, 40), 1);
  // Linear interpolation between min and max based on daysLeft
  return min + ((max - min) * (40 - cappedDays)) / 39;
}

/**
 * Calculates the dynamic threshold for high demand (increase) based on days left.
 * The threshold decreases linearly from max (0.7) when 1 day left to min (0.4) at 40+ days.
 * @param daysLeft - Number of days left until the event or timeslot
 * @returns The increase threshold as a number between 0.4 and 0.7
 */
export function getIncreaseThreshold(daysLeft: number): number {
  const min = 0.4;
  const max = 0.7;
  // Cap daysLeft between 1 and 40 to avoid out-of-range values
  const cappedDays = Math.max(Math.min(daysLeft, 40), 1);
  // Linear interpolation between min and max based on daysLeft
  return min + ((max - min) * (40 - cappedDays)) / 39;
}
