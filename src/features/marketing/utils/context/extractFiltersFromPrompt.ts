import {
  CITY_ALIASES,
  VENUE_ALIASES,
  ACTIVITY_ALIASES,
} from '@common/utils/alias.util';
import { CITY_MAIN_VENUE_ACTIVITY } from '@common/utils/cityVenueActivity.util';

// Helper function to normalize text (remove accents and lowercase)
const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

/**
 * Extracts filters (activity, venue, city) from a user prompt using aliases and mappings.
 * Returns an object with the detected filters.
 */
export function extractFiltersFromPrompt(prompt: string): {
  venue: string | undefined;
  city?: string;
  activity?: string;
} {
  const filters: {
    venue: string | undefined;
    city?: string;
    activity?: string;
  } = { venue: undefined };
  const normalizedPrompt = normalize(prompt);

  // 1. Try to find an activity by matching aliases in the prompt
  for (const [activity, aliases] of Object.entries(ACTIVITY_ALIASES)) {
    if (aliases.some((alias) => normalizedPrompt.includes(normalize(alias)))) {
      filters.activity = activity;
      break;
    }
  }

  // 2. If no activity found, try to find a venue by matching aliases
  if (!filters.activity) {
    for (const [venue, aliases] of Object.entries(VENUE_ALIASES)) {
      if (
        aliases.some((alias) => normalizedPrompt.includes(normalize(alias)))
      ) {
        filters.venue = venue;
        // If the venue is found, assign the associated city and main activity
        for (const [city, mapping] of Object.entries(
          CITY_MAIN_VENUE_ACTIVITY,
        )) {
          if (mapping.venue === venue) {
            filters.city = city;
            filters.activity = mapping.activity;
            break;
          }
        }
        break;
      }
    }
  }

  // 3. Try to find a city by matching aliases in the prompt
  for (const [city, aliases] of Object.entries(CITY_ALIASES)) {
    if (aliases.some((alias) => normalizedPrompt.includes(normalize(alias)))) {
      filters.city = city;
      break;
    }
  }

  // 4. If only city is found, assign its main venue and activity from the mapping
  if (
    filters.city &&
    !filters.venue &&
    !filters.activity &&
    CITY_MAIN_VENUE_ACTIVITY[filters.city]
  ) {
    filters.venue = CITY_MAIN_VENUE_ACTIVITY[filters.city].venue;
    filters.activity = CITY_MAIN_VENUE_ACTIVITY[filters.city].activity;
  }

  return filters;
}
