/**
 * Singleton class for handling file-based data access.
 * This class is designed to simulate a database connection by reading and caching JSON files.
 * It provides an efficient way to retrieve data from files without repeatedly accessing the file system.
 */
import { Injectable } from '@nestjs/common';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

@Injectable()
export class FileReaderSingleton {
  private static instance: FileReaderSingleton;
  private dataCache: Record<string, any[]> = {};
  private dataDir = join(process.cwd(), 'data');

  private constructor() {}

  // Get the Singleton instance
  public static getInstance(): FileReaderSingleton {
    if (!FileReaderSingleton.instance) {
      FileReaderSingleton.instance = new FileReaderSingleton();
    }
    return FileReaderSingleton.instance;
  }

  // Read and cache data for a specific date prefix
  public getDataByDatePrefix(datePrefix: string): any[] {
    const normalizedPrefix = datePrefix.replace(/-/g, '');

    if (this.dataCache[normalizedPrefix]) {
      return this.dataCache[normalizedPrefix]; // Return cached data
    }

    const allFiles = readdirSync(this.dataDir);
    const matchingFiles = allFiles
      .filter((f) => f.includes(normalizedPrefix) && f.endsWith('.json'))
      .sort();

    const data: any[] = [];
    for (const file of matchingFiles) {
      const filePath = join(this.dataDir, file);
      try {
        const content = readFileSync(filePath, 'utf-8');
        const json = JSON.parse(content);
        data.push(...json);
      } catch {
        console.warn(`Invalid or unreadable file: ${file}`);
      }
    }

    this.dataCache[normalizedPrefix] = data; // Cache the data
    return data;
  }
}
