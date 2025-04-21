export function isMaxAvailabilityPrompt(prompt: string): boolean {
  const keywords = [
    'más disponibilidad',
    'más entradas',
    'mayor disponibilidad',
    'más libre',
    'menos demanda',
    'menos popular',
    'menos solicitado',
  ];
  const normalized = prompt.toLowerCase();
  return keywords.some((k) => normalized.includes(k));
}

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
