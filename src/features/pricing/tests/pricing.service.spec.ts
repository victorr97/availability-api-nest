import { Test, TestingModule } from '@nestjs/testing';
import { PricingService } from '../pricing.service';

describe('PricingService', () => {
  let service: PricingService;

  beforeEach(async () => {
    // Set up the testing module and inject the PricingService
    const module: TestingModule = await Test.createTestingModule({
      providers: [PricingService],
    }).compile();

    service = module.get<PricingService>(PricingService);
  });

  it('should be defined', () => {
    // Checks that the service is properly instantiated
    expect(service).toBeDefined();
  });

  it('should return an empty timeslots array if activity not found', () => {
    // Ensures that if the activity ID does not exist, the service returns an empty timeslots array
    const result = service.suggestDynamicPricing(
      'fake-id',
      '2025-01-01',
      '2025-01-02',
    );
    expect(result.timeslots).toEqual([]);
  });
});
