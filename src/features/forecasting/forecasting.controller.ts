import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { ForecastingService } from '@features/forecasting/forecasting.service';
import { ForecastingQueryDto } from '@features/forecasting/dto/forecasting-query.dto';

@ApiTags('forecasting')
@Controller('forecasting')
export class ForecastingController {
  constructor(private readonly forecastingService: ForecastingService) {}

  @Get('predict')
  @ApiOperation({
    summary: 'Predict availability for a given activity, city, venue, and date.',
  })
  @ApiQuery({
    name: 'activityId',
    type: String,
    description: 'Activity UUID',
    required: true,
    example: 'e0b2a7b6-e92d-4ae5-8f38-0c43aee39419',
  })
  @ApiQuery({
    name: 'cityId',
    type: String,
    description: 'City UUID',
    required: true,
    example: 'bd4aa8f4-e281-438c-b8ce-c204b63401f1',
  })
  @ApiQuery({
    name: 'venueId',
    type: String,
    description: 'Venue UUID',
    required: true,
    example: '47c2f804-225b-4e7a-95a1-fd6673e99c32',
  })
  @ApiQuery({
    name: 'targetDate',
    type: String,
    format: 'date-time',
    description: 'Target date (YYYY-MM-DD)',
    required: true,
    example: '2025-05-13',
  })
  @ApiResponse({
    status: 200,
    description: 'Prediction result with MAE and MAPE metrics.',
    schema: {
      example: {
        date: '2025-05-13',
        activityId: 'e0b2a7b6-e92d-4ae5-8f38-0c43aee39419',
        venue: '47c2f804-225b-4e7a-95a1-fd6673e99c32',
        city: 'bd4aa8f4-e281-438c-b8ce-c204b63401f1',
        predictedTimeslots: [
          { time: '08:00', quantity: 513 },
          { time: '08:30', quantity: 482 },
          { time: '09:00', quantity: 508 },
          { time: '09:30', quantity: 495 },
          { time: '10:00', quantity: 557 },
          { time: '10:30', quantity: 528 },
          { time: '11:00', quantity: 490 },
        ],
        mae: 86.0923076923077,
        mape: 17.89402543834461,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad request. Missing or invalid parameters, or target date is not in the future.',
  })
  @ApiResponse({
    status: 404,
    description:
      'City, venue, or activity UUID does not exist, or no historical data found.',
  })
  async predictAvailability(@Query() query: ForecastingQueryDto) {
    const { activityId, cityId, venueId, targetDate } = query;

    // Validate input
    if (!activityId || !cityId || !venueId || !targetDate) {
      throw new BadRequestException(
        'activityId, cityId, venueId, and targetDate are required.',
      );
    }

    // Call the service to get the prediction
    return this.forecastingService.predictAvailability(
      activityId,
      cityId,
      venueId,
      targetDate,
    );
  }
}
