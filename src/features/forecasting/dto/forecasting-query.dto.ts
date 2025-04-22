import { IsUUID, IsNotEmpty, IsDateString } from 'class-validator';

export class ForecastingQueryDto {
  @IsUUID()
  @IsNotEmpty()
  activityId: string;

  @IsUUID()
  @IsNotEmpty()
  cityId: string;

  @IsUUID()
  @IsNotEmpty()
  venueId: string;

  @IsDateString()
  @IsNotEmpty()
  targetDate: string;
}
