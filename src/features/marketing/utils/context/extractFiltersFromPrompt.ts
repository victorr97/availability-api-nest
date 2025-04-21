import {
  CITY_ALIASES,
  VENUE_ALIASES,
  ACTIVITY_ALIASES,
} from '@common/utils/alias.util';
import { CITY_MAIN_VENUE_ACTIVITY } from '@common/utils/cityVenueActivity.util';

const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

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

  // 1. Buscar por alias de actividad
  for (const [activity, aliases] of Object.entries(ACTIVITY_ALIASES)) {
    if (aliases.some((alias) => normalizedPrompt.includes(normalize(alias)))) {
      filters.activity = activity;
      break;
    }
  }

  // 2. Buscar por alias de venue (si aún no hay actividad definida)
  if (!filters.activity) {
    for (const [venue, aliases] of Object.entries(VENUE_ALIASES)) {
      if (
        aliases.some((alias) => normalizedPrompt.includes(normalize(alias)))
      ) {
        filters.venue = venue;
        // Si hay una ciudad asociada a ese venue, asígnala también
        // Y busca la actividad principal asociada a ese venue
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

  // 3. Buscar por alias de ciudad
  for (const [city, aliases] of Object.entries(CITY_ALIASES)) {
    if (aliases.some((alias) => normalizedPrompt.includes(normalize(alias)))) {
      filters.city = city;
      break;
    }
  }

  // 4. Si solo hay ciudad, asigna venue y actividad principal
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
