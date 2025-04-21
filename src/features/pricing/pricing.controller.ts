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
    summary: 'Sugiere subida de precio para una actividad según demanda.',
    description:
      'Analiza la evolución de quantity en un rango de fechas y sugiere subida de precio si hay alta demanda.',
  })
  @ApiQuery({ name: 'activityId', type: String, required: true })
  @ApiQuery({ name: 'startDate', type: String, required: true })
  @ApiQuery({ name: 'endDate', type: String, required: true })
  @ApiResponse({
    status: 200,
    description: 'Sugerencia de pricing por timeslot.',
    type: Object,
  })
  async getSuggestion(
    @Query() query: PricingQueryDto,
  ): Promise<PricingSuggestionResult> {
    const { activityId, startDate, endDate } = query;
    if (!activityId || !startDate || !endDate) {
      throw new BadRequestException(
        'activityId, startDate y endDate son requeridos',
      );
    }
    return this.pricingService.suggestDynamicPricing(
      activityId,
      startDate,
      endDate,
    );
  }
}
