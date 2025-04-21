import { FileReaderSingleton } from '@common/utils/file-reader.singleton';
import {
  CITY_UUIDS,
  VENUE_UUIDS,
  ACTIVITY_UUIDS,
} from '@common/utils/uuids.util';
import * as fs from 'fs';
import * as path from 'path';

export function exportMergedAvailability() {
  const fileReader = FileReaderSingleton.getInstance();
  const dataDir = path.join(process.cwd(), 'data');
  const allFiles = fs.readdirSync(dataDir).filter((f) => f.endsWith('.json'));
  let merged: any[] = [];

  for (const file of allFiles) {
    const fileNameWithoutExt = file.replace('.json', '');
    const data = fileReader.getDataByDatePrefix(fileNameWithoutExt);
    for (const item of data as Array<{
      city: string;
      venue: string;
      activityId: keyof typeof ACTIVITY_UUIDS;
      date: string;
      timeslots: any[];
    }>) {
      merged.push({
        date: item.date,
        activityId: item.activityId,
        activityName:
          ACTIVITY_UUIDS[item.activityId as keyof typeof ACTIVITY_UUIDS] ||
          item.activityId,
        venue: item.venue,
        venueName:
          VENUE_UUIDS[item.venue as keyof typeof VENUE_UUIDS] || item.venue,
        city: item.city,
        cityName: CITY_UUIDS[item.city as keyof typeof CITY_UUIDS] || item.city,
        timeslots: item.timeslots.map(({ time, quantity }) => ({
          time,
          availability: quantity,
        })),
      });
    }
  }

  const outputPath = path.join(dataDir, 'availability-merged.json');
  fs.writeFileSync(outputPath, JSON.stringify(merged, null, 2), 'utf-8');
  console.log('Archivo availability-merged.json generado correctamente.');
  console.log(
    '[UUIDsMapping] Archivo availability-merged.json generado correctamente.',
  );
}
