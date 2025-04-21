import { IsString } from 'class-validator';

export class MarketingQueryDto {
  @IsString()
  prompt: string;
}
