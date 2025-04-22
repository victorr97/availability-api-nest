/**
 * Detects if the prompt is asking for the timeslot with the maximum availability.
 * Returns true if any of the max-availability-related keywords are present.
 */
export function isMaxAvailabilityPrompt(prompt: string): boolean {
  const keywords = [
    'más disponibilidad',
    'más entradas',
    'mayor disponibilidad',
    'más libre',
    'menos demanda',
    'menos popular',
    'menos solicitado',
    'más popular',
    'más solicitado',
    'horario más popular',
    'horario más solicitado',
    'más demandado',
    'más vendido',
    'más reservado',
  ];
  const normalized = prompt.toLowerCase();
  return keywords.some((k) => normalized.includes(k));
}

/**
 * Detects if the prompt is asking for the best day to visit or book.
 * Returns true if any of the best-day-related keywords are present.
 */
export function isBestDayPrompt(prompt: string): boolean {
  const keywords = [
    'qué día',
    'qué fecha',
    'mejor día',
    'me recomiendas visitar',
    'qué día hay más disponibilidad',
    'qué día puedo ir',
  ];
  const normalized = prompt.toLowerCase();
  return keywords.some((k) => normalized.includes(k));
}

/**
 * Detects if the prompt is asking for the timeslot with the minimum availability
 * (i.e., the most popular or almost sold-out slot).
 * Returns true if any of the min-availability-related keywords are present.
 */
export function isMinAvailabilityPrompt(prompt: string): boolean {
  const keywords = [
    'más popular',
    'más vendido',
    'más demandado',
    'más reservado',
    'horario más popular',
    'horario más solicitado',
    'menos disponibilidad',
    'menos entradas',
    'casi agotado',
    'últimas entradas',
  ];
  const normalized = prompt.toLowerCase();
  return keywords.some((k) => normalized.includes(k));
}
