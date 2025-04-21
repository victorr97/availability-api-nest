import { FileReaderSingleton } from '@common/utils/file-reader.singleton';
import {
  CITY_UUIDS,
  VENUE_UUIDS,
  ACTIVITY_UUIDS,
} from '@common/utils/uuids.util';
import * as fs from 'fs';
import * as path from 'path';

// This function merges all availability JSON files in the /data directory into a single file.
// It also enriches each record with human-readable names for city, venue, and activity.
export function exportMergedAvailability() {
  const fileReader = FileReaderSingleton.getInstance();
  const dataDir = path.join(process.cwd(), 'data');
  // Get all JSON files in the data directory
  const allFiles = fs.readdirSync(dataDir).filter((f) => f.endsWith('.json'));
  let merged: any[] = [];

  for (const file of allFiles) {
    // Remove the .json extension to get the file prefix
    const fileNameWithoutExt = file.replace('.json', '');
    // Read data from the file using the singleton file reader
    const data = fileReader.getDataByDatePrefix(fileNameWithoutExt);
    // Iterate over each availability record in the file
    for (const item of data as Array<{
      city: string;
      venue: string;
      activityId: keyof typeof ACTIVITY_UUIDS;
      date: string;
      timeslots: any[];
    }>) {
      // Push a normalized and enriched record to the merged array
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

  // Write the merged and enriched data to a new JSON file
  const outputPath = path.join(dataDir, 'availability-merged.json');
  fs.writeFileSync(outputPath, JSON.stringify(merged, null, 2), 'utf-8');

  console.log('Archivo availability-merged.json generado correctamente.');
  console.log(
    '[UUIDsMapping] Archivo availability-merged.json generado correctamente.',
  );
}
