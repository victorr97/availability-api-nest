import { Injectable } from '@nestjs/common';
import { Forecasting } from '@features/forecasting/interfaces/forecasting.interface';

@Injectable()
export class ForecastingService {
  predictAvailability(
    activityId: string,
    cityId: string,
    venueId: string,
  ): Forecasting {
    // Lógica para calcular la predicción
    return {
      date: '2025-04-08',
      activityId,
      venue: venueId,
      city: cityId,
      predictedTimeslots: [
        { time: '10:00', quantity: 50 },
        { time: '12:00', quantity: 30 },
      ],
    };
  }
}
