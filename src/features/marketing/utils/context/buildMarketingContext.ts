import { extractFiltersFromPrompt } from './extractFiltersFromPrompt';
import { Slot } from '@features/marketing/utils/context/slotTypes';
import {
  getActivitiesWithLowAvailability,
  getTrendingCities,
  getMinAvailability,
  getMaxAvailability,
  getBestDayAvailability,
  loadData,
} from '@features/marketing/utils/marketing.data';
import {
  isBestDayPrompt,
  isMaxAvailabilityPrompt,
} from '@features/marketing/utils/context/promptDetectors';

const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

export function buildMarketingContext(prompt: string): string {
  const resumen: string[] = [];
  const filters = extractFiltersFromPrompt(prompt);

  // Detecta si pregunta por el mejor día
  if (isBestDayPrompt(prompt)) {
    const monthMatch = prompt.match(
      /abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre|enero|febrero|marzo/,
    );
    let month = '';
    if (monthMatch) {
      const months = {
        enero: '01',
        febrero: '02',
        marzo: '03',
        abril: '04',
        mayo: '05',
        junio: '06',
        julio: '07',
        agosto: '08',
        septiembre: '09',
        octubre: '10',
        noviembre: '11',
        diciembre: '12',
      };
      const year = new Date().getFullYear();
      month = `${year}-${months[monthMatch[0] as keyof typeof months]}`;
    }
    const bestDay = getBestDayAvailability({ ...filters, month });
    if (bestDay) {
      // Busca el slot con más disponibilidad de ese día
      const data = loadData();
      const filtered = data.filter(
        (a: any) =>
          a.date === bestDay.date &&
          (!filters.activity ||
            normalize(a.activityName).includes(normalize(filters.activity))) &&
          (!filters.venue ||
            normalize(a.venueName).includes(normalize(filters.venue))) &&
          (!filters.city ||
            normalize(a.cityName).includes(normalize(filters.city))),
      );
      let bestSlot: { time: string; availability: number } = {
        time: 'N/A',
        availability: 0,
      };
      let max = -1;
      filtered.forEach((a: any) => {
        if (!a.timeslots) return;
        a.timeslots.forEach((t: any) => {
          const avail = t.availability ?? t.quantity ?? 0;
          if (typeof t.time === 'string' && avail > max) {
            max = avail;
            bestSlot = { time: t.time, availability: avail };
          }
        });
      });

      // Contexto estructurado
      resumen.push(
        `Día recomendado: ${bestDay.date}\nHorario recomendado: ${bestSlot.time}\nEntradas disponibles: ${bestSlot.availability}\nMotivo: Es el día y horario con mayor disponibilidad en ${monthMatch ? monthMatch[0] : 'el mes'} para ${filters.activity || filters.venue || 'la actividad'}.\n`,
      );
    } else {
      resumen.push(
        'No se encontró un día con disponibilidad suficiente para tu búsqueda.',
      );
    }
    return resumen.join('\n');
  }

  // Tipa slot explícitamente
  let slot: Slot | undefined;
  if (isMaxAvailabilityPrompt(prompt)) {
    slot = getMaxAvailability(filters) as Slot;
    if (slot) {
      resumen.push(
        `El horario con más disponibilidad es: ${slot.activity} en ${slot.city} el ${slot.date} a las ${slot.time} (${slot.availability} entradas) en ${slot.venue}.`,
      );
    }
  } else {
    slot = getMinAvailability(filters) as Slot;
    if (slot) {
      let urgencia = '';
      if (slot.availability <= 10) {
        urgencia =
          ' ¡Atención! Quedan muy pocas entradas, se están agotando rápidamente.';
      } else if (slot.availability <= 50) {
        urgencia = ' Últimas plazas disponibles, la demanda es muy alta.';
      }
      resumen.push(
        `El horario con menos disponibilidad es: ${slot.activity} en ${slot.city} el ${slot.date} a las ${slot.time} (${slot.availability} entradas) en ${slot.venue}.${urgencia}`,
      );
    }
  }

  // Solo agrega el resto si NO hay filtro de actividad
  if (!filters.activity) {
    const lowAvailability = getActivitiesWithLowAvailability({});
    if (lowAvailability.length > 0) {
      resumen.push('\nActividades con baja disponibilidad:');
      for (const item of lowAvailability.slice(0, 3)) {
        const slot = (
          item.slots as Array<{ time: string; availability: number }>
        ).sort((a, b) => (a.availability ?? 0) - (b.availability ?? 0))[0];
        resumen.push(
          `- ${item.activity}, ${item.city} (${slot?.time || 'N/A'}, ${slot.availability} entradas, fecha: ${item.date}, venue: ${item.venue})`,
        );
      }
    }

    const trendingCities = getTrendingCities({});
    if (trendingCities.length > 0) {
      resumen.push('\nCiudades con más actividades casi agotadas:');
      for (const city of trendingCities.slice(0, 3)) {
        resumen.push(`- ${city.city}: ${city.count} slots`);
      }
    }
  }

  return resumen.join('\n');
}
