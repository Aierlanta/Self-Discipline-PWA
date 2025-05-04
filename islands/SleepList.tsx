import { useState, useEffect, useContext } from "preact/hooks"; // Import useContext
import { IS_BROWSER } from "$fresh/runtime.ts";
import type { SleepRecord } from "../types/records.ts";
import { getAllSleepRecords, deleteSleepRecord } from "../services/db.ts"; // Import deleteSleepRecord
import { SettingsContext } from "../contexts/SettingsContext.tsx"; // Import context

// Helper function to format duration
function formatDuration(minutes: number, t: any): string { // Pass translation object
  // Use the correct translation key from context
  if (minutes < 0) return t.durationNA;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  // Consider making "h" and "m" translatable if needed
  return `${hours}h ${mins}m`;
}

// Helper function to format date/time
function formatDateTime(isoString: string, t: any): string { // Pass translation object
  try {
    // Note: toLocaleString uses browser locale, not app setting.
    // For full app-controlled formatting, use a library like date-fns with locale support.
    return new Date(isoString).toLocaleString(undefined, {
        dateStyle: 'short',
        timeStyle: 'short',
    });
  } catch (e) {
    // Use the correct translation key from context
    return t.invalidDate;
  }
}


export default function SleepList() {
  const { t } = useContext(SettingsContext); // Get context
  const currentT = t.value; // Access translations

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
        const message = err instanceof Error ? err.message : String(err);
        // Use the correct translation key from context
        setError(currentT.errorFailedToLoad.replace("{message}", message));
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecords();

    // Optional: Add a listener for custom events if the form could trigger a refresh
    // without full page reload. For now, rely on page load/refresh.

  }, []); // Empty dependency array means run once on mount

  const handleDelete = async (id: string) => {
    // Add confirmation dialog
    if (!window.confirm(currentT.confirmDeleteSleep)) {
      return;
    }

    try {
      await deleteSleepRecord(id, () => {
        // Update state after successful deletion
        setRecords((prevRecords) => prevRecords.filter((record) => record.id !== id));
        console.log(`Record ${id} deleted successfully from UI.`);
      });
    } catch (err) {
      console.error(`Failed to delete sleep record ${id}:`, err);
      const message = err instanceof Error ? err.message : String(err);
      // Display error to user (consider a more robust notification system)
      setError(currentT.errorFailedToDelete.replace("{message}", message));
      // Optionally clear the error after a few seconds
      setTimeout(() => setError(null), 5000);
    }
  };

  // Use context for SSR placeholder as well
  if (!IS_BROWSER) {
    // Render placeholder or nothing during SSR for islands fetching client-side data
    // Use the correct translation key from context
    return <div class="mt-8 p-6 border rounded-lg shadow-md bg-white dark:bg-gray-800 max-w-2xl mx-auto text-center text-gray-500 dark:text-gray-400">{currentT.ssrLoadingRecords}</div>;
  }

  // Add the missing return statement here
  return (
    <div class="mt-8 p-6 border rounded-lg shadow-md bg-white dark:bg-gray-800 max-w-2xl mx-auto">
      {/* Use the correct translation key from context */}
      <h2 class="text-xl font-semibold mb-4 text-center text-gray-800 dark:text-gray-200">{currentT.sleepHistoryTitle}</h2>
      {/* Use the correct translation key from context */}
      {isLoading && <p class="text-center text-gray-500 dark:text-gray-400">{currentT.loading}</p>}
      {error && (
         <div class="text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 p-3 rounded-md text-sm mb-4">
          {/* Error message already translated */}
          {error}
        </div>
      )}
      {/* Use the correct translation key from context */}
      {!isLoading && !error && records.length === 0 && (
        <p class="text-center text-gray-500 dark:text-gray-400">{currentT.noSleepRecords}</p>
      )}
      {!isLoading && !error && records.length > 0 && (
        <ul class="space-y-3">
          {records.map((record) => (
            <li key={record.id} class="p-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"> {/* Added gap */}
              <div class="flex-grow"> {/* Allow text content to grow */}
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {/* Use the correct translation key from context */}
                  <span class="font-medium text-gray-800 dark:text-gray-200">{currentT.labelSleep}</span> {formatDateTime(record.sleepTime, currentT)} {/* Pass t */}
                </p>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                   {/* Use the correct translation key from context */}
                   <span class="font-medium text-gray-800 dark:text-gray-200">{currentT.labelWake}</span> {formatDateTime(record.wakeTime, currentT)} {/* Pass t */}
                </p>
                 {/* Use the correct translation key from context */}
                 {record.notes && <p class="text-xs mt-1 text-gray-500 dark:text-gray-400 italic">{currentT.labelNotes} {record.notes}</p>}
              </div>
              <div class="flex items-center gap-2 flex-shrink-0"> {/* Container for duration and button */}
                <p class="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
                  {/* Pass t to helper */}
                  {formatDuration(record.durationMinutes, currentT)}
                </p>
                <button
                  onClick={() => handleDelete(record.id)}
                  title={currentT.deleteRecordTooltip} // Add tooltip
                  class="p-1 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 rounded"
                >
                  {/* Simple 'X' icon or use an SVG icon component */}
                  {/* Trash Can SVG Icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}