import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { ForecastingService } from '@features/forecasting/forecasting.service';
import { ForecastingQueryDto } from '@features/forecasting/dto/forecasting-query.dto';

@Controller('forecasting')
export class ForecastingController {
  constructor(private readonly forecastingService: ForecastingService) {}

  @Get('predict')
  predictAvailability(@Query() query: ForecastingQueryDto) {
    const { activityId, cityId, venueId } = query;

    // Validate input
    if (!activityId || !cityId || !venueId) {
      throw new BadRequestException(
        'activityId, cityId, and venueId are required.',
      );
    }

    // Call the service to get the prediction
    return this.forecastingService.predictAvailability(
      activityId,
      cityId,
      venueId,
    );
  }
}
