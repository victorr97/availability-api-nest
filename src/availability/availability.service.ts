import { Injectable } from '@nestjs/common';
import { FileReaderSingleton } from '../utils/file-reader.singleton';
import { Availability } from './interfaces/availability.interface';

@Injectable()
export class AvailabilityService {
  private fileReader = FileReaderSingleton.getInstance();

  getAvailabilityByDate(start: string, end: string): Availability[] {
    const availability: Availability[] = [];
    const startDate = new Date(start);
    const endDate = new Date(end);

    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      const datePrefix = `availability-${d.toISOString().split('T')[0].replace(/-/g, '')}`;
      const data = this.fileReader.getDataByDatePrefix(datePrefix);
      availability.push(...data);
    }

    return availability;
  }
}
