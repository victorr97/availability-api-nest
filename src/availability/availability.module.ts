import { Module } from '@nestjs/common';
import { AvailabilityController } from 'availability/availability.controller';
import { AvailabilityService } from 'availability/availability.service';
@Module({
  controllers: [AvailabilityController],
  providers: [AvailabilityService],
})
export class AvailabilityModule {}
