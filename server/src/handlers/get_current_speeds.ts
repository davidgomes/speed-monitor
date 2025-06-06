
import { db } from '../db';
import { speedTestResultsTable } from '../db/schema';
import { type CurrentSpeeds } from '../schema';
import { desc } from 'drizzle-orm';

export const getCurrentSpeeds = async (): Promise<CurrentSpeeds> => {
  try {
    // Get the most recent speed test result
    const results = await db.select()
      .from(speedTestResultsTable)
      .orderBy(desc(speedTestResultsTable.timestamp))
      .limit(1)
      .execute();

    if (results.length === 0) {
      throw new Error('No speed test results found');
    }

    const latestResult = results[0];

    // Convert numeric fields back to numbers
    return {
      download_speed: parseFloat(latestResult.download_speed),
      upload_speed: parseFloat(latestResult.upload_speed),
      ping: parseFloat(latestResult.ping),
      last_updated: latestResult.timestamp
    };
  } catch (error) {
    console.error('Failed to get current speeds:', error);
    throw error;
  }
};
