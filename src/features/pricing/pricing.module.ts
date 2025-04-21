import { Module } from '@nestjs/common';
import { PricingController } from '@features/pricing/pricing.controller';
import { PricingService } from '@features/pricing/pricing.service';

@Module({
  controllers: [PricingController],
  providers: [PricingService],
})
export class PricingModule {}
