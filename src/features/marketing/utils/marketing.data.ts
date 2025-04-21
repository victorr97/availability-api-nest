import { FileReaderSingleton } from '@common/utils/file-reader.singleton';

// Helper function to normalize text (remove accents and lowercase)
const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

// Loads availability data from the merged file or a specific prefix
export function loadData(datePrefix = 'availability-merged'): any[] {
  const reader = FileReaderSingleton.getInstance();
  return reader.getDataByDatePrefix(datePrefix);
}

// Finds the slot with the minimum availability, optionally filtered by date, city, or activity
export function getMinAvailability({ date, city, activity }: any) {
  const data = loadData();
  let filtered = data;
  if (date) filtered = filtered.filter((a: any) => a.date === date);
  if (city)
    filtered = filtered.filter((a: any) =>
      normalize(a.cityName).includes(normalize(city)),
    );
  if (activity)
    filtered = filtered.filter((a: any) =>
      normalize(a.activityName).includes(normalize(activity)),
    );

  // Flatten all timeslots and enrich with context
  const allSlots = filtered.flatMap((a: any) =>
    a.timeslots.map((slot: any) => ({
      ...slot,
      activity: a.activityName,
      venue: a.venueName,
      city: a.cityName,
      date: a.date,
    })),
  );

  if (allSlots.length === 0) return null;

  // Return the slot with the lowest availability
  return allSlots.reduce(
    (min: { availability: number }, curr: { availability: number }) =>
      curr.availability < min.availability ? curr : min,
    allSlots[0],
  );
}

// Finds the slot with the maximum availability, optionally filtered by date, city, or activity
export function getMaxAvailability({ date, city, activity }: any) {
  const data = loadData();
  let filtered = data;
  if (date) filtered = filtered.filter((a: any) => a.date === date);
  if (city)
    filtered = filtered.filter((a: any) =>
      normalize(a.cityName).includes(normalize(city)),
    );
  if (activity)
    filtered = filtered.filter((a: any) =>
      normalize(a.activityName).includes(normalize(activity)),
    );

  // Flatten all timeslots and enrich with context
  const allSlots = filtered.flatMap((a: any) =>
    a.timeslots.map((slot: any) => ({
      ...slot,
      activity: a.activityName,
      venue: a.venueName,
      city: a.cityName,
      date: a.date,
    })),
  );

  if (allSlots.length === 0) return null;

  // Return the slot with the highest availability
  return allSlots.reduce(
    (max: { availability: number }, curr: { availability: number }) =>
      curr.availability > max.availability ? curr : max,
    allSlots[0],
  );
}

// Returns a list of activities that have at least one timeslot with low availability (<= minThreshold)
export function getActivitiesWithLowAvailability({ minThreshold = 60 }) {
  const data = loadData();
  const results = [];

  for (const a of data) {
    // Find all timeslots for this activity with low availability
    const lowSlots = a.timeslots.filter(
      (s: any) => s.availability <= minThreshold,
    );
    if (lowSlots.length > 0) {
      results.push({
        activity: a.activityName,
        city: a.cityName,
        venue: a.venueName,
        date: a.date,
        slots: lowSlots,
      });
    }
  }

  return results;
}

// Returns a sorted list of cities with the most almost-sold-out activities (slots <= threshold)
export function getTrendingCities({ threshold = 60 }) {
  const data = loadData();
  const cityMap = new Map<string, number>();

  for (const a of data) {
    // Count the number of low-availability slots for each city
    const count = a.timeslots.filter(
      (s: any) => s.availability <= threshold,
    ).length;
    if (count > 0) {
      cityMap.set(a.cityName, (cityMap.get(a.cityName) || 0) + count);
    }
  }

  // Return cities sorted by the number of almost-sold-out slots
  return Array.from(cityMap.entries())
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count);
}

// Finds the best day (with the highest total availability) for the given filters (month, activity, venue, city)
export function getBestDayAvailability({ month, activity, venue, city }: any) {
  const data = loadData();
  let filtered = data;

  if (activity)
    filtered = filtered.filter((a: any) =>
      normalize(a.activityName).includes(normalize(activity)),
    );
  if (venue)
    filtered = filtered.filter((a: any) =>
      normalize(a.venueName).includes(normalize(venue)),
    );
  if (city)
    filtered = filtered.filter((a: any) =>
      normalize(a.cityName).includes(normalize(city)),
    );
  if (month)
    filtered = filtered.filter((a: any) => a.date && a.date.startsWith(month));

  if (filtered.length === 0) return null;

  // Sum total availability per day for the filtered data
  const dayMap: Record<string, number> = {};
  filtered.forEach((a: any) => {
    if (!a.date || !a.timeslots) return;
    const total = a.timeslots.reduce(
      (sum: number, t: any) => sum + (t.availability ?? t.quantity ?? 0),
      0,
    );
    dayMap[a.date] = (dayMap[a.date] || 0) + total;
  });

  // Find the day with the highest total availability
  const bestDay = Object.entries(dayMap).sort((a, b) => b[1] - a[1])[0];
  if (!bestDay) return null;

  return { date: bestDay[0], totalAvailability: bestDay[1] };
}
