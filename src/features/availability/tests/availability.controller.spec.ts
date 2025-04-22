import { Test, TestingModule } from '@nestjs/testing';
import { AvailabilityController } from '@features/availability/availability.controller';
import { AvailabilityService } from '@features/availability/availability.service';
import { BadRequestException } from '@nestjs/common';

// Mock data
const mockResult = [
  {
    date: '2025-04-08',
    activityId: 'a969d9f6-f7d6-43d1-9a36-02de49b7bce3',
    venue: 'f3067eb5-9435-4a84-a6b5-3c0b4a9f18cf',
    city: '5ff8e5f2-98d9-4321-8ae4-3f6c48c7f8d9',
    timeslots: [
      { time: '08:30', quantity: 83 },
      { time: '09:30', quantity: 221 },
    ],
  },
  {
    date: '2025-04-08',
    activityId: 'c9fba3f0-20c3-4416-bc71-8c87b9d6b339',
    venue: '35bcebc7-4f47-4d29-bb0d-723af764f89e',
    city: 'd10bded7-b89e-4609-a25a-39b1a7a37fa6',
    timeslots: [
      { time: '08:00', quantity: 11 },
      { time: '08:30', quantity: 164 },
    ],
  },
];

describe('AvailabilityController', () => {
  let controller: AvailabilityController;
  let service: AvailabilityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AvailabilityController],
      providers: [
        {
          provide: AvailabilityService,
          useValue: {
            getAvailabilityByDate: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AvailabilityController>(AvailabilityController);
    service = module.get<AvailabilityService>(AvailabilityService);

    // Mock the service response
    jest.spyOn(service, 'getAvailabilityByDate').mockReturnValue(mockResult);
  });

  // Verify that the controller is properly defined
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Validate that a BadRequestException is thrown if start or end are missing
  it('should throw BadRequestException if start or end are missing', () => {
    expect(() =>
      controller.getAvailabilityByDate({ start: '', end: '' }),
    ).toThrow(
      new BadRequestException(
        'Both start and end dates are required. Please provide them in the format YYYY-MM-DD.',
      ),
    );
  });

  // Validate that a BadRequestException is thrown if start or end are invalid ISO date strings
  it('should throw BadRequestException if start or end are invalid ISO date strings', () => {
    expect(() =>
      controller.getAvailabilityByDate({
        start: 'invalid-date',
        end: '2025-04-10',
      }),
    ).toThrow(
      new BadRequestException(
        'The start and end dates must be in the format YYYY-MM-DD. Please check your input.',
      ),
    );

    expect(() =>
      controller.getAvailabilityByDate({
        start: '2025-04-08',
        end: 'invalid-date',
      }),
    ).toThrow(
      new BadRequestException(
        'The start and end dates must be in the format YYYY-MM-DD. Please check your input.',
      ),
    );
  });

  // Validate that a BadRequestException is thrown if the start date is after the end date
  it('should throw BadRequestException if start date is after end date', () => {
    expect(() =>
      controller.getAvailabilityByDate({
        start: '2025-04-10',
        end: '2025-04-08',
      }),
    ).toThrow(
      new BadRequestException(
        'The start date must be earlier than the end date. Please adjust your input.',
      ),
    );
  });

  // Verify that the controller calls the service with the correct parameters and returns the expected result
  it('should call service with correct parameters for valid input', () => {
    const start = '2025-04-08';
    const end = '2025-04-10';

    // Call the controller with valid parameters
    const result = controller.getAvailabilityByDate({ start, end });

    // Verify that the service was called with the correct parameters
    expect(service.getAvailabilityByDate).toHaveBeenCalledWith(start, end);

    // Verify that the result returned by the controller matches the mock result
    expect(result).toEqual(mockResult);
  });
});
