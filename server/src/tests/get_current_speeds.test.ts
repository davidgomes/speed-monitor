
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { speedTestResultsTable } from '../db/schema';
import { getCurrentSpeeds } from '../handlers/get_current_speeds';

describe('getCurrentSpeeds', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return the most recent speed test result', async () => {
    // Insert test data with different timestamps
    const testData = [
      {
        download_speed: '25.50',
        upload_speed: '5.25',
        ping: '15.00',
        timestamp: new Date('2024-01-01T10:00:00Z')
      },
      {
        download_speed: '30.75',
        upload_speed: '6.50',
        ping: '12.25',
        timestamp: new Date('2024-01-01T12:00:00Z') // Most recent
      },
      {
        download_speed: '28.00',
        upload_speed: '5.75',
        ping: '18.50',
        timestamp: new Date('2024-01-01T08:00:00Z')
      }
    ];

    await db.insert(speedTestResultsTable).values(testData).execute();

    const result = await getCurrentSpeeds();

    // Should return the most recent result (12:00:00Z)
    expect(result.download_speed).toEqual(30.75);
    expect(result.upload_speed).toEqual(6.50);
    expect(result.ping).toEqual(12.25);
    expect(result.last_updated).toEqual(new Date('2024-01-01T12:00:00Z'));

    // Verify types are correct
    expect(typeof result.download_speed).toBe('number');
    expect(typeof result.upload_speed).toBe('number');
    expect(typeof result.ping).toBe('number');
    expect(result.last_updated).toBeInstanceOf(Date);
  });

  it('should throw error when no speed test results exist', async () => {
    await expect(getCurrentSpeeds()).rejects.toThrow(/no speed test results found/i);
  });

  it('should handle single speed test result', async () => {
    const testData = {
      download_speed: '100.00',
      upload_speed: '50.00',
      ping: '5.00'
    };

    await db.insert(speedTestResultsTable).values(testData).execute();

    const result = await getCurrentSpeeds();

    expect(result.download_speed).toEqual(100.00);
    expect(result.upload_speed).toEqual(50.00);
    expect(result.ping).toEqual(5.00);
    expect(result.last_updated).toBeInstanceOf(Date);
  });

  it('should correctly parse decimal values', async () => {
    const testData = {
      download_speed: '123.45',
      upload_speed: '67.89',
      ping: '9.12'
    };

    await db.insert(speedTestResultsTable).values(testData).execute();

    const result = await getCurrentSpeeds();

    expect(result.download_speed).toEqual(123.45);
    expect(result.upload_speed).toEqual(67.89);
    expect(result.ping).toEqual(9.12);
  });
});
