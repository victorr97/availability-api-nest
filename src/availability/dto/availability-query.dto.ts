import { IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AvailabilityQueryDto {
  @IsDateString()
  @ApiProperty({
    description: 'Start date in YYYY-MM-DD format',
    example: '2025-04-08',
  })
  start: string;

  @IsDateString()
  @ApiProperty({
    description: 'End date in YYYY-MM-DD format',
    example: '2025-04-14',
  })
  end: string;
}
