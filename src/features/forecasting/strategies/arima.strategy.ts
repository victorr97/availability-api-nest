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

      // Sort by date and filter out invalid or negative quantities
      const sorted = values
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .filter(
          (v) =>
            typeof v.quantity === 'number' &&
            !isNaN(v.quantity) &&
            v.quantity >= 0,
        );

      const y = sorted.map((v) => v.quantity);

      // If there are less than 5 values or all values are equal, use the mean as prediction
      const allEqual = y.length > 0 && y.every((val) => val === y[0]);
      if (y.length < 5 || allEqual) {
        predictions.push({
          time,
          quantity: y.length
            ? Math.round(y.reduce((sum, v) => sum + v, 0) / y.length)
            : 0,
        });
        continue;
      }

      // Calculate the number of days between the last data point and the target date
      const lastDate = new Date(sorted[sorted.length - 1].date);
      const horizon = Math.round(
        (targetTimestamp - lastDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      // If the target date is not in the future, skip prediction
      if (horizon <= 0) continue;

      // Train ARIMA(p,d,q) model (basic parameters, can be tuned)
      const arima = new ARIMA({ p: 2, d: 1, q: 2 }).train(y);
      const [forecast] = arima.predict(horizon);

      // Use the last forecasted value as the prediction for the target date
      predictions.push({
        time,
        quantity: Math.max(0, Math.round(forecast[forecast.length - 1])),
      });
    }
    return predictions;
  }
}
