import { ForecastingStrategy } from '@features/forecasting/strategies/forecasting-strategy.interface';

export class LinearRegressionStrategy implements ForecastingStrategy {
  predict(
    timeslotAggregates: Record<string, { date: string; quantity: number }[]>,
    targetDate: string,
  ) {
    const predictions = [];
    const targetTimestamp = new Date(targetDate).getTime();

    for (const [time, values] of Object.entries(timeslotAggregates)) {
      // values: [{ date, quantity }, ...]
      if (!values.length) continue;
      // Convert dates to numeric X axis (days since first date)
      const baseDate = new Date(values[0].date).getTime();
      const x = values.map(
        (v) => (new Date(v.date).getTime() - baseDate) / (1000 * 60 * 60 * 24),
      );
      const y = values.map((v) => v.quantity);
      const targetX = (targetTimestamp - baseDate) / (1000 * 60 * 60 * 24);
      const predictedQuantity = this.linearRegression(x, y, targetX);
      predictions.push({ time, quantity: Math.round(predictedQuantity) });
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
