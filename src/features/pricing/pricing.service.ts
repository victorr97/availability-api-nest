import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { FileReaderSingleton } from '@common/utils/file-reader.singleton';
import {
  PricingSuggestionResult,
  TimeslotPricingSuggestion,
} from '@features/pricing/interfaces/pricing.interface';

@Injectable()
export class PricingService {
  private fileReader = FileReaderSingleton.getInstance();

  // All events are assumed to end on 2025-05-09
  private readonly eventEndDate = new Date('2025-05-09');

  // Calculates the low demand threshold dynamically based on days left until event end
  private getDecreaseThreshold(daysLeft: number): number {
    // Starts at 10% if 40 days left, increases to 40% if only 1 day left
    const min = 0.1;
    const max = 0.4;
    const cappedDays = Math.max(Math.min(daysLeft, 40), 1);
    return min + ((max - min) * (40 - cappedDays)) / 39;
  }

  // Calculates the high demand threshold dynamically based on days left until event end
  private getIncreaseThreshold(daysLeft: number): number {
    // Starts at 40% if 40 days left, increases to 70% if only 1 day left
    const min = 0.4;
    const max = 0.7;
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
   *    - Se usan thresholds (umbrales) dinámicos para alta y baja demanda:
   *        - Estos thresholds se calculan en función de los días que faltan hasta el fin del evento (eventEndDate 2025-05-09).
   *        - Cuantos menos días quedan, más exigente es el sistema para sugerir bajadas de precio (el threshold de baja demanda sube) y más restrictivo para sugerir subidas (el threshold de alta demanda sube).
   *        - SUBIDA de precio si el porcentaje vendido en el periodo analizado es igual o superior al increaseThreshold (alta demanda).
   *        - BAJADA de precio si el porcentaje vendido es igual o inferior al decreaseThreshold (baja demanda).
   *        - Si está entre ambos thresholds, no se sugiere cambio de precio (demanda normal).
   *
   * - Casos especiales:
   *    - Si el stock final es mayor que el inicial (por reposición o ampliación), no se sugiere subida de precio y se recomienda bajada para incentivar la venta del nuevo stock.
   *    - Los thresholds se recalculan dinámicamente en cada consulta, adaptándose al contexto temporal (días restantes hasta el evento).
   *
   * - Se tiene en cuenta:
   *    - trend: indica si la tendencia de ventas es "Accelerating" (ventas se aceleran), "Slowing down" (ventas se frenan) o "Constant" (ventas constantes), comparando la primera y segunda mitad del periodo analizado.
   *    - comparative: compara el ratio vendido de cada timeslot respecto a la media de todos los timeslots, clasificando como "Hot timeslot" (muy por encima de la media), "Cold timeslot" (muy por debajo de la media) o "Normal timeslot".
   *
   * En resumen, el sistema ajusta los thresholds de decisión en función de la urgencia temporal (días hasta el evento) y analiza tanto la evolución de la demanda (trend) como el comportamiento relativo de cada horario (comparative) para ofrecer recomendaciones de pricing más inteligentes y adaptadas al contexto real.
   */
  suggestDynamicPricing(
    activityId: string,
    startDate: string,
    endDate: string,
  ): PricingSuggestionResult {
    try {
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

      // Calculate days left until event end from the end of the analysis period
      const daysLeft = Math.max(
        1,
        Math.ceil(
          (this.eventEndDate.getTime() - new Date(endDate).getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      );

      // Calculate the number of days analyzed
      const daysAnalyzed = Math.max(
        1,
        Math.ceil(
          (new Date(endDate).getTime() - new Date(startDate).getTime()) /
            (1000 * 60 * 60 * 24),
        ) + 1,
      );

      // Adjust thresholds based on days left until event end
      const decreaseThreshold = this.getDecreaseThreshold(daysLeft);
      const increaseThreshold = this.getIncreaseThreshold(daysLeft);

      console.log(
        `[Pricing] daysAnalyzed: ${daysAnalyzed}, daysLeft: ${daysLeft}, decreaseThreshold: ${(decreaseThreshold * 100).toFixed(1)}%, increaseThreshold: ${(increaseThreshold * 100).toFixed(1)}%`,
      );

      // Map timeslots by hour
      const timeslotMap: Record<string, { initial: number; final: number }> = {};
      for (const slot of startActivity.timeslots) {
        timeslotMap[slot.time] = { initial: slot.quantity, final: 0 };
      }
      for (const slot of endActivity.timeslots) {
        if (timeslotMap[slot.time]) {
          timeslotMap[slot.time].final = slot.quantity;
        }
      }

      // Calculate mid date for trend analysis
      const midDate = new Date(
        new Date(startDate).getTime() +
          (new Date(endDate).getTime() - new Date(startDate).getTime()) / 2,
      );
      const midData = this.fileReader.getDataByDatePrefix(
        midDate.toISOString().slice(0, 10),
      );
      const midActivity = midData.find((d) => d.activityId === activityId);

      // Calculate sold ratio for all timeslots
      const soldRatios = Object.values(timeslotMap).map(({ initial, final }) =>
        initial > 0 && final <= initial ? (initial - final) / initial : 0,
      );
      const avgSoldRatio =
        soldRatios.reduce((a, b) => a + b, 0) / soldRatios.length;

      const timeslots: TimeslotPricingSuggestion[] = Object.entries(
        timeslotMap,
      ).map(([time, { initial, final }]) => {
        const sold = Math.max(0, initial - final); // Never negative
        const soldRatio = initial > 0 && final <= initial ? sold / initial : 0;
        const stockRatio =
          initial > 0 ? Math.max(0, Math.min(1, final / initial)) : 0;

        let suggestPriceIncrease = false;
        let suggestPriceDecrease = false;
        let reason = 'Normal demand';

        // If there was restock or capacity increase
        if (final > initial) {
          suggestPriceIncrease = false;
          suggestPriceDecrease = true;
          reason =
            'Stock increased during period (restock or capacity increase)';
        } else {
          // If 7 days or less left, only suggest price increase if <10% stock left
          if (daysLeft <= 7) {
            if (stockRatio <= 0.1) {
              suggestPriceIncrease = true;
              reason = `Very high demand: only ${Math.round(
                stockRatio * 100,
              )}% stock left with ${daysLeft} days to go`;
            } else if (stockRatio > 0.3) {
              suggestPriceDecrease = true;
              reason = `Low demand: still ${Math.round(
                stockRatio * 100,
              )}% stock left with only ${daysLeft} days to go`;
            }
          } else {
            // Normal logic for longer periods
            if (soldRatio >= increaseThreshold) {
              suggestPriceIncrease = true;
              reason = `High demand: ${Math.round(
                soldRatio * 100,
              )}% sold in period`;
            } else if (soldRatio <= decreaseThreshold && initial > 0) {
              suggestPriceDecrease = true;
              reason = `Low demand: only ${Math.round(
                soldRatio * 100,
              )}% sold in period`;
            }
          }
        }

        // Cálculo de tendencia de ventas (trend)
        // "trend" se calcula dividiendo el periodo analizado en dos mitades:
        // - soldFirstHalf: entradas vendidas desde el inicio hasta la mitad del periodo
        // - soldSecondHalf: entradas vendidas desde la mitad hasta el final del periodo
        // Si soldSecondHalf > soldFirstHalf => 'Accelerating' (las ventas se aceleran)
        // Si soldSecondHalf < soldFirstHalf => 'Slowing down' (las ventas se frenan)
        // Si son iguales => 'Constant' (ventas constantes)
        let mid = 0;
        if (midActivity) {
          const midSlot = midActivity.timeslots.find(
            (s: { time: string }) => s.time === time,
          );
          if (midSlot) mid = midSlot.quantity;
        }
        const soldFirstHalf = initial - mid;
        const soldSecondHalf = mid - final;
        let trend = '';
        if (final === 0) {
          trend = '';
        } else if (soldSecondHalf > soldFirstHalf) {
          trend = 'Accelerating';
        } else if (soldSecondHalf < soldFirstHalf) {
          trend = 'Slowing down';
        } else {
          trend = 'Constant';
        }

        // Análisis comparativo del timeslot (comparative)
        // "comparative" compara el ratio vendido de este timeslot respecto a la media:
        // - Si soldRatio > avgSoldRatio * 1.2 => 'Hot timeslot' (demanda mucho mayor que la media)
        // - Si soldRatio < avgSoldRatio * 0.8 => 'Cold timeslot' (demanda mucho menor que la media)
        // - En otro caso => 'Normal timeslot'
        let comparative = '';
        if (soldRatio > avgSoldRatio * 1.2) {
          comparative = 'Hot timeslot';
        } else if (soldRatio < avgSoldRatio * 0.8) {
          comparative = 'Cold timeslot';
        } else {
          comparative = 'Normal timeslot';
        }

        return {
          time,
          initialQuantity: initial,
          finalQuantity: final,
          sold,
          suggestPriceIncrease,
          suggestPriceDecrease,
          reason,
          trend,
          comparative,
        };
      });

      return {
        activityId,
        startDate,
        endDate,
        timeslots,
      };
    } catch (error) {
      console.error('Unexpected error in suggestDynamicPricing:', error);
      throw new InternalServerErrorException(
        'Ha ocurrido un error inesperado en el servidor.',
      );
    }
  }
}
