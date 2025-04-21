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
//import { ArimaStrategy } from '@features/forecasting/strategies/arima.strategy';

type AggregationOption = 'A' | 'B';

@Injectable()
export class ForecastingService {
  private fileReader = FileReaderSingleton.getInstance();
  // You can change the strategy (ARIMA)
  private strategy = new LinearRegressionStrategy();
  //private strategy = new ArimaStrategy();

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
    if (!(cityId in CITY_UUIDS)) {
      throw new NotFoundException(`City with UUID '${cityId}' does not exist.`);
    }
    if (!(venueId in VENUE_UUIDS)) {
      throw new NotFoundException(
        `Venue with UUID '${venueId}' does not exist.`,
      );
    }
    if (!(activityId in ACTIVITY_UUIDS)) {
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

    if (filteredData.length > 0) {
      const lastDayTimes = new Set(
        filteredData[filteredData.length - 1].timeslots.map((t: any) => t.time),
      );
      predictedTimeslots = predictedTimeslots.filter((p) =>
        lastDayTimes.has(p.time),
      );
    }

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
      const predicted = this.strategy.predict(testAggregates, testEntry.date);

      const realTimes = new Set(
        realTimeslots.map((t: { time: any }) => t.time),
      );
      const filteredPredicted = predicted.filter((p) => realTimes.has(p.time));

      const { real, predicted: pred } = this.alignTimeslots(
        realTimeslots,
        filteredPredicted,
      );

      allReal = allReal.concat(real);
      const filteredPred = pred.filter(
        (v) => typeof v === 'number' && !isNaN(v),
      );
      allPred = allPred.concat(filteredPred);
    }

    // Calculate error metrics
    let mae = null;
    let mape = null;
    if (
      allReal.length > 0 &&
      allPred.length > 0 &&
      allReal.length === allPred.length
    ) {
      mae = calculateMAE(allReal, allPred);
      mape = calculateMAPE(allReal, allPred);
    } else {
      console.warn('No hay datos alineados para calcular métricas.');
    }

    // Log metrics for quick inspection
    console.log(
      `[Forecasting] Mean absolute error (${this.aggregationOption}): ${mae?.toFixed(2)}`,
    );
    console.log(
      `[Forecasting] Mean absolute percentage error (${this.aggregationOption}): ${mape?.toFixed(2)}%`,
    );

    // Return the prediction and metrics
    return {
      date: targetDate,
      activityId,
      venue: venueId,
      city: cityId,
      predictedTimeslots,
      mae: mae ?? 0,
      mape: mape ?? 0,
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
      const realValue = realMap.get(pred.time);
      if (typeof realValue === 'number' && !isNaN(realValue)) {
        const values = realTimeslots.filter((t) => t.time === pred.time);
        const maxQuantity = Math.max(...values.map((v) => v.quantity));
        const predictedQuantity = pred.quantity;
        const predictedValue = Math.round(
          Math.min(
            isNaN(predictedQuantity) ? 0 : predictedQuantity,
            maxQuantity,
          ),
        );
        real.push(realValue);
        predicted.push(predictedValue);
      }
    }
    return { real, predicted };
  }
}
