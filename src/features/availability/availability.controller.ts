import {
  BadRequestException,
  Controller,
  Get,
  Query,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { AvailabilityService } from '@features/availability/availability.service';
import { AvailabilityQueryDto } from '@features/availability/dto/availability-query.dto';
import { ApiQuery, ApiResponse, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('availability')
@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Get('by-date')
  @ApiOperation({
    summary: 'Get availability by date range',
    description:
      'Retrieve a list of availability records for a given date range. The response includes availability data for specific activities, venues, and cities.',
  })
  @ApiQuery({
    name: 'start',
    type: String,
    description: 'Start date in YYYY-MM-DD format',
    example: '2025-04-08',
  })
  @ApiQuery({
    name: 'end',
    type: String,
    description: 'End date in YYYY-MM-DD format',
    example: '2025-04-10',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully fetched availability data.',
    content: {
      'application/json': {
        example: [
          {
            date: '2025-04-08',
            activityId: 'a969d9f6-f7d6-43d1-9a36-02de49b7bce3',
            venue: 'f3067eb5-9435-4a84-a6b5-3c0b4a9f18cf',
            city: '5ff8e5f2-98d9-4321-8ae4-3f6c48c7f8d9',
            timeslots: [
              { time: '08:00', quantity: 120 },
              { time: '08:30', quantity: 110 },
            ],
          },
          {
            date: '2025-04-09',
            activityId: 'a969d9f6-f7d6-43d1-9a36-02de49b7bce3',
            venue: 'f3067eb5-9435-4a84-a6b5-3c0b4a9f18cf',
            city: '5ff8e5f2-98d9-4321-8ae4-3f6c48c7f8d9',
            timeslots: [
              { time: '08:00', quantity: 100 },
              { time: '08:30', quantity: 90 },
            ],
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Invalid request. Please ensure the "start" and "end" parameters are provided, valid, and in the correct format (YYYY-MM-DD).',
    content: {
      'application/json': {
        example: {
          statusCode: 400,
          message:
            'Both start and end dates are required. Please provide them in the format YYYY-MM-DD.',
          error: 'Bad Request',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'No availability data found for the given date range.',
    content: {
      'application/json': {
        example: {
          statusCode: 404,
          message:
            'No availability data was found for the specified date range. Please try a different range.',
          error: 'Not Found',
        },
      },
    },
  })
  @ApiResponse({
    status: 422,
    description: 'The provided date range is invalid or out of bounds.',
    content: {
      'application/json': {
        example: {
          statusCode: 422,
          message: 'The provided date range is invalid or out of bounds.',
          error: 'Unprocessable Entity',
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
  public getAvailabilityByDate(@Query() query: AvailabilityQueryDto) {
    const { start, end } = query;

    // Validate that parameters are present
    if (!start || !end) {
      throw new BadRequestException(
        'Both start and end dates are required. Please provide them in the format YYYY-MM-DD.',
      );
    }

    // Validate the format of the dates using a regex
    const dateFormatRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateFormatRegex.test(start) || !dateFormatRegex.test(end)) {
      throw new BadRequestException(
        'The start and end dates must be in the format YYYY-MM-DD. Please check your input.',
      );
    }

    // Convert the dates to Date objects
    const startDate = new Date(start);
    const endDate = new Date(end);

    // Validate that the dates are valid
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException(
        'The provided dates are invalid. Please ensure they are valid calendar dates.',
      );
    }

    // Validate that the start date is earlier than the end date
    if (startDate > endDate) {
      throw new BadRequestException(
        'The start date must be earlier than the end date. Please adjust your input.',
      );
    }

    try {
      // Call the service to get availability data
      const data = this.availabilityService.getAvailabilityByDate(start, end);

      if (!data || data.length === 0) {
        throw new NotFoundException(
          'No availability data was found for the specified date range. Please try a different range.',
        );
      }

      return data;
    } catch (error) {
      console.error('Unexpected error:', error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while processing your request. Please try again later.',
      );
    }
  }
}
