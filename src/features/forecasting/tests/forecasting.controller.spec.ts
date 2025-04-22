import { Test, TestingModule } from '@nestjs/testing';
import { ForecastingController } from '@features/forecasting/forecasting.controller';
import { ForecastingService } from '@features/forecasting/forecasting.service';
import { ForecastingQueryDto } from '@features/forecasting/dto/forecasting-query.dto';

describe('ForecastingController', () => {
  let controller: ForecastingController;
  let service: ForecastingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ForecastingController],
      providers: [
        {
          provide: ForecastingService,
          useValue: {
            predictAvailability: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ForecastingController>(ForecastingController);
    service = module.get<ForecastingService>(ForecastingService);
  });

  it('should be defined', () => {
    // Checks that the controller is properly instantiated
    expect(controller).toBeDefined();
  });

  it('should call service with correct params', async () => {
    // Mocks a valid DTO and ensures the service is called with the correct arguments
    const dto: ForecastingQueryDto = {
      activityId: 'a969d9f6-f7d6-43d1-9a36-02de49b7bce3',
      cityId: '5ff8e5f2-98d9-4321-8ae4-3f6c48c7f8d9',
      venueId: 'f3067eb5-9435-4a84-a6b5-3c0b4a9f18cf',
      targetDate: '2025-05-13',
    };
    (service.predictAvailability as jest.Mock).mockResolvedValue({
      result: 'ok',
    });

    const result = await controller.predictAvailability(dto);
    expect(service.predictAvailability).toHaveBeenCalledWith(
      dto.activityId,
      dto.cityId,
      dto.venueId,
      dto.targetDate,
    );
    expect(result).toEqual({ result: 'ok' });
  });

  it('should throw BadRequestException if params are missing', async () => {
    // Ensures that missing parameters cause a BadRequestException
    await expect(controller.predictAvailability({} as any)).rejects.toThrow();
  });
});
