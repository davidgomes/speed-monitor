
import { db } from '../db';
import { speedTestResultsTable } from '../db/schema';
import { type SpeedTestResult } from '../schema';

export const runSpeedTest = async (): Promise<SpeedTestResult> => {
  try {
    // Simulate running a speed test with random but realistic values
    const downloadSpeed = Math.random() * 100 + 10; // 10-110 Mbps
    const uploadSpeed = Math.random() * 50 + 5; // 5-55 Mbps
    const ping = Math.random() * 50 + 10; // 10-60 ms

    // Insert the test result into the database
    const result = await db.insert(speedTestResultsTable)
      .values({
        download_speed: downloadSpeed.toString(),
        upload_speed: uploadSpeed.toString(),
        ping: ping.toString()
      })
      .returning()
      .execute();

    // Convert numeric fields back to numbers before returning
    const speedTestResult = result[0];
    return {
      id: speedTestResult.id,
      download_speed: parseFloat(speedTestResult.download_speed),
      upload_speed: parseFloat(speedTestResult.upload_speed),
      ping: parseFloat(speedTestResult.ping),
      timestamp: speedTestResult.timestamp
    };
  } catch (error) {
    console.error('Speed test failed:', error);
    throw error;
  }
};
