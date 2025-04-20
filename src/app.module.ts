import { Module } from '@nestjs/common';
import { AvailabilityModule } from '@features/availability/availability.module';
import { ForecastingModule } from '@features/forecasting/forecasting.module';
import { MarketingModule } from '@features/marketing/marketing.module';

@Module({
  imports: [AvailabilityModule, ForecastingModule, MarketingModule],
})
export class AppModule {}
