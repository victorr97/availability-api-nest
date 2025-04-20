import { Injectable } from '@nestjs/common';
import { FileReaderSingleton } from '@common/utils/file-reader.singleton';
import { Forecasting } from '@features/forecasting/interfaces/forecasting.interface';

@Injectable()
export class ForecastingService {
  private fileReader = FileReaderSingleton.getInstance();

  // Cambia este valor para alternar entre la opción A y B
  private readonly predictionMode: 'A' | 'B' = 'B';

  async predictAvailability(
    activityId: string,
    cityId: string,
    venueId: string,
    targetDate: string,
  ): Promise<Forecasting> {
    const historicalData = this.fileReader.getDataByDatePrefix('availability-');
    const filteredData = historicalData.filter(
      (entry) =>
        entry.activityId === activityId &&
        entry.city === cityId &&
        entry.venue === venueId,
    );

    let predictedTimeslots: any[];

    if (this.predictionMode === 'A') {
      const timeslotAggregates = this.aggregateByDayAndTimeslot(filteredData);
      predictedTimeslots = this.predictFuture(timeslotAggregates, targetDate);
    } else {
      const timeslotAggregates = this.aggregateByTimeslot(filteredData);
      predictedTimeslots = this.predictFutureUnified(timeslotAggregates);
    }

    const testDates = filteredData.slice(-5).map((entry: any) => entry.date);

    const { maeA, maeB, mapeA, mapeB } = this.evaluateMAE(
      activityId,
      cityId,
      venueId,
      testDates,
    );

    console.log(`MAE for Option A: ${maeA}, MAE for Option B: ${maeB}`);
    console.log(`MAPE for Option A: ${mapeA}%, MAPE for Option B: ${mapeB}%`);

    return {
      date: targetDate,
      activityId,
      venue: venueId,
      city: cityId,
      predictedTimeslots,
    };
  }

  private calculateMAPE(real: number[], predicted: number[]): number {
    if (real.length !== predicted.length || real.length === 0) return NaN;
    const sum = real.reduce(
      (acc, val, idx) => acc + Math.abs((val - predicted[idx]) / (val || 1)),
      0,
    );
    return (sum / real.length) * 100;
  }

  // Método para evaluar el MAE de ambas opciones
  public evaluateMAE(
    activityId: string,
    cityId: string,
    venueId: string,
    testDates: string[],
  ): { maeA: number; maeB: number; mapeA: number; mapeB: number } {
    const historicalData = this.fileReader.getDataByDatePrefix('availability-');
    const filteredData = historicalData.filter(
      (entry) =>
        entry.activityId === activityId &&
        entry.city === cityId &&
        entry.venue === venueId,
    );

    // Datos de entrenamiento (excluye los testDates)
    const trainData = filteredData.filter(
      (entry) => !testDates.includes(entry.date),
    );
    // Datos de prueba (solo los testDates)
    const testData = filteredData.filter((entry) =>
      testDates.includes(entry.date),
    );

    // Opción A
    const timeslotAggregatesA = this.aggregateByDayAndTimeslot(trainData);
    let allRealA: number[] = [];
    let allPredA: number[] = [];
    for (const testEntry of testData) {
      const targetDate = testEntry.date;
      const realTimeslots = testEntry.timeslots;
      const predictedTimeslots = this.predictFuture(
        timeslotAggregatesA,
        targetDate,
      );
      const { real, predicted } = this.alignTimeslots(
        realTimeslots,
        predictedTimeslots,
      );
      allRealA = allRealA.concat(real);
      allPredA = allPredA.concat(predicted);
    }
    const maeA = this.calculateMAE(allRealA, allPredA);
    const mapeA = this.calculateMAPE(allRealA, allPredA);

    // Opción B
    const timeslotAggregatesB = this.aggregateByTimeslot(trainData);
    let allRealB: number[] = [];
    let allPredB: number[] = [];
    for (const testEntry of testData) {
      const realTimeslots = testEntry.timeslots;
      const predictedTimeslots = this.predictFutureUnified(timeslotAggregatesB);
      const { real, predicted } = this.alignTimeslots(
        realTimeslots,
        predictedTimeslots,
      );
      allRealB = allRealB.concat(real);
      allPredB = allPredB.concat(predicted);
    }
    const maeB = this.calculateMAE(allRealB, allPredB);
    const mapeB = this.calculateMAPE(allRealB, allPredB);

    // Mostrar en consola
    console.log(`MAE for Option A: ${maeA}, MAE for Option B: ${maeB}`);
    console.log(`MAPE for Option A: ${mapeA}%, MAPE for Option B: ${mapeB}%`);

    return { maeA, maeB, mapeA, mapeB };
  }

  // Alinea los arrays de franjas reales y predichas por 'time'
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

  // Calcula el Mean Absolute Error (MAE)
  private calculateMAE(real: number[], predicted: number[]): number {
    if (real.length !== predicted.length || real.length === 0) return NaN;
    const sum = real.reduce(
      (acc, val, idx) => acc + Math.abs(val - predicted[idx]),
      0,
    );
    return sum / real.length;
  }

  // Opción A: Agrupar por día de la semana y franja horaria
  private aggregateByDayAndTimeslot(
    data: any[],
  ): Record<string, Record<string, number[]>> {
    const timeslotAggregates: Record<string, Record<string, number[]>> = {};
    for (const entry of data) {
      const date = new Date(entry.date);
      const dayOfWeek = date.getDay();
      for (const timeslot of entry.timeslots) {
        if (!timeslotAggregates[dayOfWeek]) {
          timeslotAggregates[dayOfWeek] = {};
        }
        if (!timeslotAggregates[dayOfWeek][timeslot.time]) {
          timeslotAggregates[dayOfWeek][timeslot.time] = [];
        }
        timeslotAggregates[dayOfWeek][timeslot.time].push(timeslot.quantity);
      }
    }
    return timeslotAggregates;
  }

  // Opción B: Unificar todos los datos por franja horaria
  private aggregateByTimeslot(data: any[]): Record<string, number[]> {
    const timeslotAggregates: Record<string, number[]> = {};
    for (const entry of data) {
      for (const timeslot of entry.timeslots) {
        if (!timeslotAggregates[timeslot.time]) {
          timeslotAggregates[timeslot.time] = [];
        }
        timeslotAggregates[timeslot.time].push(timeslot.quantity);
      }
    }
    return timeslotAggregates;
  }

  // Opción A: Predicción separando por día de la semana
  private predictFuture(
    timeslotAggregates: Record<string, Record<string, number[]>>,
    targetDate: string,
  ): any[] {
    const predictions = [];
    const targetDayOfWeek = new Date(targetDate).getDay();
    const dayAggregates = timeslotAggregates[targetDayOfWeek] || {};
    for (const [time, quantities] of Object.entries(dayAggregates)) {
      const predictedQuantity = this.linearRegression(quantities);
      predictions.push({ time, quantity: predictedQuantity });
    }
    return predictions;
  }

  // Opción B: Predicción unificada
  private predictFutureUnified(
    timeslotAggregates: Record<string, number[]>,
  ): any[] {
    const predictions = [];
    for (const [time, quantities] of Object.entries(timeslotAggregates)) {
      const predictedQuantity = this.linearRegression(quantities);
      predictions.push({ time, quantity: predictedQuantity });
    }
    return predictions;
  }

  // Utilidad: Regresión lineal simple
  private linearRegression(quantities: number[]): number {
    const n = quantities.length;
    if (n === 0) return 0;
    const x = Array.from({ length: n }, (_, i) => i + 1);
    const y = quantities;
    const meanX = x.reduce((sum, xi) => sum + xi, 0) / n;
    const meanY = y.reduce((sum, yi) => sum + yi, 0) / n;
    const numerator = x.reduce(
      (sum, xi, i) => sum + (xi - meanX) * (y[i] - meanY),
      0,
    );
    const denominator = x.reduce((sum, xi) => sum + Math.pow(xi - meanX, 2), 0);
    const slope = denominator === 0 ? 0 : numerator / denominator;
    const intercept = meanY - slope * meanX;
    const nextX = n + 1;
    const predictedY = slope * nextX + intercept;
    return Math.round(predictedY);
  }
}
