import { useState, useContext } from "preact/hooks"; // Import useContext
import { IS_BROWSER } from "$fresh/runtime.ts";
import type { StudyRecord } from "../types/records.ts";
import { Button } from "../components/Button.tsx";
import { addStudyRecord } from "../services/db.ts";
import { SettingsContext } from "../contexts/SettingsContext.tsx"; // Import context

export default function StudyForm() {
  // Get context and data version updater
  const { t, incrementDataVersion } = useContext(SettingsContext);
  const currentT = t.value; // Access translations

  const [dateTime, setDateTime] = useState("");
  const [topic, setTopic] = useState("");
  const [duration, setDuration] = useState(""); // Store as string initially
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError(null);

    const durationMinutes = parseInt(duration, 10);

    if (!dateTime || !topic || !duration) {
      setError(currentT.errorFillAllStudyFields); // Use translation
      return;
    }
     if (isNaN(durationMinutes) || durationMinutes <= 0) {
        setError(currentT.errorPositiveDuration); // Reuse translation
        return;
    }

     const recordDate = new Date(dateTime);
     if (isNaN(recordDate.getTime())) {
        setError(currentT.errorInvalidDate); // Reuse translation
        return;
    }

    setIsLoading(true);

    const partialRecord: Omit<StudyRecord, "id" | "createdAt"> = {
      dateTime: recordDate.toISOString(),
      topic: topic.trim(),
      durationMinutes: durationMinutes,
      notes: notes || undefined,
    };

    try {
      // Pass incrementDataVersion as the callback
      const newId = await addStudyRecord(partialRecord, incrementDataVersion);
      console.log("New Study Record saved with ID:", newId);
      // Use translation for alert
      const alertMsg = currentT.alertStudyLogged
                         .replace("{topic}", topic)
                         .replace("{duration}", durationMinutes.toString());
      alert(alertMsg);

      // Clear form
      setDateTime("");
      setTopic("");
      setDuration("");
      setNotes("");
    } catch (err) {
      console.error("Failed to save study record:", err);
      const message = err instanceof Error ? err.message : String(err);
      setError(currentT.errorFailedToSave.replace("{message}", message)); // Reuse translation
    } finally {
      setIsLoading(false);
    }
  };

  const disabled = !IS_BROWSER || isLoading;

  return (
    <form onSubmit={handleSubmit} class="space-y-4 p-6 border rounded-lg shadow-md bg-white dark:bg-gray-800 max-w-md mx-auto">
      <h2 class="text-2xl font-semibold mb-4 text-center text-gray-800 dark:text-gray-200">{currentT.logStudyTitle}</h2> {/* Use translation */}
      {error && (
        <div class="text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 p-3 rounded-md text-sm">
          {/* Error message already translated */}
          {error}
        </div>
      )}
      <div>
        <label htmlFor="dateTime" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{currentT.labelDateTime}</label> {/* Reuse translation */}
        <input
          type="datetime-local"
          id="dateTime"
          name="dateTime"
          value={dateTime}
          onInput={(e) => setDateTime((e.target as HTMLInputElement).value)}
          disabled={disabled}
          required
          class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50"
        />
      </div>
       <div>
        <label htmlFor="topic" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{currentT.labelTopic}</label> {/* Use translation */}
        <input
          type="text"
          id="topic"
          name="topic"
          value={topic}
          onInput={(e) => setTopic((e.target as HTMLInputElement).value)}
          disabled={disabled}
          required
          placeholder={currentT.placeholderTopic} // Use translation
          class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50"
        />
      </div>
       <div>
        <label htmlFor="duration" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{currentT.labelDurationMinutes}</label> {/* Reuse translation */}
        <input
          type="number"
          id="duration"
          name="duration"
          value={duration}
          onInput={(e) => setDuration((e.target as HTMLInputElement).value)}
          disabled={disabled}
          required
          min="1"
          step="1"
          placeholder={currentT.placeholderDuration} // Reuse translation
          class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50"
        />
      </div>
       <div>
        <label htmlFor="notes" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{currentT.labelNotesOptional}</label> {/* Reuse translation */}
        <textarea
          id="notes"
          name="notes"
          rows={3}
          value={notes}
          onInput={(e) => setNotes((e.target as HTMLTextAreaElement).value)}
          disabled={disabled}
          class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50"
          placeholder={currentT.placeholderStudyNotes} // Use translation
        />
      </div>
      <Button type="submit" disabled={disabled} class="w-full">
        {isLoading ? currentT.buttonLogging : currentT.buttonLogStudy} {/* Use translation */}
      </Button>
    </form>
  );
}