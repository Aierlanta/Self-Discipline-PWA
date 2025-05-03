import { useState, useEffect } from "preact/hooks";
import { IS_BROWSER } from "$fresh/runtime.ts";
import type { SleepRecord } from "../types/records.ts";
import { getAllSleepRecords } from "../services/db.ts";

// Helper function to format duration
function formatDuration(minutes: number): string {
  if (minutes < 0) return "N/A";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

// Helper function to format date/time
function formatDateTime(isoString: string): string {
  try {
    return new Date(isoString).toLocaleString(undefined, {
        dateStyle: 'short',
        timeStyle: 'short',
    });
  } catch (e) {
    return "Invalid Date";
  }
}


export default function SleepList() {
  const [records, setRecords] = useState<SleepRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!IS_BROWSER) return; // Only run on client

    const fetchRecords = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedRecords = await getAllSleepRecords();
        setRecords(fetchedRecords);
      } catch (err) {
        console.error("Failed to fetch sleep records:", err);
        setError(`Failed to load records: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecords();

    // Optional: Add a listener for custom events if the form could trigger a refresh
    // without full page reload. For now, rely on page load/refresh.

  }, []); // Empty dependency array means run once on mount

  if (!IS_BROWSER) {
    // Render placeholder or nothing during SSR for islands fetching client-side data
    return <div class="mt-8 p-6 border rounded-lg shadow-md bg-white dark:bg-gray-800 max-w-2xl mx-auto text-center text-gray-500 dark:text-gray-400">Loading records...</div>;
  }

  return (
    <div class="mt-8 p-6 border rounded-lg shadow-md bg-white dark:bg-gray-800 max-w-2xl mx-auto">
      <h2 class="text-xl font-semibold mb-4 text-center text-gray-800 dark:text-gray-200">Sleep History</h2>
      {isLoading && <p class="text-center text-gray-500 dark:text-gray-400">Loading...</p>}
      {error && (
         <div class="text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 p-3 rounded-md text-sm mb-4">
          {error}
        </div>
      )}
      {!isLoading && !error && records.length === 0 && (
        <p class="text-center text-gray-500 dark:text-gray-400">No sleep records yet.</p>
      )}
      {!isLoading && !error && records.length > 0 && (
        <ul class="space-y-3">
          {records.map((record) => (
            <li key={record.id} class="p-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0 flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  <span class="font-medium text-gray-800 dark:text-gray-200">Sleep:</span> {formatDateTime(record.sleepTime)}
                </p>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                   <span class="font-medium text-gray-800 dark:text-gray-200">Wake:</span> {formatDateTime(record.wakeTime)}
                </p>
                 {record.notes && <p class="text-xs mt-1 text-gray-500 dark:text-gray-400 italic">Notes: {record.notes}</p>}
              </div>
              <p class="mt-2 sm:mt-0 text-lg font-semibold text-indigo-600 dark:text-indigo-400">
                {formatDuration(record.durationMinutes)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}