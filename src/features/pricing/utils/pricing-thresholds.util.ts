export function getDecreaseThreshold(daysLeft: number): number {
  const min = 0.1;
  const max = 0.4;
  const cappedDays = Math.max(Math.min(daysLeft, 40), 1);
  return min + ((max - min) * (40 - cappedDays)) / 39;
}

export function getIncreaseThreshold(daysLeft: number): number {
  const min = 0.4;
  const max = 0.7;
  const cappedDays = Math.max(Math.min(daysLeft, 40), 1);
  return min + ((max - min) * (40 - cappedDays)) / 39;
}
