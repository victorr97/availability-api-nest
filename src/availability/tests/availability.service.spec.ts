import { Test, TestingModule } from '@nestjs/testing';
import { AvailabilityService } from 'availability/availability.service';
import { FileReaderSingleton } from 'common/utils/file-reader.singleton';
import { Availability } from 'availability/interfaces/availability.interface';

jest.mock('../../utils/file-reader.singleton', () => {
  return {
    FileReaderSingleton: {
      getInstance: jest.fn().mockReturnValue({
        getDataByDatePrefix: jest.fn(), // Mock the method
      }),
    },
  };
});

describe('AvailabilityService', () => {
  let service: AvailabilityService;
  let fileReaderMock: jest.Mocked<FileReaderSingleton>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AvailabilityService],
    }).compile();

    service = module.get<AvailabilityService>(AvailabilityService);

    // Mock the FileReaderSingleton instance
    fileReaderMock =
      FileReaderSingleton.getInstance() as jest.Mocked<FileReaderSingleton>;
    fileReaderMock.getDataByDatePrefix.mockClear(); // Clear previous mock calls
  });

  // Verify that the service is properly defined
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Test for valid date range with matching data
  it('should return availability data for a valid date range', () => {
    const mockData: Availability[] = [
      {
        date: '2025-04-08',
        activityId: 'a969d9f6-f7d6-43d1-9a36-02de49b7bce3',
        venue: 'Venue A',
        city: 'City A',
        timeslots: [{ time: '10:00', quantity: 5 }],
      },
    ];

    // Mock the FileReaderSingleton to return data for specific prefixes
    fileReaderMock.getDataByDatePrefix.mockImplementation((prefix: string) => {
      if (prefix === 'availability-20250408') {
        return mockData;
      }
      return [];
    });

    const result = service.getAvailabilityByDate('2025-04-08', '2025-04-09');

    expect(fileReaderMock.getDataByDatePrefix).toHaveBeenCalledTimes(2); // Called for each date in the range
    expect(fileReaderMock.getDataByDatePrefix).toHaveBeenCalledWith(
      'availability-20250408',
    );
    expect(fileReaderMock.getDataByDatePrefix).toHaveBeenCalledWith(
      'availability-20250409',
    );
    expect(result).toEqual(mockData); // Should return the mocked data
  });

  // Test for no matching data
  it('should return an empty array if no data is found for the date range', () => {
    // Mock the FileReaderSingleton to return no data
    fileReaderMock.getDataByDatePrefix.mockReturnValue([]);

    const result = service.getAvailabilityByDate('2025-04-08', '2025-04-09');

    expect(fileReaderMock.getDataByDatePrefix).toHaveBeenCalledTimes(2); // Called for each date in the range
    expect(result).toEqual([]); // Should return an empty array
  });

  // Test for invalid date range
  it('should return an empty array if the date range is invalid', () => {
    const result = service.getAvailabilityByDate('2025-04-10', '2025-04-08');

    expect(fileReaderMock.getDataByDatePrefix).not.toHaveBeenCalled(); // Should not call the FileReaderSingleton
    expect(result).toEqual([]); // Should return an empty array
  });

  // Test for partially matching data
  it('should return data only for dates with matching files', () => {
    const mockDataDay1: Availability[] = [
      {
        date: '2025-04-08',
        activityId: 'a969d9f6-f7d6-43d1-9a36-02de49b7bce3',
        venue: 'Venue A',
        city: 'City A',
        timeslots: [{ time: '10:00', quantity: 5 }],
      },
    ];

    const mockDataDay2: Availability[] = [
      {
        date: '2025-04-09',
        activityId: 'b1234567-f7d6-43d1-9a36-02de49b7bce3',
        venue: 'Venue B',
        city: 'City B',
        timeslots: [{ time: '11:00', quantity: 10 }],
      },
    ];

    // Mock the FileReaderSingleton to return data for specific prefixes
    fileReaderMock.getDataByDatePrefix.mockImplementation((prefix: string) => {
      if (prefix === 'availability-20250408') {
        return mockDataDay1;
      }
      if (prefix === 'availability-20250409') {
        return mockDataDay2;
      }
      return [];
    });

    const result = service.getAvailabilityByDate('2025-04-08', '2025-04-09');

    expect(fileReaderMock.getDataByDatePrefix).toHaveBeenCalledTimes(2); // Called for each date in the range
    expect(result).toEqual([...mockDataDay1, ...mockDataDay2]); // Should return combined data
  });
});
