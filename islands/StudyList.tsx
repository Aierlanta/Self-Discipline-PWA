import { useState, useEffect, useContext } from "preact/hooks"; // Import useContext
import { IS_BROWSER } from "$fresh/runtime.ts";
import type { StudyRecord } from "../types/records.ts";
import { getAllStudyRecords, deleteStudyRecord } from "../services/db.ts"; // Import delete function
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
  const { t, incrementDataVersion } = useContext(SettingsContext); // Get context and data version updater
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

  const handleDelete = async (id: string) => {
    // Add confirmation dialog using a new translation key
    if (!window.confirm(currentT.confirmDeleteStudy)) {
      return;
    }

    try {
      await deleteStudyRecord(id, incrementDataVersion); // Call DB delete function and trigger update
      // Update state locally after successful deletion
      setRecords((prevRecords) => prevRecords.filter((record) => record.id !== id));
      console.log(`Study record ${id} deleted successfully from UI.`);
    } catch (err) {
      console.error(`Failed to delete study record ${id}:`, err);
      const message = err instanceof Error ? err.message : String(err);
      // Display error using a new translation key
      setError(currentT.errorFailedToDeleteStudy.replace("{message}", message));
      // Optionally clear the error after a few seconds
      setTimeout(() => setError(null), 5000);
    }
  };

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
            <li key={record.id} class="p-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"> {/* Added gap */}
              <div class="flex-grow"> {/* Allow text content to grow */}
                 <p class="font-medium text-gray-800 dark:text-gray-200">{record.topic}</p> {/* Topic is user input, not translated */}
                 <p class="text-sm text-gray-600 dark:text-gray-400">
                   {formatDateTime(record.dateTime, currentT)} {/* Pass t */}
                 </p>
                 {record.notes && <p class="text-xs mt-1 text-gray-500 dark:text-gray-400 italic">{currentT.labelNotes} {record.notes}</p>} {/* Reuse translation */}
              </div>
              <div class="flex items-center gap-2 flex-shrink-0"> {/* Container for duration and button */}
                <p class="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  {formatDuration(record.durationMinutes, currentT)} {/* Pass t */}
                </p>
                <button
                  onClick={() => handleDelete(record.id)}
                  title={currentT.deleteRecordTooltip} // Reuse tooltip translation
                  class="p-1 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 rounded"
                >
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