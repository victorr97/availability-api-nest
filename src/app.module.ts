import { Module } from '@nestjs/common';
import { AvailabilityModule } from '@features/availability/availability.module';
import { ForecastingModule } from '@features/forecasting/forecasting.module';
import { MarketingModule } from '@features/marketing/marketing.module';
import { PricingModule } from '@features/pricing/pricing.module';

@Module({
  imports: [
    AvailabilityModule,
    ForecastingModule,
    MarketingModule,
    PricingModule,
  ],
})
export class AppModule {}
