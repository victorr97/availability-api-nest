import { Test, TestingModule } from '@nestjs/testing';
import { MarketingController } from '../marketing.controller';
import { MarketingService } from '../marketing.service';

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
    const query = { prompt: '¿Qué día visitar Barcelona?' };
    const result = await controller.getInsights(query);
    expect(service.getInsights).toHaveBeenCalledWith(query);
    expect(result).toEqual({ insight: 'Mocked insight' });
  });
});
