// Interface for forecasting strategies. Any forecasting algorithm (e.g., ARIMA, linear regression)
// should implement this interface to provide a unified prediction method.
export interface ForecastingStrategy {
  predict(
    timeslotAggregates: any,
    targetDate: string,
  ): { time: string; quantity: number | null }[];
}
