import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { AvailabilityQueryDto } from './dto/availability-query.dto';

@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Get('by-date')
  public getAvailabilityByDate(@Query() query: AvailabilityQueryDto) {
    const { start, end } = query;

    // Validar que los parámetros estén presentes
    if (!start || !end) {
      throw new BadRequestException('start and end are required');
    }

    // Validar que las fechas sean válidas
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException(
        'start and end must be valid ISO date strings',
      );
    }

    // Validar que la fecha de inicio sea anterior a la fecha de fin
    if (startDate > endDate) {
      throw new BadRequestException('start date must be earlier than end date');
    }

    // Llamar al servicio para obtener los datos de disponibilidad
    return this.availabilityService.getAvailabilityByDate(start, end);
  }
}
