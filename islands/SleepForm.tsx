import { useState, useContext } from "preact/hooks"; // Import useContext
import { IS_BROWSER } from "$fresh/runtime.ts";
import type { SleepRecord } from "../types/records.ts";
import { Button } from "../components/Button.tsx";
import { addSleepRecord } from "../services/db.ts"; // Import the DB function
import { SettingsContext } from "../contexts/SettingsContext.tsx"; // Import context

export default function SleepForm() {
  const { t } = useContext(SettingsContext); // Get translation context
  const currentT = t.value; // Access translations

  const [sleepTime, setSleepTime] = useState("");
  const [wakeTime, setWakeTime] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Add loading state

  const handleSubmit = async (e: Event) => { // Make async
    e.preventDefault();
    setError(null);
    setIsLoading(true); // Set loading true

    if (!sleepTime || !wakeTime) {
      setError(currentT.errorEnterTimes); // Use translation
      return;
    }

    const sleepDate = new Date(sleepTime);
    const wakeDate = new Date(wakeTime);

    if (isNaN(sleepDate.getTime()) || isNaN(wakeDate.getTime())) {
        setError(currentT.errorInvalidDate); // Use translation
        return;
    }

    if (wakeDate <= sleepDate) {
      setError(currentT.errorWakeBeforeSleep); // Use translation
      return;
    }

    const durationMs = wakeDate.getTime() - sleepDate.getTime();
    const durationMinutes = Math.round(durationMs / (1000 * 60));

    // Create a partial record, ID and createdAt will be added during saving
    const partialRecord: Omit<SleepRecord, "id" | "createdAt"> = {
      sleepTime: sleepDate.toISOString(),
      wakeTime: wakeDate.toISOString(),
      durationMinutes: durationMinutes,
      notes: notes || undefined,
    };

    try {
      const newId = await addSleepRecord(partialRecord);
      console.log("New Sleep Record saved with ID:", newId);
      // Use translations for alert, requires interpolation support in t() or manual construction
      const hours = Math.floor(durationMinutes / 60);
      const minutes = durationMinutes % 60;
      const durationString = currentT.alertDuration
                                 .replace("{hours}", hours.toString())
                                 .replace("{minutes}", minutes.toString());
      alert(`${currentT.alertSleepLogged}\n${durationString}`);

      // Clear form after successful submission
      setSleepTime("");
      setWakeTime("");
      setNotes("");
    } catch (err) {
      console.error("Failed to save sleep record:", err);
      const message = err instanceof Error ? err.message : String(err);
      setError(currentT.errorFailedToSave.replace("{message}", message)); // Use translation
    } finally {
      setIsLoading(false); // Set loading false
    }
  };

  // Disable form elements during SSR or while submitting
  const disabled = !IS_BROWSER || isLoading;

  return (
    <form onSubmit={handleSubmit} class="space-y-4 p-6 border rounded-lg shadow-md bg-white dark:bg-gray-800 max-w-md mx-auto">
      <h2 class="text-2xl font-semibold mb-4 text-center text-gray-800 dark:text-gray-200">{currentT.logSleepTitle}</h2> {/* Use translation */}
      {error && (
        <div class="text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 p-3 rounded-md text-sm">
          {/* Error message is already translated */}
          {error}
        </div>
      )}
      <div>
        <label htmlFor="sleepTime" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{currentT.labelSleepTime}</label> {/* Use translation */}
        <input
          type="datetime-local"
          id="sleepTime"
          name="sleepTime"
          value={sleepTime}
          onInput={(e) => setSleepTime((e.target as HTMLInputElement).value)}
          disabled={disabled}
          required
          class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50"
        />
      </div>
      <div>
        <label htmlFor="wakeTime" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{currentT.labelWakeTime}</label> {/* Use translation */}
        <input
          type="datetime-local"
          id="wakeTime"
          name="wakeTime"
          value={wakeTime}
          onInput={(e) => setWakeTime((e.target as HTMLInputElement).value)}
          disabled={disabled}
          required
          class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50"
        />
      </div>
       <div>
        <label htmlFor="notes" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{currentT.labelNotesOptional}</label> {/* Use translation */}
        <textarea
          id="notes"
          name="notes"
          rows={3}
          value={notes}
          onInput={(e) => setNotes((e.target as HTMLTextAreaElement).value)}
          disabled={disabled}
          class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50"
          placeholder={currentT.placeholderSleepNotes} // Use translation
        />
      </div>
      <Button type="submit" disabled={disabled} class="w-full">
        {isLoading ? currentT.buttonLogging : currentT.buttonLogSleep} {/* Use translation */}
      </Button>
    </form>
  );
}