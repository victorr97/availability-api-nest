import { Injectable } from '@nestjs/common';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { Availability } from './interfaces/availability.interface';

@Injectable()
export class AvailabilityService {
  private dataDir = join(process.cwd(), 'data');

  getAvailabilityByDate(start: string, end: string): Availability[] {
    const availability: Availability[] = [];
    const startDate = new Date(start);
    const endDate = new Date(end);
    const allFiles = readdirSync(this.dataDir);

    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      const datePrefix = `availability-${d.toISOString().split('T')[0].replace(/-/g, '')}`;
      const matchingFiles = allFiles
        .filter((f) => f.startsWith(datePrefix) && f.endsWith('.json'))
        .sort(); // Para asegurar el orden -01, -02, etc.

      for (const file of matchingFiles) {
        const filePath = join(this.dataDir, file);
        try {
          const content = readFileSync(filePath, 'utf-8');
          const json = JSON.parse(content);
          availability.push(...json);
        } catch {
          console.warn(`Invalid or unreadable file: ${file}`);
        }
      }
    }

    return availability;
  }
}
