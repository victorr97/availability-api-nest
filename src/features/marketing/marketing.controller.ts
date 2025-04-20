import { Controller, Get, Query } from '@nestjs/common';
import { MarketingService } from '@features/marketing/marketing.service';

@Controller('marketing')
export class MarketingController {
  constructor(private readonly marketingService: MarketingService) {}

  @Get('insights')
  getInsights(@Query() query: any) {
    // For now, just return a placeholder response
    return this.marketingService.getInsights(query);
  }
}
