import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { ForecastingService } from '@features/forecasting/forecasting.service';
import { ForecastingQueryDto } from '@features/forecasting/dto/forecasting-query.dto';
import {
  CITY_UUIDS,
  VENUE_UUIDS,
  ACTIVITY_UUIDS,
} from '@common/utils/uuids.util';
import { CITY_MAIN_VENUE_ACTIVITY } from '@common/utils/cityVenueActivity.util';

@ApiTags('forecasting')
@Controller('forecasting')
export class ForecastingController {
  constructor(private readonly forecastingService: ForecastingService) {}

  @Get('predict')
  @ApiOperation({
    summary:
      'Predict availability for a given activity, city, venue, and date.',
    description:
      'Returns the predicted availability for the specified activity, city, venue, and target date.',
  })
  @ApiQuery({
    name: 'activityId',
    type: String,
    description: 'Activity UUID',
    required: true,
    example: 'a969d9f6-f7d6-43d1-9a36-02de49b7bce3',
  })
  @ApiQuery({
    name: 'cityId',
    type: String,
    description: 'City UUID',
    required: true,
    example: '5ff8e5f2-98d9-4321-8ae4-3f6c48c7f8d9',
  })
  @ApiQuery({
    name: 'venueId',
    type: String,
    description: 'Venue UUID',
    required: true,
    example: 'f3067eb5-9435-4a84-a6b5-3c0b4a9f18cf',
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
    content: {
      'application/json': {
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
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad request. Missing or invalid parameters, or incoherent city/venue/activity combination.',
    content: {
      'application/json': {
        examples: {
          missingParams: {
            summary: 'Missing required parameters',
            value: {
              statusCode: 400,
              message:
                'activityId, cityId, venueId, and targetDate are required.',
              error: 'Bad Request',
            },
          },
          invalidCity: {
            summary: 'Invalid cityId',
            value: {
              statusCode: 400,
              message: 'Invalid cityId.',
              error: 'Bad Request',
            },
          },
          invalidVenue: {
            summary: 'Invalid venueId',
            value: {
              statusCode: 400,
              message: 'Invalid venueId.',
              error: 'Bad Request',
            },
          },
          invalidActivity: {
            summary: 'Invalid activityId',
            value: {
              statusCode: 400,
              message: 'Invalid activityId.',
              error: 'Bad Request',
            },
          },
          incoherentCombination: {
            summary: 'Incoherent city/venue/activity combination',
            value: {
              statusCode: 400,
              message:
                'For city Barcelona, you must use venue "Sagrada Familia" and activity "Entrada general Sagrada Familia".',
              error: 'Bad Request',
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description:
      'City, venue, or activity UUID does not exist in the mapping, or no historical data found.',
    content: {
      'application/json': {
        examples: {
          cityNotFound: {
            summary: 'City UUID not found in mapping',
            value: {
              statusCode: 404,
              message:
                "City with UUID 'bd4aa8f4-e281-438c-b8ce-c204b63401f1' does not exist.",
              error: 'Not Found',
            },
          },
          mappingNotFound: {
            summary: 'No mapping found for this city',
            value: {
              statusCode: 404,
              message: 'No mapping found for this city.',
              error: 'Not Found',
            },
          },
          noHistoricalData: {
            summary: 'No historical data found',
            value: {
              statusCode: 404,
              message: 'No historical data found for the specified parameters.',
              error: 'Not Found',
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'An unexpected error occurred on the server.',
    content: {
      'application/json': {
        example: {
          statusCode: 500,
          message:
            'An unexpected error occurred while processing your request. Please try again later.',
          error: 'Internal Server Error',
        },
      },
    },
  })
  async predictAvailability(@Query() query: ForecastingQueryDto) {
    const { activityId, cityId, venueId, targetDate } = query;

    // Validate input
    if (!activityId || !cityId || !venueId || !targetDate) {
      throw new BadRequestException(
        'activityId, cityId, venueId, and targetDate are required.',
      );
    }

    // Validar coherencia ciudad-venue-actividad
    const cityName = CITY_UUIDS[cityId as keyof typeof CITY_UUIDS];
    if (!cityName) {
      throw new BadRequestException('Invalid cityId.');
    }
    const mapping = CITY_MAIN_VENUE_ACTIVITY[cityName];
    if (!mapping) {
      throw new BadRequestException('No mapping found for this city.');
    }
    const venueName = VENUE_UUIDS[venueId as keyof typeof VENUE_UUIDS];
    if (!venueName) {
      throw new BadRequestException('Invalid venueId.');
    }
    const activityName =
      ACTIVITY_UUIDS[activityId as keyof typeof ACTIVITY_UUIDS];
    if (!activityName) {
      throw new BadRequestException('Invalid activityId.');
    }
    if (mapping.venue !== venueName || mapping.activity !== activityName) {
      throw new BadRequestException(
        `For city ${cityName}, you must use venue "${mapping.venue}" and activity "${mapping.activity}".`,
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
