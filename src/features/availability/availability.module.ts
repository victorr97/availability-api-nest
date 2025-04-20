import { Module } from '@nestjs/common';
import { AvailabilityController } from '@features/availability/availability.controller';
import { AvailabilityService } from '@features/availability/availability.service';
@Module({
  controllers: [AvailabilityController],
  providers: [AvailabilityService],
})
export class AvailabilityModule {}
