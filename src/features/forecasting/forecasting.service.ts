import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FileReaderSingleton } from '@common/utils/file-reader.singleton';
import { Forecasting } from '@features/forecasting/interfaces/forecasting.interface';
import { LinearRegressionStrategy } from '@features/forecasting/strategies/linear-regression.strategy';
import {
  aggregateByDayAndTimeslotWithDate,
  aggregateByTimeslotWithDate,
} from '@features/forecasting/utils/forecasting-aggregator.util';
import {
  calculateMAE,
  calculateMAPE,
} from '@features/forecasting/utils/forecasting-metrics.util';
import {
  CITY_UUIDS,
  VENUE_UUIDS,
  ACTIVITY_UUIDS,
} from '@common/utils/uuids.util';

type AggregationOption = 'A' | 'B';

@Injectable()
export class ForecastingService {
  private fileReader = FileReaderSingleton.getInstance();
  private strategy = new LinearRegressionStrategy();

  // You can switch between aggregation by weekday (A) or unified (B)
  private aggregationOption: AggregationOption = 'B';

  /**
   * Main method to predict availability for a given activity, city, venue, and target date.
   * Returns the prediction along with MAE and MAPE metrics for evaluation.
   */
  async predictAvailability(
    activityId: string,
    cityId: string,
    venueId: string,
    targetDate: string,
  ): Promise<Forecasting & { mae: number; mape: number }> {
    // Validate that the provided UUIDs exist in the allowed lists
    if (!CITY_UUIDS.includes(cityId)) {
      throw new NotFoundException(`City with UUID '${cityId}' does not exist.`);
    }
    if (!VENUE_UUIDS.includes(venueId)) {
      throw new NotFoundException(
        `Venue with UUID '${venueId}' does not exist.`,
      );
    }
    if (!ACTIVITY_UUIDS.includes(activityId)) {
      throw new NotFoundException(
        `Activity with UUID '${activityId}' does not exist.`,
      );
    }

    // Load all historical data
    const historicalData = this.fileReader.getDataByDatePrefix('availability-');
    // Filter data for the specific activity, city, and venue
    const filteredData = historicalData.filter(
      (entry) =>
        entry.activityId === activityId &&
        entry.city === cityId &&
        entry.venue === venueId,
    );

    // Find the latest date in the historical data
    const maxDate = filteredData
      .map((entry) => new Date(entry.date))
      .reduce((a, b) => (a > b ? a : b), new Date(0));

    // Prevent predictions for dates that are not in the future
    if (new Date(targetDate) <= maxDate) {
      throw new BadRequestException(
        'You can only predict for future dates after your latest historical data.',
      );
    }

    // Aggregate data according to the selected option
    let timeslotAggregates: any;
    if (this.aggregationOption === 'A') {
      // Option A: aggregate by day of the week
      const dayOfWeek = new Date(targetDate).getDay();
      const allAggregates = aggregateByDayAndTimeslotWithDate(filteredData);
      timeslotAggregates = allAggregates[dayOfWeek] || {};
    } else {
      // Option B: aggregate all days together
      timeslotAggregates = aggregateByTimeslotWithDate(filteredData);
    }

    // Make the prediction for the target date using the selected strategy
    let predictedTimeslots = this.strategy.predict(
      timeslotAggregates,
      targetDate,
    );

    // Sort predictedTimeslots by time (ascending)
    predictedTimeslots = predictedTimeslots.sort((a, b) =>
      a.time.localeCompare(b.time),
    );

    // --- Evaluation block (using last 20% of data as test set) ---

    // Split the last 20% of the data as test set for quick evaluation
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

    // Aggregate the training data for test predictions
    let testAggregates: any;
    if (this.aggregationOption === 'A') {
      const dayOfWeek = new Date(targetDate).getDay();
      const allAggregates = aggregateByDayAndTimeslotWithDate(trainData);
      testAggregates = allAggregates[dayOfWeek] || {};
    } else {
      testAggregates = aggregateByTimeslotWithDate(trainData);
    }

    // Evaluate predictions on the test set
    let allReal: number[] = [];
    let allPred: number[] = [];
    for (const testEntry of testData) {
      const realTimeslots = testEntry.timeslots;

      // Predict for each test entry date
      const predicted = this.strategy.predict(testAggregates, testEntry.date);
      // Align real and predicted timeslots for metric calculation
      const { real, predicted: pred } = this.alignTimeslots(
        realTimeslots,
        predicted,
      );
      allReal = allReal.concat(real);
      allPred = allPred.concat(pred);
    }

    // Calculate error metrics
    const mae = calculateMAE(allReal, allPred);
    const mape = calculateMAPE(allReal, allPred);

    // Log metrics for quick inspection
    console.log(
      `Mean absolute error (${this.aggregationOption}): ${mae.toFixed(2)}`,
    );
    console.log(
      `Mean absolute percentage error (${this.aggregationOption}): ${mape.toFixed(2)}%`,
    );

    // Return the prediction and metrics
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

  /**
   * Helper to align real and predicted timeslots by time.
   * Returns arrays of real and predicted quantities for metric calculation.
   */
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
