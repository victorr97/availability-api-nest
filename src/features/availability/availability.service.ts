import { Injectable } from '@nestjs/common';
import { FileReaderSingleton } from '@common/utils/file-reader.singleton';
import { Availability } from '@features/availability/interfaces/availability.interface';

@Injectable()
export class AvailabilityService {
  private fileReader = FileReaderSingleton.getInstance();

  /**
   * Returns all availability records between the given start and end dates (inclusive).
   * For each date in the range, it reads the corresponding availability JSON file
   * (using the FileReaderSingleton) and merges all records into a single array.
   *
   * @param start - Start date in YYYY-MM-DD format
   * @param end - End date in YYYY-MM-DD format
   * @returns Array of Availability objects for the date range
   */
  getAvailabilityByDate(start: string, end: string): Availability[] {
    const availability: Availability[] = [];
    const startDate = new Date(start);
    const endDate = new Date(end);

    // Iterate over each day in the date range
    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      // Build the file prefix for the current date (e.g., 'availability-20250421')
      const datePrefix = `availability-${d.toISOString().split('T')[0].replace(/-/g, '')}`;
      // Read data for the current date and add it to the result array
      const data = this.fileReader.getDataByDatePrefix(datePrefix);
      availability.push(...data);
    }

    return availability;
  }
}
