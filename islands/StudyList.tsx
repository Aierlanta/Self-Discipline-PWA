import { useState, useEffect, useContext } from "preact/hooks"; // Import useContext
import { IS_BROWSER } from "$fresh/runtime.ts";
import type { StudyRecord } from "../types/records.ts";
import { getAllStudyRecords } from "../services/db.ts";
import { SettingsContext } from "../contexts/SettingsContext.tsx"; // Import context

// Helper function to format duration (reuse or move to utils later)
function formatDuration(minutes: number, t: any): string { // Pass t
  if (minutes < 0) return t.durationNA; // Reuse translation
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
      return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}

// Helper function to format date/time (reuse or move to utils later)
function formatDateTime(isoString: string, t: any): string { // Pass t
  try {
    return new Date(isoString).toLocaleString(undefined, {
        dateStyle: 'short',
        timeStyle: 'short',
    });
  } catch (e) {
    return t.invalidDate; // Reuse translation
  }
}


export default function StudyList() {
  const { t } = useContext(SettingsContext); // Get context
  const currentT = t.value; // Access translations

  const [records, setRecords] = useState<StudyRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!IS_BROWSER) return;

    const fetchRecords = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedRecords = await getAllStudyRecords();
        setRecords(fetchedRecords);
      } catch (err) {
        console.error("Failed to fetch study records:", err);
        const message = err instanceof Error ? err.message : String(err);
        setError(currentT.errorFailedToLoad.replace("{message}", message)); // Reuse translation
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecords();

  }, []);

  if (!IS_BROWSER) {
    return <div class="mt-8 p-6 border rounded-lg shadow-md bg-white dark:bg-gray-800 max-w-2xl mx-auto text-center text-gray-500 dark:text-gray-400">{currentT.ssrLoadingRecords}</div>; // Reuse translation
  }

  return (
    <div class="mt-8 p-6 border rounded-lg shadow-md bg-white dark:bg-gray-800 max-w-2xl mx-auto">
      <h2 class="text-xl font-semibold mb-4 text-center text-gray-800 dark:text-gray-200">{currentT.studyHistoryTitle}</h2> {/* Use translation */}
      {isLoading && <p class="text-center text-gray-500 dark:text-gray-400">{currentT.loading}</p>} {/* Reuse translation */}
      {error && (
         <div class="text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 p-3 rounded-md text-sm mb-4">
          {/* Error message already translated */}
          {error}
        </div>
      )}
      {!isLoading && !error && records.length === 0 && (
        <p class="text-center text-gray-500 dark:text-gray-400">{currentT.noStudyRecords}</p> /* Use translation */
      )}
      {!isLoading && !error && records.length > 0 && (
        <ul class="space-y-3">
          {records.map((record) => (
            <li key={record.id} class="p-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0 flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div>
                 <p class="font-medium text-gray-800 dark:text-gray-200">{record.topic}</p> {/* Topic is user input, not translated */}
                 <p class="text-sm text-gray-600 dark:text-gray-400">
                   {formatDateTime(record.dateTime, currentT)} {/* Pass t */}
                 </p>
                 {record.notes && <p class="text-xs mt-1 text-gray-500 dark:text-gray-400 italic">{currentT.labelNotes} {record.notes}</p>} {/* Reuse translation */}
              </div>
              <p class="mt-2 sm:mt-0 text-lg font-semibold text-blue-600 dark:text-blue-400">
                {formatDuration(record.durationMinutes, currentT)} {/* Pass t */}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}