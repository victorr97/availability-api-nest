import { Module } from '@nestjs/common';
import { ForecastingController } from '@features/forecasting/forecasting.controller';
import { ForecastingService } from '@features/forecasting/forecasting.service';

@Module({
  controllers: [ForecastingController],
  providers: [ForecastingService],
})
export class ForecastingModule {}
