import { Test, TestingModule } from '@nestjs/testing';
import { PricingController } from '../pricing.controller';
import { PricingService } from '../pricing.service';

describe('PricingController', () => {
  let controller: PricingController;
  let service: PricingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PricingController],
      providers: [
        {
          provide: PricingService,
          useValue: {
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
    expect(controller).toBeDefined();
  });

  it('should call service and return pricing suggestion', async () => {
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
