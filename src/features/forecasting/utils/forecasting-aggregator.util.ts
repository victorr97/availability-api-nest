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
