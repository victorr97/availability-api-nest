import { Module } from '@nestjs/common';
import { AvailabilityModule } from '@features/availability/availability.module';
import { ForecastingModule } from './features/forecasting/forecasting.module';

@Module({
  imports: [AvailabilityModule, ForecastingModule],
})
export class AppModule {}
