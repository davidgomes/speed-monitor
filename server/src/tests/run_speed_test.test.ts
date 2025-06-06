
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { speedTestResultsTable } from '../db/schema';
import { runSpeedTest } from '../handlers/run_speed_test';
import { eq } from 'drizzle-orm';

describe('runSpeedTest', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should run a speed test and return results', async () => {
    const result = await runSpeedTest();

    // Verify all required fields are present
    expect(result.id).toBeDefined();
    expect(result.download_speed).toBeDefined();
    expect(result.upload_speed).toBeDefined();
    expect(result.ping).toBeDefined();
    expect(result.timestamp).toBeInstanceOf(Date);

    // Verify numeric types
    expect(typeof result.download_speed).toBe('number');
    expect(typeof result.upload_speed).toBe('number');
    expect(typeof result.ping).toBe('number');

    // Verify realistic speed ranges
    expect(result.download_speed).toBeGreaterThan(0);
    expect(result.upload_speed).toBeGreaterThan(0);
    expect(result.ping).toBeGreaterThan(0);
  });

  it('should save speed test result to database', async () => {
    const result = await runSpeedTest();

    // Query the database to verify the result was saved
    const savedResults = await db.select()
      .from(speedTestResultsTable)
      .where(eq(speedTestResultsTable.id, result.id))
      .execute();

    expect(savedResults).toHaveLength(1);
    
    const savedResult = savedResults[0];
    expect(savedResult.id).toEqual(result.id);
    expect(parseFloat(savedResult.download_speed)).toEqual(result.download_speed);
    expect(parseFloat(savedResult.upload_speed)).toEqual(result.upload_speed);
    expect(parseFloat(savedResult.ping)).toEqual(result.ping);
    expect(savedResult.timestamp).toBeInstanceOf(Date);
  });

  it('should generate different results on multiple runs', async () => {
    const result1 = await runSpeedTest();
    const result2 = await runSpeedTest();

    // Results should have different IDs
    expect(result1.id).not.toEqual(result2.id);

    // At least one of the speed values should be different (very high probability with random values)
    const speedsAreDifferent = (
      result1.download_speed !== result2.download_speed ||
      result1.upload_speed !== result2.upload_speed ||
      result1.ping !== result2.ping
    );
    expect(speedsAreDifferent).toBe(true);
  });

  it('should store results with proper precision', async () => {
    const result = await runSpeedTest();

    // Query the raw database values to check precision
    const savedResults = await db.select()
      .from(speedTestResultsTable)
      .where(eq(speedTestResultsTable.id, result.id))
      .execute();

    const savedResult = savedResults[0];
    
    // Check that numeric values are stored as strings in database (PostgreSQL numeric type)
    expect(typeof savedResult.download_speed).toBe('string');
    expect(typeof savedResult.upload_speed).toBe('string');
    expect(typeof savedResult.ping).toBe('string');

    // Verify that the string values can be parsed back to the original numbers
    expect(parseFloat(savedResult.download_speed)).toEqual(result.download_speed);
    expect(parseFloat(savedResult.upload_speed)).toEqual(result.upload_speed);
    expect(parseFloat(savedResult.ping)).toEqual(result.ping);
  });
});
