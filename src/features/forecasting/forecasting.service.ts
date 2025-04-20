import { BadRequestException, Injectable } from '@nestjs/common';
import { FileReaderSingleton } from '@common/utils/file-reader.singleton';
import { Forecasting } from './interfaces/forecasting.interface';
import { LinearRegressionStrategy } from './strategies/linear-regression.strategy';
import {
  aggregateByDayAndTimeslotWithDate,
  aggregateByTimeslotWithDate,
} from './utils/forecasting-aggregator.util';
import { calculateMAE, calculateMAPE } from './utils/forecasting-metrics.util';

type AggregationOption = 'A' | 'B';

@Injectable()
export class ForecastingService {
  private fileReader = FileReaderSingleton.getInstance();
  private strategy = new LinearRegressionStrategy();

  // Cambia esta opción para alternar entre A (por día de la semana) y B (unificado)
  private aggregationOption: AggregationOption = 'B';

  async predictAvailability(
    activityId: string,
    cityId: string,
    venueId: string,
    targetDate: string,
  ): Promise<Forecasting & { mae: number; mape: number }> {
    const historicalData = this.fileReader.getDataByDatePrefix('availability-');
    const filteredData = historicalData.filter(
      (entry) =>
        entry.activityId === activityId &&
        entry.city === cityId &&
        entry.venue === venueId,
    );

    // Obtener la última fecha de los datos históricos
    const maxDate = filteredData
      .map((entry) => new Date(entry.date))
      .reduce((a, b) => (a > b ? a : b), new Date(0));

    if (new Date(targetDate) <= maxDate) {
      throw new BadRequestException(
        'You can only predict for future dates after your latest historical data.',
      );
    }

    // Selección de agregador según opción
    let timeslotAggregates: any;
    if (this.aggregationOption === 'A') {
      // Opción A: separar por día de la semana
      const dayOfWeek = new Date(targetDate).getDay();
      const allAggregates = aggregateByDayAndTimeslotWithDate(filteredData);
      timeslotAggregates = allAggregates[dayOfWeek] || {};
    } else {
      // Opción B: unificar todos los días
      timeslotAggregates = aggregateByTimeslotWithDate(filteredData);
    }

    const predictedTimeslots = this.strategy.predict(
      timeslotAggregates,
      targetDate,
    );

    // Evaluación rápida (últimos 20% de días como test)
    const testSize = Math.floor(filteredData.length * 0.2);
    const testDates = filteredData
      .slice(-testSize)
      .map((entry: any) => entry.date);
    const trainData = filteredData.filter(
      (entry: any) => !testDates.includes(entry.date),
    );
    const testData = filteredData.filter((entry: any) =>
      testDates.includes(entry.date),
    );

    // Agregación para test según opción
    let testAggregates: any;
    if (this.aggregationOption === 'A') {
      const dayOfWeek = new Date(targetDate).getDay();
      const allAggregates = aggregateByDayAndTimeslotWithDate(trainData);
      testAggregates = allAggregates[dayOfWeek] || {};
    } else {
      testAggregates = aggregateByTimeslotWithDate(trainData);
    }

    let allReal: number[] = [];
    let allPred: number[] = [];
    for (const testEntry of testData) {
      const realTimeslots = testEntry.timeslots;

      const predicted = this.strategy.predict(testAggregates, testEntry.date);
      const { real, predicted: pred } = this.alignTimeslots(
        realTimeslots,
        predicted,
      );
      allReal = allReal.concat(real);
      allPred = allPred.concat(pred);
    }

    const mae = calculateMAE(allReal, allPred);
    const mape = calculateMAPE(allReal, allPred);

    // MAE: Mean Absolute Error
    console.log(
      `Mean absolute error (${this.aggregationOption}): ${mae.toFixed(2)}`,
    );
    // MAPE: Mean Absolute Percentage Error
    console.log(
      `Mean absolute percentage error (${this.aggregationOption}): ${mape.toFixed(2)}%`,
    );

    return {
      date: targetDate,
      activityId,
      venue: venueId,
      city: cityId,
      predictedTimeslots,
      mae,
      mape,
    };
  }

  private alignTimeslots(
    realTimeslots: { time: string; quantity: number }[],
    predictedTimeslots: { time: string; quantity: number }[],
  ): { real: number[]; predicted: number[] } {
    const realMap = new Map(realTimeslots.map((t) => [t.time, t.quantity]));
    const real: number[] = [];
    const predicted: number[] = [];
    for (const pred of predictedTimeslots) {
      if (realMap.has(pred.time)) {
        real.push(realMap.get(pred.time)!);
        predicted.push(pred.quantity);
      }
    }
    return { real, predicted };
  }
}
