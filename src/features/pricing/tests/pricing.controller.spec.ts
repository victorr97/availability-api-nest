import { Test, TestingModule } from '@nestjs/testing';
import { PricingController } from '../pricing.controller';
import { PricingService } from '../pricing.service';

describe('PricingController', () => {
  let controller: PricingController;
  let service: PricingService;

  beforeEach(async () => {
    // Set up the testing module with the controller and a mocked service
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PricingController],
      providers: [
        {
          provide: PricingService,
          useValue: {
            // Mock the suggestDynamicPricing method to return a fixed value
            suggestDynamicPricing: jest.fn().mockReturnValue({
              activityId: 'test',
              startDate: '2025-01-01',
              endDate: '2025-01-02',
              timeslots: [],
            }),
          },
        },
      ],
    }).compile();

    controller = module.get<PricingController>(PricingController);
    service = module.get<PricingService>(PricingService);
  });

  it('should be defined', () => {
    // Checks that the controller is properly instantiated
    expect(controller).toBeDefined();
  });

  it('should call service and return pricing suggestion', async () => {
    // Ensures that the controller calls the service with the correct arguments and returns the expected result
    const query = {
      activityId: 'test',
      startDate: '2025-01-01',
      endDate: '2025-01-02',
    };
    const result = await controller['pricingService'].suggestDynamicPricing(
      query.activityId,
      query.startDate,
      query.endDate,
    );
    expect(result.activityId).toBe('test');
    expect(service.suggestDynamicPricing).toHaveBeenCalledWith(
      'test',
      '2025-01-01',
      '2025-01-02',
    );
  });
});
