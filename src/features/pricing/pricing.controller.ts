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
      'Sugiere subida o bajada de precio para una actividad según demanda.',
    description:
      'Analiza la evolución de quantity en un rango de fechas y sugiere subida o bajada de precio según la demanda detectada. Parámetros: activityId (ID de la actividad), startDate (YYYY-MM-DD), endDate (YYYY-MM-DD, debe ser posterior a startDate). Restricciones: startDate y endDate no pueden ser iguales ni endDate anterior a startDate.',
  })
  @ApiQuery({
    name: 'activityId',
    type: String,
    required: true,
    description: 'ID de la actividad a analizar.',
  })
  @ApiQuery({
    name: 'startDate',
    type: String,
    required: true,
    description: 'Fecha de inicio del análisis (YYYY-MM-DD).',
  })
  @ApiQuery({
    name: 'endDate',
    type: String,
    required: true,
    description:
      'Fecha final del análisis (YYYY-MM-DD). Debe ser posterior a startDate.',
  })
  @ApiResponse({
    status: 200,
    description: 'Sugerencia de pricing por timeslot.',
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
    description: 'Parámetros inválidos o rango de fechas incorrecto.',
    content: {
      'application/json': {
        example: {
          statusCode: 400,
          message:
            'endDate no puede ser anterior a startDate. Por favor, ajusta tu rango de fechas.',
          timestamp: '2025-04-21T19:17:12.773Z',
          error: 'Bad Request',
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor.',
    content: {
      'application/json': {
        example: {
          statusCode: 500,
          message: 'Ha ocurrido un error inesperado en el servidor.',
          error: 'Internal Server Error',
        },
      },
    },
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
    if (startDate === endDate) {
      throw new BadRequestException(
        'startDate y endDate no pueden ser iguales. Deben definir un rango de fechas válido.',
      );
    }
    if (new Date(endDate) < new Date(startDate)) {
      throw new BadRequestException(
        'endDate no puede ser anterior a startDate. Por favor, ajusta tu rango de fechas.',
      );
    }
    return this.pricingService.suggestDynamicPricing(
      activityId,
      startDate,
      endDate,
    );
  }
}
