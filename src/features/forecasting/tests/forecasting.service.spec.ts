import { Test, TestingModule } from '@nestjs/testing';
import { ForecastingService } from '@features/forecasting/forecasting.service';
import { NotFoundException } from '@nestjs/common';
import {
  CITY_UUIDS,
  VENUE_UUIDS,
  ACTIVITY_UUIDS,
} from '@common/utils/uuids.util';

describe('ForecastingService', () => {
  let service: ForecastingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ForecastingService],
    }).compile();

    service = module.get<ForecastingService>(ForecastingService);
  });

  it('should be defined', () => {
    // Checks that the service is properly instantiated
    expect(service).toBeDefined();
  });

  it('should throw NotFoundException for invalid cityId', async () => {
    // Ensures that an invalid cityId triggers a NotFoundException
    await expect(
      service.predictAvailability(
        Object.keys(ACTIVITY_UUIDS)[0],
        'invalid-city',
        Object.keys(VENUE_UUIDS)[0],
        '2025-05-13',
      ),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException for invalid venueId', async () => {
    // Ensures that an invalid venueId triggers a NotFoundException
    await expect(
      service.predictAvailability(
        Object.keys(ACTIVITY_UUIDS)[0],
        Object.keys(CITY_UUIDS)[0],
        'invalid-venue',
        '2025-05-13',
      ),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException for invalid activityId', async () => {
    // Ensures that an invalid activityId triggers a NotFoundException
    await expect(
      service.predictAvailability(
        'invalid-activity',
        Object.keys(CITY_UUIDS)[0],
        Object.keys(VENUE_UUIDS)[0],
        '2025-05-13',
      ),
    ).rejects.toThrow(NotFoundException);
  });
});
