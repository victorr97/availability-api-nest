import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { MarketingService } from '@features/marketing/marketing.service';

@ApiTags('marketing')
@Controller('marketing')
export class MarketingController {
  constructor(private readonly marketingService: MarketingService) {}

  @Get('insights')
  @ApiOperation({
    summary: 'Get marketing insights generated by LLM.',
    description:
      'Returns a marketing recommendation or insight generated by an LLM model (such as Bedrock or Ollama) based on the user-provided prompt.',
  })
  @ApiQuery({
    name: 'prompt',
    type: String,
    description: 'Question or instruction for the marketing assistant.',
    required: true,
    examples: {
      popularHour: {
        summary: 'Horario con menos disponibilidad en la Sagrada Familia',
        value: '¿Qué horario tiene menos disponibilidad en la Sagrada Familia?',
      },
      bestDayRome: {
        summary: 'Mejor día para visitar Roma en abril',
        value: '¿Qué día del mes de abril me recomiendas visitar Roma?',
      },
      bestAvailabilityHour: {
        summary: 'Horario con más disponibilidad en la Sagrada Familia',
        value:
          '¿Qué horario es el que tiene más disponibilidad en la Sagrada Familia?',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Response generated by the LLM with the marketing insight.',
    content: {
      'application/json': {
        example: {
          insight:
            '¡Hola, bienvenido a nuestra agencia de viajes! Para tu visita a Roma te recomiendo aprovechar el 9 de abril. Este día tenemos disponibilidad para hacer la impresionante Visita guiada al Coliseo y el Foro Romano a las 13:00h. ¡Con casi 500 entradas disponibles, es una excelente oportunidad para vivir de cerca estos monumentos icónicos! \n\nNo dejes pasar la ocasión de asegurar tu plaza para una de las actividades más demandadas en Roma. La disponibilidad es muy alta para ese día y horario, así que te sugiero reservar cuanto antes para no quedarte sin tu entrada. ¡Se agotan rápido los cupos para visitas tan espectaculares! Aprovecha y disfruta de una experiencia inolvidable recorriendo el mítico Coliseo y el Foro, verdaderos símbolos del esplendor de la Roma antigua. ¡No te arrepentirás!',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. The prompt parameter is missing.',
    content: {
      'application/json': {
        example: {
          statusCode: 400,
          message: 'prompt is required.',
          error: 'Bad Request',
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Unexpected server error.',
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
  async getInsights(@Query('prompt') prompt: string) {
    if (!prompt) {
      throw new BadRequestException('prompt is required.');
    }
    // Call the marketing service to generate and return the marketing insight using the provided prompt
    return this.marketingService.getInsights({ prompt });
  }
}
