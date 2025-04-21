import { Injectable } from '@nestjs/common';
import { FileReaderSingleton } from '@common/utils/file-reader.singleton';
import { differenceInCalendarDays } from 'date-fns';
import {
  PricingSuggestionResult,
  TimeslotPricingSuggestion,
} from '@features/pricing/interfaces/pricing.interface';

@Injectable()
export class PricingService {
  private fileReader = FileReaderSingleton.getInstance();

  // Calcula el threshold de baja demanda dinámicamente según los días analizados
  private getDecreaseThreshold(days: number): number {
    // Empieza en 10% para 1 día (no penaliza poca venta en poco tiempo)
    // Sube progresivamente hasta 40% para 30 días (penaliza poca venta en mucho tiempo)
    const min = 0.1; // 10% para 1 día
    const max = 0.4; // 40% para 30 días
    const cappedDays = Math.min(days, 30);
    return min + ((max - min) * (cappedDays - 1)) / 29;
  }

  // Calcula el threshold de alta demanda dinámicamente según los días analizados
  private getIncreaseThreshold(days: number): number {
    // Empieza en 40% para 1 día (reacciona rápido a ventas rápidas)
    // Sube progresivamente hasta 70% para 30 días (solo sube precio si se vende mucho en mucho tiempo)
    const min = 0.4; // 40% para 1 día
    const max = 0.7; // 70% para 30 días
    const cappedDays = Math.min(days, 30);
    return min + ((max - min) * (cappedDays - 1)) / 29;
  }

  suggestDynamicPricing(
    activityId: string,
    startDate: string,
    endDate: string,
  ): PricingSuggestionResult {
    // Leer datos de los días del rango
    const startData = this.fileReader.getDataByDatePrefix(startDate);
    const endData = this.fileReader.getDataByDatePrefix(endDate);

    // Filtrar por actividad
    const startActivity = startData.find((d) => d.activityId === activityId);
    const endActivity = endData.find((d) => d.activityId === activityId);

    if (!startActivity || !endActivity) {
      return {
        activityId,
        startDate,
        endDate,
        timeslots: [],
      };
    }

    // Calcular la cantidad de días en el rango
    const days =
      differenceInCalendarDays(new Date(endDate), new Date(startDate)) + 1;

    // Ajustar el threshold de baja demanda según la duración
    const decreaseThreshold = this.getDecreaseThreshold(days);

    // Ajustar el threshold de alta demanda según la duración
    const increaseThreshold = this.getIncreaseThreshold(days);

    // Mostrar los thresholds calculados en consola
    console.log(
      `[Pricing] days: ${days}, decreaseThreshold: ${(decreaseThreshold * 100).toFixed(1)}%, increaseThreshold: ${(increaseThreshold * 100).toFixed(1)}%`,
    );

    // Mapear timeslots por hora
    const timeslotMap: Record<string, { initial: number; final: number }> = {};
    for (const slot of startActivity.timeslots) {
      timeslotMap[slot.time] = { initial: slot.quantity, final: 0 };
    }
    for (const slot of endActivity.timeslots) {
      if (timeslotMap[slot.time]) {
        timeslotMap[slot.time].final = slot.quantity;
      }
    }

    // Lógica de sugerencia

    const timeslots: TimeslotPricingSuggestion[] = Object.entries(
      timeslotMap,
    ).map(([time, { initial, final }]) => {
      const sold = initial - final;
      // Si final > initial, puede ser reposición o ampliación de aforo
      const soldRatio = initial > 0 && final <= initial ? sold / initial : 0;
      const suggestPriceIncrease = soldRatio >= increaseThreshold;
      const suggestPriceDecrease =
        soldRatio <= decreaseThreshold && initial > 0;

      let reason = 'Normal demand';
      if (suggestPriceIncrease) {
        reason = `High demand: ${Math.round(soldRatio * 100)}% sold in period`;
      } else if (suggestPriceDecrease) {
        reason = `Low demand: only ${Math.round(soldRatio * 100)}% sold in period`;
      }

      return {
        time,
        initialQuantity: initial,
        finalQuantity: final,
        sold,
        suggestPriceIncrease,
        suggestPriceDecrease,
        reason,
      };
    });

    return {
      activityId,
      startDate,
      endDate,
      timeslots,
    };
  }
}
