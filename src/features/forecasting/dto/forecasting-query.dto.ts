import { IsUUID, IsNotEmpty } from 'class-validator';

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
}
