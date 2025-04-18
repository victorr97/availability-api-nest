import { Module } from '@nestjs/common';
import { AvailabilityModule } from '@features/availability/availability.module';

@Module({
  imports: [AvailabilityModule],
})
export class AppModule {}
