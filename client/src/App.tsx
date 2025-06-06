
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import type { CurrentSpeeds, SpeedTestResult } from '../../server/src/schema';

function App() {
  const [currentSpeeds, setCurrentSpeeds] = useState<CurrentSpeeds | null>(null);
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadCurrentSpeeds = useCallback(async () => {
    try {
      const result = await trpc.getCurrentSpeeds.query();
      setCurrentSpeeds(result);
    } catch (error) {
      console.error('Failed to load current speeds:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCurrentSpeeds();
  }, [loadCurrentSpeeds]);

  const runSpeedTest = async () => {
    setIsRunningTest(true);
    try {
      const result: SpeedTestResult = await trpc.runSpeedTest.mutate();
      // Update current speeds with the new test result
      setCurrentSpeeds({
        download_speed: result.download_speed,
        upload_speed: result.upload_speed,
        ping: result.ping,
        last_updated: result.timestamp
      });
    } catch (error) {
      console.error('Failed to run speed test:', error);
    } finally {
      setIsRunningTest(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-gray-600">Loading current speeds...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Internet Speed Monitor</h1>
          <p className="text-gray-600">Current connection speeds</p>
        </div>

        {currentSpeeds ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Download Speed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {currentSpeeds.download_speed.toFixed(1)}
                </div>
                <div className="text-sm text-gray-500">Mbps</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Upload Speed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {currentSpeeds.upload_speed.toFixed(1)}
                </div>
                <div className="text-sm text-gray-500">Mbps</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Ping</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">
                  {currentSpeeds.ping.toFixed(0)}
                </div>
                <div className="text-sm text-gray-500">ms</div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center mb-8">
            <div className="text-gray-500">No speed data available</div>
          </div>
        )}

        <div className="text-center">
          <Button 
            onClick={runSpeedTest} 
            disabled={isRunningTest}
            size="lg"
            className="px-8"
          >
            {isRunningTest ? 'Running Speed Test...' : 'Run Speed Test'}
          </Button>
          
          {currentSpeeds && (
            <div className="mt-4 text-sm text-gray-500">
              Last updated: {currentSpeeds.last_updated.toLocaleString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
