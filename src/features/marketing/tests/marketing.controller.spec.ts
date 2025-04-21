import { Test, TestingModule } from '@nestjs/testing';
import { MarketingController } from '@features/marketing/marketing.controller';
import { MarketingService } from '@features/marketing/marketing.service';

describe('MarketingController', () => {
  let controller: MarketingController;
  let service: MarketingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MarketingController],
      providers: [
        {
          provide: MarketingService,
          useValue: {
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
    expect(controller).toBeDefined();
  });

  it('should call service.getInsights and return its result', async () => {
    const prompt = '¿Qué día visitar Barcelona?';
    const result = await controller.getInsights(prompt);
    expect(service.getInsights).toHaveBeenCalledWith({ prompt });
    expect(result).toEqual({ insight: 'Mocked insight' });
  });
});
