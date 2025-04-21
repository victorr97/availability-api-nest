import { Injectable } from '@nestjs/common';
import { FileReaderSingleton } from '@common/utils/file-reader.singleton';
import {
  PricingSuggestionResult,
  TimeslotPricingSuggestion,
} from '@features/pricing/interfaces/pricing.interface';

@Injectable()
export class PricingService {
  private fileReader = FileReaderSingleton.getInstance();

  // Suponemos que todos los eventos finalizan el día 2025-05-09
  private readonly eventEndDate = new Date('2025-05-09');

  // Calcula el threshold de baja demanda dinámicamente según los días restantes hasta el fin del evento
  private getDecreaseThreshold(daysLeft: number): number {
    // Empieza en 10% si faltan 40 días, sube hasta 40% si faltan solo 1 día
    const min = 0.1; // 10% si hay mucho margen
    const max = 0.4; // 40% si queda poco tiempo
    const cappedDays = Math.max(Math.min(daysLeft, 40), 1);
    return min + ((max - min) * (40 - cappedDays)) / 39;
  }

  // Calcula el threshold de alta demanda dinámicamente según los días restantes hasta el fin del evento
  private getIncreaseThreshold(daysLeft: number): number {
    // Empieza en 40% si faltan 40 días (reacciona rápido si se vende mucho con mucho margen)
    // Sube progresivamente hasta 70% si faltan solo 1 día (solo sube precio si se vende mucho al final)
    const min = 0.4; // 40% si hay mucho margen
    const max = 0.7; // 70% si queda poco tiempo
    const cappedDays = Math.max(Math.min(daysLeft, 40), 1);
    return min + ((max - min) * (40 - cappedDays)) / 39;
  }

  /**
   * Lógica de sugerencia de precios:
   *
   * - Si faltan 7 días o menos para el fin del evento:
   *    - Solo se sugiere SUBIDA de precio si queda menos del 10% de stock (altísima demanda y casi agotado).
   *    - Se sugiere BAJADA de precio si queda más del 30% de stock (baja demanda y poco tiempo para vender).
   *    - Si el stock está entre el 10% y el 30%, no se sugiere cambio de precio (demanda normal).
   *
   * - Si faltan más de 7 días para el fin del evento:
   *    - Se usa la lógica de thresholds dinámicos:
   *        - SUBIDA de precio si el porcentaje vendido en el periodo analizado es igual o superior al increaseThreshold (alta demanda).
   *        - BAJADA de precio si el porcentaje vendido es igual o inferior al decreaseThreshold (baja demanda).
   *        - Si está entre ambos thresholds, no se sugiere cambio de precio (demanda normal).
   *
   * - Casos especiales:
   *    - Si el stock final es mayor que el inicial (por reposición o ampliación), no se sugiere subida de precio.
   *    - Los thresholds se ajustan dinámicamente según los días restantes hasta el evento para reaccionar antes o después según el contexto temporal.
   */
  suggestDynamicPricing(
    activityId: string,
    startDate: string,
    endDate: string,
  ): PricingSuggestionResult {
    const startData = this.fileReader.getDataByDatePrefix(startDate);
    const endData = this.fileReader.getDataByDatePrefix(endDate);

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

    // Calcula los días restantes hasta el fin del evento desde la fecha de fin del análisis
    const daysLeft = Math.max(
      1,
      Math.ceil(
        (this.eventEndDate.getTime() - new Date(endDate).getTime()) /
          (1000 * 60 * 60 * 24),
      ),
    );

    // Calcula los días consultados en el análisis
    const daysAnalyzed = Math.max(
      1,
      Math.ceil(
        (new Date(endDate).getTime() - new Date(startDate).getTime()) /
          (1000 * 60 * 60 * 24),
      ) + 1,
    );

    // Ajustar los thresholds según los días restantes hasta el evento
    const decreaseThreshold = this.getDecreaseThreshold(daysLeft);
    const increaseThreshold = this.getIncreaseThreshold(daysLeft);

    console.log(
      `[Pricing] daysAnalyzed: ${daysAnalyzed}, daysLeft: ${daysLeft}, decreaseThreshold: ${(decreaseThreshold * 100).toFixed(1)}%, increaseThreshold: ${(increaseThreshold * 100).toFixed(1)}%`,
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

    const timeslots: TimeslotPricingSuggestion[] = Object.entries(
      timeslotMap,
    ).map(([time, { initial, final }]) => {
      const sold = initial - final;
      const soldRatio = initial > 0 && final <= initial ? sold / initial : 0;
      const stockRatio = final / (initial > 0 ? initial : 1);

      let suggestPriceIncrease = false;
      let suggestPriceDecrease = false;
      let reason = 'Normal demand';

      // Si faltan <= 7 días, solo sube precio si queda <10% de stock
      if (daysLeft <= 7) {
        if (stockRatio <= 0.1) {
          suggestPriceIncrease = true;
          reason = `Very high demand: only ${Math.round(stockRatio * 100)}% stock left with ${daysLeft} days to go`;
        } else if (stockRatio > 0.3) {
          suggestPriceDecrease = true;
          reason = `Low demand: still ${Math.round(stockRatio * 100)}% stock left with only ${daysLeft} days to go`;
        }
      } else {
        // Lógica normal para periodos largos
        if (soldRatio >= increaseThreshold) {
          suggestPriceIncrease = true;
          reason = `High demand: ${Math.round(soldRatio * 100)}% sold in period`;
        } else if (soldRatio <= decreaseThreshold && initial > 0) {
          suggestPriceDecrease = true;
          reason = `Low demand: only ${Math.round(soldRatio * 100)}% sold in period`;
        }
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
