import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class PricingQueryDto {
  @ApiProperty({ example: 'e0b2a7b6-e92d-4ae5-8f38-0c43aee39419' })
  @IsString()
  activityId: string;

  @ApiProperty({ example: '2025-04-01' })
  @IsString()
  startDate: string;

  @ApiProperty({ example: '2025-04-03' })
  @IsString()
  endDate: string;
}
