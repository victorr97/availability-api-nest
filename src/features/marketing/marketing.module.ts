import { Module } from '@nestjs/common';
import { MarketingController } from '@features/marketing/marketing.controller';
import { MarketingService } from '@features/marketing/marketing.service';

@Module({
  controllers: [MarketingController],
  providers: [MarketingService],
})
export class MarketingModule {}
