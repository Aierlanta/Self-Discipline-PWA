import { useState, useEffect } from "preact/hooks";
import { IS_BROWSER } from "$fresh/runtime.ts";
import type { ExerciseRecord } from "../types/records.ts";
import { getAllExerciseRecords } from "../services/db.ts";

// Helper function to format duration (reuse or move to utils later)
function formatDuration(minutes: number): string {
  if (minutes < 0) return "N/A";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
      return `${hours}h ${mins}m`;
  }
  return `${mins}m`; // Only show minutes if less than an hour
}

// Helper function to format date/time (reuse or move to utils later)
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


export default function ExerciseList() {
  const [records, setRecords] = useState<ExerciseRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!IS_BROWSER) return;

    const fetchRecords = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedRecords = await getAllExerciseRecords();
        setRecords(fetchedRecords);
      } catch (err) {
        console.error("Failed to fetch exercise records:", err);
        setError(`Failed to load records: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecords();

  }, []);

  if (!IS_BROWSER) {
    return <div class="mt-8 p-6 border rounded-lg shadow-md bg-white dark:bg-gray-800 max-w-2xl mx-auto text-center text-gray-500 dark:text-gray-400">Loading records...</div>;
  }

  return (
    <div class="mt-8 p-6 border rounded-lg shadow-md bg-white dark:bg-gray-800 max-w-2xl mx-auto">
      <h2 class="text-xl font-semibold mb-4 text-center text-gray-800 dark:text-gray-200">Exercise History</h2>
      {isLoading && <p class="text-center text-gray-500 dark:text-gray-400">Loading...</p>}
      {error && (
         <div class="text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 p-3 rounded-md text-sm mb-4">
          {error}
        </div>
      )}
      {!isLoading && !error && records.length === 0 && (
        <p class="text-center text-gray-500 dark:text-gray-400">No exercise records yet.</p>
      )}
      {!isLoading && !error && records.length > 0 && (
        <ul class="space-y-3">
          {records.map((record) => (
            <li key={record.id} class="p-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0 flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div>
                 <p class="font-medium text-gray-800 dark:text-gray-200">{record.activity}</p>
                 <p class="text-sm text-gray-600 dark:text-gray-400">
                   {formatDateTime(record.dateTime)}
                 </p>
                 {record.notes && <p class="text-xs mt-1 text-gray-500 dark:text-gray-400 italic">Notes: {record.notes}</p>}
              </div>
              <p class="mt-2 sm:mt-0 text-lg font-semibold text-green-600 dark:text-green-400">
                {formatDuration(record.durationMinutes)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}