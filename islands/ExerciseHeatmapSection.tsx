import { useState, useEffect, useMemo, useContext } from "preact/hooks"; // Added useContext
import { IS_BROWSER } from "$fresh/runtime.ts";
import { SettingsContext } from "../contexts/SettingsContext.tsx"; // Import context
import type { ExerciseRecord } from "../types/records.ts";
import { getAllExerciseRecords } from "../services/db.ts";
import Heatmap from "./Heatmap.tsx";

// Define HeatmapDataPoint locally if not exported from Heatmap.tsx
interface HeatmapDataPoint {
  date: string; // YYYY-MM-DD
  value: number; // Use 1 for exercised, 0 for not (or duration)
  tooltip?: string;
}

// Function to process exercise records into heatmap data
// Pass translation object 't' for tooltip formatting (optional)
function processExerciseDataForHeatmap(records: ExerciseRecord[], t: any): HeatmapDataPoint[] {
  const dataMap = new Map<string, { count: number; totalMinutes: number; activities: Set<string> }>(); // Date -> { count, totalMinutes, activities }

  records.forEach(record => {
    try {
        const dateKey = record.dateTime.substring(0, 10);
        const existing = dataMap.get(dateKey) || { count: 0, totalMinutes: 0, activities: new Set() };
        existing.count += 1;
        existing.totalMinutes += record.durationMinutes;
        existing.activities.add(record.activity);
        dataMap.set(dateKey, existing);
    } catch (e) {
        console.error("Error processing record date:", record.dateTime, e);
    }
  });

  return Array.from(dataMap.entries()).map(([date, data]) => {
    const activityList = Array.from(data.activities).join(', ');
    return {
      date: date,
      // Value: 1 if exercised, 0 otherwise. Could also use data.totalMinutes for intensity.
      value: data.totalMinutes > 0 ? 1 : 0,
      // Consider making tooltip translatable if needed, e.g., using a key like tooltipExercise
      tooltip: `${date}: Exercised (${data.totalMinutes} min - ${activityList})`,
    };
  });
}

// Define the color steps for exercise (simple yes/no)
const EXERCISE_COLORS: [string, string, string, string, string] = [
  "#ebedf0", // 0: No exercise
  "#40c463", // 1: Exercised (green)
  "#ebedf0", // 2: Not used
  "#ebedf0", // 3: Not used
  "#ebedf0", // 4: Not used
];

// Map exercise value (0 or 1) to color steps
const exerciseValueToStep = (value: number): 0 | 1 | 2 | 3 | 4 => {
    return value > 0 ? 1 : 0;
};


export default function ExerciseHeatmapSection() {
  // Get the translation signal 't' from context
  const { t } = useContext(SettingsContext);
  // Access the current translation object using .value
  const currentT = t.value;

  const [heatmapData, setHeatmapData] = useState<HeatmapDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Define the date range (reuse logic from SleepHeatmapSection or move to utils)
  const { startDate, endDate } = useMemo(() => {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - 3);
    start.setDate(1);
    return { startDate: start, endDate: end };
  }, []);


  useEffect(() => {
    if (!IS_BROWSER) return;

    const fetchAndProcessData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const allRecords = await getAllExerciseRecords();
        // Optional filtering by date range
         const filteredRecords = allRecords.filter(r => {
            try {
                const recordDate = new Date(r.dateTime);
                return recordDate >= startDate && recordDate <= endDate;
            } catch { return false; }
        });
        // Pass currentT to processing function (for potential tooltip translation)
        const processedData = processExerciseDataForHeatmap(filteredRecords, currentT);
        setHeatmapData(processedData);
      } catch (err) {
        console.error("Failed to fetch or process exercise data for heatmap:", err);
        const message = err instanceof Error ? err.message : String(err);
        setError(currentT.errorLoadHeatmap.replace("{message}", message)); // Reuse translation
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndProcessData();
  }, [startDate, endDate, currentT]); // Add currentT dependency

   // Reuse translated placeholder
  if (!IS_BROWSER && isLoading) {
   return <div class="mt-8 p-6 border rounded-lg shadow-md bg-white dark:bg-gray-800 text-center">{currentT.loadingHeatmap}</div>;
 }

 // Ensure the main return is present and correct
 return (
   <div class="mt-8 p-6 border rounded-lg shadow-md bg-white dark:bg-gray-800">
     {/* Reuse translated loading text */}
     {isLoading && <p class="text-center text-gray-500 dark:text-gray-400">{currentT.loadingHeatmapData}</p>}
     {error && (
        <div class="text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 p-3 rounded-md text-sm mb-4">
         {/* Error message already translated */}
         {error}
       </div>
     )}
     {!isLoading && !error && (
       <Heatmap
         data={heatmapData}
         startDate={startDate}
         endDate={endDate}
         colorSteps={EXERCISE_COLORS}
         valueToStep={exerciseValueToStep}
         title={currentT.exerciseHeatmapTitle} // Use translated title from currentT
         class="mx-auto"
       />
     )}
      {!isLoading && !error && heatmapData.length === 0 && (
        // Reuse translated "no data" message, replacing placeholder
        <p class="text-center text-gray-500 dark:text-gray-400 mt-4">{currentT.noDataHeatmap.replace("{dataType}", currentT.exercise)}</p>
     )}
   </div>
 );
}