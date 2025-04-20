import { ForecastingStrategy } from '@features/forecasting/strategies/forecasting-strategy.interface';
import ARIMA from 'arima';

export class ArimaStrategy implements ForecastingStrategy {
  predict(
    timeslotAggregates: Record<string, { date: string; quantity: number }[]>,
    targetDate: string,
  ): { time: string; quantity: number }[] {
    const predictions: { time: string; quantity: number }[] = [];
    const targetTimestamp = new Date(targetDate).getTime();

    for (const [time, values] of Object.entries(timeslotAggregates)) {
      if (!values.length) continue;

      // Ordena los valores por fecha ascendente
      const sorted = values.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );
      const y = sorted.map((v) => v.quantity);

      // Calcula cuántos días hay entre el último dato y el targetDate
      const lastDate = new Date(sorted[sorted.length - 1].date);
      const horizon = Math.round(
        (targetTimestamp - lastDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (horizon <= 0) continue;

      // ARIMA(p,d,q) parámetros básicos, puedes tunearlos si lo deseas
      const arima = new ARIMA({ p: 2, d: 1, q: 2 }).train(y);
      const [forecast] = arima.predict(horizon);

      predictions.push({
        time,
        quantity: Math.max(0, Math.round(forecast[forecast.length - 1])),
      });
    }
    return predictions;
  }
}
