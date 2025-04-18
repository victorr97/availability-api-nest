import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { AvailabilityService } from 'availability/availability.service';
import { AvailabilityQueryDto } from 'availability/dto/availability-query.dto';
import { ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('availability')
@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Get('by-date')
  @ApiQuery({
    name: 'start',
    type: String,
    description: 'Start date in YYYY-MM-DD format',
  })
  @ApiQuery({
    name: 'end',
    type: String,
    description: 'End date in YYYY-MM-DD format',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully fetched availability data.',
  })
  @ApiResponse({
    status: 400,
    description:
      'Invalid request. Please ensure the "start" and "end" parameters are provided, valid, and in the correct format (YYYY-MM-DD).',
  })
  public getAvailabilityByDate(@Query() query: AvailabilityQueryDto) {
    const { start, end } = query;

    // Validate that parameters are present
    if (!start || !end) {
      throw new BadRequestException(
        'Both "start" and "end" parameters are required.',
      );
    }

    // Validate the format of the dates using a regex
    const dateFormatRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateFormatRegex.test(start) || !dateFormatRegex.test(end)) {
      throw new BadRequestException(
        '"start" and "end" must be valid ISO date strings in the format YYYY-MM-DD.',
      );
    }

    // Convert the dates to Date objects
    const startDate = new Date(start);
    const endDate = new Date(end);

    // Validate that the dates are valid
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException(
        '"start" and "end" must be valid ISO date strings.',
      );
    }

    // Validate that the start date is earlier than the end date
    if (startDate > endDate) {
      throw new BadRequestException(
        '"start" date must be earlier than "end" date.',
      );
    }

    // Call the service to get availability data
    return this.availabilityService.getAvailabilityByDate(start, end);
  }
}
