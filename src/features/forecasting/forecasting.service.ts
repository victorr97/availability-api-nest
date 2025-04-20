import { Injectable } from '@nestjs/common';
import { FileReaderSingleton } from '@common/utils/file-reader.singleton';
import { Forecasting } from '@features/forecasting/interfaces/forecasting.interface';

@Injectable()
export class ForecastingService {
  private fileReader = FileReaderSingleton.getInstance();

  async predictAvailability(
    activityId: string,
    cityId: string,
    venueId: string,
    targetDate: string,
  ): Promise<Forecasting> {
    // Load all historical data using FileReaderSingleton
    const historicalData = this.fileReader.getDataByDatePrefix('availability-');
    console.log('🔍 Historical Data Loaded:', historicalData);

    // Filter data for the specific activity, city, and venue
    // This ensures we only work with relevant data for the given activity, city, and venue
    const filteredData = historicalData.filter(
      (entry) =>
        entry.activityId === activityId &&
        entry.city === cityId &&
        entry.venue === venueId,
    );
    console.log('🔍 Filtered Data:', filteredData);

    // Aggregate data by day of the week and timeslot
    // This groups the data based on the day of the week (e.g., Sunday, Monday) and timeslot (e.g., 08:00)
    const timeslotAggregates = this.aggregateByDayAndTimeslot(filteredData);
    console.log('🔍 Timeslot Aggregates:', timeslotAggregates);

    // Predict future availability for the target date
    // The prediction is based on historical data for the same day of the week as the target date
    const predictedTimeslots = this.predictFuture(
      timeslotAggregates,
      targetDate,
    );
    console.log('🔍 Predicted Timeslots:', predictedTimeslots);

    return {
      date: targetDate,
      activityId,
      venue: venueId,
      city: cityId,
      predictedTimeslots,
    };
  }

  private aggregateByDayAndTimeslot(
    data: any[],
  ): Record<string, Record<string, number[]>> {
    const timeslotAggregates: Record<string, Record<string, number[]>> = {};

    for (const entry of data) {
      const date = new Date(entry.date);
      const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

      for (const timeslot of entry.timeslots) {
        // Initialize the structure for the day of the week if it doesn't exist
        if (!timeslotAggregates[dayOfWeek]) {
          timeslotAggregates[dayOfWeek] = {};
        }

        // Initialize the structure for the timeslot if it doesn't exist
        if (!timeslotAggregates[dayOfWeek][timeslot.time]) {
          timeslotAggregates[dayOfWeek][timeslot.time] = [];
        }

        // Add the quantity to the corresponding day and timeslot
        timeslotAggregates[dayOfWeek][timeslot.time].push(timeslot.quantity);
      }
    }

    return timeslotAggregates;
  }

  private predictFuture(
    timeslotAggregates: Record<string, Record<string, number[]>>,
    targetDate: string,
  ): any[] {
    const predictions = [];
    // Get the day of the week for the target date (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    const targetDayOfWeek = new Date(targetDate).getDay();

    // Retrieve historical data for the same day of the week
    const dayAggregates = timeslotAggregates[targetDayOfWeek] || {};

    // If no historical data is available for the target day of the week, return an empty prediction
    if (Object.keys(dayAggregates).length === 0) {
      console.warn(
        `No historical data available for day of the week: ${targetDayOfWeek}`,
      );
      return [];
    }

    // For each timeslot, apply linear regression to predict the quantity
    for (const [time, quantities] of Object.entries(dayAggregates)) {
      const predictedQuantity = this.linearRegression(quantities);
      predictions.push({ time, quantity: predictedQuantity });
    }

    return predictions;
  }

  private linearRegression(quantities: number[]): number {
    const n = quantities.length;
    if (n === 0) return 0; // Handle case with no data

    // Generate x values (indices representing time)
    const x = Array.from({ length: n }, (_, i) => i + 1); // [1, 2, 3, ..., n]
    const y = quantities;

    // Calculate means of x and y
    const meanX = x.reduce((sum, xi) => sum + xi, 0) / n;
    const meanY = y.reduce((sum, yi) => sum + yi, 0) / n;

    // Calculate slope (m) and intercept (b) for y = mx + b
    const numerator = x.reduce(
      (sum, xi, i) => sum + (xi - meanX) * (y[i] - meanY),
      0,
    );
    const denominator = x.reduce((sum, xi) => sum + Math.pow(xi - meanX, 2), 0);
    const slope = numerator / denominator;
    const intercept = meanY - slope * meanX;

    // Predict the next value (for x = n + 1)
    const nextX = n + 1;
    const predictedY = slope * nextX + intercept;

    return Math.round(predictedY); // Return the predicted value rounded to the nearest integer
  }
}
