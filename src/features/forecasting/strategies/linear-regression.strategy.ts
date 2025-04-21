import { ForecastingStrategy } from '@features/forecasting/strategies/forecasting-strategy.interface';

export class LinearRegressionStrategy implements ForecastingStrategy {
  predict(
    timeslotAggregates: Record<string, { date: string; quantity: number }[]>,
    targetDate: string,
  ) {
    const predictions = [];
    const targetTimestamp = new Date(targetDate).getTime();

    for (const [time, values] of Object.entries(timeslotAggregates)) {
      if (!values.length) continue;

      const baseDate = new Date(values[0].date).getTime();
      const targetX = (targetTimestamp - baseDate) / (1000 * 60 * 60 * 24);

      const pairs = values
        .filter((v) => typeof v.quantity === 'number' && !isNaN(v.quantity))
        .map((v) => ({
          xi: (new Date(v.date).getTime() - baseDate) / (1000 * 60 * 60 * 24),
          yi: v.quantity,
        }));

      if (pairs.length === 0) {
        const meanQuantity = Math.round(
          values.reduce((sum, val) => sum + val.quantity, 0) / values.length,
        );
        predictions.push({ time, quantity: meanQuantity });
        continue;
      }

      const x = pairs.map((p) => p.xi);
      const y = pairs.map((p) => p.yi);

      const predictedQuantity = this.linearRegression(x, y, targetX);
      const maxQuantity = Math.max(...y);
      const minQuantity = Math.min(...y);

      // Limita la predicción al rango histórico
      const limitedQuantity = Math.max(
        minQuantity,
        Math.min(
          isNaN(predictedQuantity) ? 0 : Math.round(predictedQuantity),
          maxQuantity,
        ),
      );

      predictions.push({
        time,
        quantity: limitedQuantity,
      });
    }
    return predictions;
  }

  private linearRegression(x: number[], y: number[], predictX: number): number {
    const n = x.length;
    if (n === 0) return 0;
    const meanX = x.reduce((sum, xi) => sum + xi, 0) / n;
    const meanY = y.reduce((sum, yi) => sum + yi, 0) / n;
    const numerator = x.reduce(
      (sum, xi, i) => sum + (xi - meanX) * (y[i] - meanY),
      0,
    );
    const denominator = x.reduce((sum, xi) => sum + Math.pow(xi - meanX, 2), 0);
    const slope = denominator === 0 ? 0 : numerator / denominator;
    const intercept = meanY - slope * meanX;
    return slope * predictX + intercept;
  }
}
