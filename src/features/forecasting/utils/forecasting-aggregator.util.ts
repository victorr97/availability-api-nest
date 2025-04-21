/**
 * Aggregates data by timeslot, grouping all quantities for each timeslot across dates.
 * Returns an object where each key is a timeslot (e.g., "10:00") and the value is an array of { date, quantity }.
 */
export function aggregateByTimeslotWithDate(
  data: any[],
): Record<string, { date: string; quantity: number }[]> {
  const timeslotAggregates: Record<
    string,
    { date: string; quantity: number }[]
  > = {};
  for (const entry of data) {
    for (const timeslot of entry.timeslots) {
      if (!timeslotAggregates[timeslot.time]) {
        timeslotAggregates[timeslot.time] = [];
      }
      timeslotAggregates[timeslot.time].push({
        date: entry.date,
        quantity: timeslot.quantity,
      });
    }
  }
  return timeslotAggregates;
}

/**
 * Aggregates data by day of week and timeslot.
 * Returns an object where each key is a day of week (0=Sunday, 6=Saturday),
 * and each value is an object mapping timeslot to an array of { date, quantity }.
 */
export function aggregateByDayAndTimeslotWithDate(
  data: any[],
): Record<number, Record<string, { date: string; quantity: number }[]>> {
  const aggregates: Record<
    number,
    Record<string, { date: string; quantity: number }[]>
  > = {};
  for (const entry of data) {
    const dayOfWeek = new Date(entry.date).getDay();
    if (!aggregates[dayOfWeek]) {
      aggregates[dayOfWeek] = {};
    }
    for (const timeslot of entry.timeslots) {
      if (!aggregates[dayOfWeek][timeslot.time]) {
        aggregates[dayOfWeek][timeslot.time] = [];
      }
      aggregates[dayOfWeek][timeslot.time].push({
        date: entry.date,
        quantity: timeslot.quantity,
      });
    }
  }
  return aggregates;
}
