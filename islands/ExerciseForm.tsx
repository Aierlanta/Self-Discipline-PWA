import { useState } from "preact/hooks";
import { IS_BROWSER } from "$fresh/runtime.ts";
import type { ExerciseRecord } from "../types/records.ts";
import { Button } from "../components/Button.tsx";
import { addExerciseRecord } from "../services/db.ts";

export default function ExerciseForm() {
  const [dateTime, setDateTime] = useState("");
  const [activity, setActivity] = useState("");
  const [duration, setDuration] = useState(""); // Store as string initially
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError(null);

    const durationMinutes = parseInt(duration, 10);

    if (!dateTime || !activity || !duration) {
      setError("Please fill in date/time, activity, and duration.");
      return;
    }
    if (isNaN(durationMinutes) || durationMinutes <= 0) {
        setError("Duration must be a positive number of minutes.");
        return;
    }

     const recordDate = new Date(dateTime);
     if (isNaN(recordDate.getTime())) {
        setError("Invalid date format.");
        return;
    }


    setIsLoading(true);

    const partialRecord: Omit<ExerciseRecord, "id" | "createdAt"> = {
      dateTime: recordDate.toISOString(),
      activity: activity.trim(),
      durationMinutes: durationMinutes,
      notes: notes || undefined,
    };

    try {
      const newId = await addExerciseRecord(partialRecord);
      console.log("New Exercise Record saved with ID:", newId);
      alert(`Exercise logged: ${activity} for ${durationMinutes} minutes.`);

      // Clear form
      setDateTime("");
      setActivity("");
      setDuration("");
      setNotes("");
    } catch (err) {
      console.error("Failed to save exercise record:", err);
      setError(`Failed to save record: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const disabled = !IS_BROWSER || isLoading;

  return (
    <form onSubmit={handleSubmit} class="space-y-4 p-6 border rounded-lg shadow-md bg-white dark:bg-gray-800 max-w-md mx-auto">
      <h2 class="text-2xl font-semibold mb-4 text-center text-gray-800 dark:text-gray-200">Log Exercise</h2>
      {error && (
        <div class="text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 p-3 rounded-md text-sm">
          {error}
        </div>
      )}
      <div>
        <label htmlFor="dateTime" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date & Time:</label>
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
        <label htmlFor="activity" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Activity:</label>
        <input
          type="text"
          id="activity"
          name="activity"
          value={activity}
          onInput={(e) => setActivity((e.target as HTMLInputElement).value)}
          disabled={disabled}
          required
          placeholder="e.g., Running, Yoga, Weights"
          class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50"
        />
      </div>
       <div>
        <label htmlFor="duration" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration (minutes):</label>
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
          placeholder="e.g., 30"
          class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50"
        />
      </div>
       <div>
        <label htmlFor="notes" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes (Optional):</label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          value={notes}
          onInput={(e) => setNotes((e.target as HTMLTextAreaElement).value)}
          disabled={disabled}
          class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50"
          placeholder="Any details about the workout?"
        />
      </div>
      <Button type="submit" disabled={disabled} class="w-full">
        {isLoading ? "Logging..." : "Log Exercise"}
      </Button>
    </form>
  );
}