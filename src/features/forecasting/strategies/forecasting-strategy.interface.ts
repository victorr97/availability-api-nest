export interface ForecastingStrategy {
  predict(
    timeslotAggregates: any,
    targetDate: string,
  ): { time: string; quantity: number }[];
}
