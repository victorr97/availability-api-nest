import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { PricingService } from '@features/pricing/pricing.service';
import { PricingQueryDto } from '@features/pricing/dto/pricing-query.dto';
import { PricingSuggestionResult } from '@features/pricing/interfaces/pricing.interface';

@ApiTags('pricing')
@Controller('pricing')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Get('suggestion')
  @ApiOperation({
    summary:
      'Suggest price increase or decrease for an activity based on demand.',
    description:
      'Analyzes the evolution of quantity in a date range and suggests a price increase or decrease according to detected demand. Parameters: activityId (activity ID), startDate (YYYY-MM-DD), endDate (YYYY-MM-DD, must be after startDate). Restrictions: startDate and endDate cannot be equal, and endDate cannot be before startDate.',
  })
  @ApiQuery({
    name: 'activityId',
    type: String,
    required: true,
    description: 'ID of the activity to analyze.',
  })
  @ApiQuery({
    name: 'startDate',
    type: String,
    required: true,
    description: 'Start date for the analysis (YYYY-MM-DD).',
  })
  @ApiQuery({
    name: 'endDate',
    type: String,
    required: true,
    description:
      'End date for the analysis (YYYY-MM-DD). Must be after startDate.',
  })
  @ApiResponse({
    status: 200,
    description: 'Pricing suggestion per timeslot.',
    content: {
      'application/json': {
        example: {
          activityId: 'e0b2a7b6-e92d-4ae5-8f38-0c43aee39419',
          startDate: '2025-03-30',
          endDate: '2025-04-05',
          timeslots: [
            {
              time: '08:00',
              initialQuantity: 381,
              finalQuantity: 76,
              sold: 305,
              suggestPriceIncrease: true,
              suggestPriceDecrease: false,
              reason: 'High demand: 80% sold in period',
              trend: 'Slowing down',
              comparative: 'Hot timeslot',
            },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid parameters or incorrect date range.',
    content: {
      'application/json': {
        example: {
          statusCode: 400,
          message:
            'endDate cannot be before startDate. Please adjust your date range.',
          timestamp: '2025-04-21T19:17:12.773Z',
          error: 'Bad Request',
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
    content: {
      'application/json': {
        example: {
          statusCode: 500,
          message: 'An unexpected error occurred on the server.',
          error: 'Internal Server Error',
        },
      },
    },
  })
  async getSuggestion(
    @Query() query: PricingQueryDto,
  ): Promise<PricingSuggestionResult> {
    const { activityId, startDate, endDate } = query;
    // Validate required parameters
    if (!activityId || !startDate || !endDate) {
      throw new BadRequestException(
        'activityId, startDate, and endDate are required',
      );
    }
    // Ensure startDate and endDate are not equal
    if (startDate === endDate) {
      throw new BadRequestException(
        'startDate and endDate cannot be equal. Please provide a valid date range.',
      );
    }
    // Ensure endDate is after startDate
    if (new Date(endDate) < new Date(startDate)) {
      throw new BadRequestException(
        'endDate cannot be before startDate. Please adjust your date range.',
      );
    }
    // Call the pricing service to get the suggestion
    return this.pricingService.suggestDynamicPricing(
      activityId,
      startDate,
      endDate,
    );
  }
}
