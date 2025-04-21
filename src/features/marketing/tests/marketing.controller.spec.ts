import { Test, TestingModule } from '@nestjs/testing';
import { MarketingController } from '@features/marketing/marketing.controller';
import { MarketingService } from '@features/marketing/marketing.service';

describe('MarketingController', () => {
  let controller: MarketingController;
  let service: MarketingService;

  beforeEach(async () => {
    // Set up the testing module with the controller and a mocked service
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MarketingController],
      providers: [
        {
          provide: MarketingService,
          useValue: {
            // Mock the getInsights method to always resolve with a fixed value
            getInsights: jest
              .fn()
              .mockResolvedValue({ insight: 'Mocked insight' }),
          },
        },
      ],
    }).compile();

    controller = module.get<MarketingController>(MarketingController);
    service = module.get<MarketingService>(MarketingService);
  });

  it('should be defined', () => {
    // Checks that the controller is properly instantiated
    expect(controller).toBeDefined();
  });

  it('should call service.getInsights and return its result', async () => {
    // Ensures that the controller calls the service with the correct argument and returns the expected result
    const prompt = '¿Qué día visitar Barcelona?';
    const result = await controller.getInsights(prompt);
    expect(service.getInsights).toHaveBeenCalledWith({ prompt });
    expect(result).toEqual({ insight: 'Mocked insight' });
  });
});
