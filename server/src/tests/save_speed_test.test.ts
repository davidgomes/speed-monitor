
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { speedTestResultsTable } from '../db/schema';
import { type CreateSpeedTestInput } from '../schema';
import { saveSpeedTest } from '../handlers/save_speed_test';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreateSpeedTestInput = {
  download_speed: 100.5,
  upload_speed: 50.25,
  ping: 15.75
};

describe('saveSpeedTest', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should save a speed test result', async () => {
    const result = await saveSpeedTest(testInput);

    // Basic field validation
    expect(result.download_speed).toEqual(100.5);
    expect(result.upload_speed).toEqual(50.25);
    expect(result.ping).toEqual(15.75);
    expect(result.id).toBeDefined();
    expect(result.timestamp).toBeInstanceOf(Date);
  });

  it('should save speed test result to database', async () => {
    const result = await saveSpeedTest(testInput);

    // Query using proper drizzle syntax
    const speedTests = await db.select()
      .from(speedTestResultsTable)
      .where(eq(speedTestResultsTable.id, result.id))
      .execute();

    expect(speedTests).toHaveLength(1);
    expect(parseFloat(speedTests[0].download_speed)).toEqual(100.5);
    expect(parseFloat(speedTests[0].upload_speed)).toEqual(50.25);
    expect(parseFloat(speedTests[0].ping)).toEqual(15.75);
    expect(speedTests[0].timestamp).toBeInstanceOf(Date);
  });

  it('should handle zero ping values', async () => {
    const zeroInput: CreateSpeedTestInput = {
      download_speed: 75.0,
      upload_speed: 25.0,
      ping: 0
    };

    const result = await saveSpeedTest(zeroInput);

    expect(result.ping).toEqual(0);
    expect(typeof result.ping).toBe('number');
  });

  it('should preserve decimal precision', async () => {
    const precisionInput: CreateSpeedTestInput = {
      download_speed: 123.45,
      upload_speed: 67.89,
      ping: 12.34
    };

    const result = await saveSpeedTest(precisionInput);

    expect(result.download_speed).toEqual(123.45);
    expect(result.upload_speed).toEqual(67.89);
    expect(result.ping).toEqual(12.34);
  });
});
