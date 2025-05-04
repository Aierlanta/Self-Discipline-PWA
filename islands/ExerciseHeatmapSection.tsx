import { useState, useEffect, useMemo, useContext } from "preact/hooks";
import { IS_BROWSER } from "$fresh/runtime.ts";
import { SettingsContext } from "../contexts/SettingsContext.tsx";
import type { ExerciseRecord } from "../types/records.ts";
import { getAllExerciseRecords } from "../services/db.ts";
import Heatmap from "./Heatmap.tsx";
import DailySummaryChart from "./DailySummaryChart.tsx"; // Import the daily chart

// Define HeatmapDataPoint locally if not exported from Heatmap.tsx
interface HeatmapDataPoint {
  date: string; // YYYY-MM-DD
  value: number; // Use total duration in minutes for exercise
  tooltip?: string;
}

// Function to process exercise records into heatmap data
function processExerciseDataForHeatmap(records: ExerciseRecord[], t: any): HeatmapDataPoint[] {
  const dataMap = new Map<string, { totalMinutes: number; activities: Set<string> }>(); // Date -> { totalMinutes, activities }

  records.forEach(record => {
    try {
        const dateKey = record.dateTime.substring(0, 10);
        const existing = dataMap.get(dateKey) || { totalMinutes: 0, activities: new Set() };
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
      value: data.totalMinutes, // Use total minutes for heatmap value
      // Consider making tooltip translatable
      tooltip: `${date}: ${data.totalMinutes} min (${activityList})`,
    };
  });
}

// Define the color steps for exercise duration (example: 0, <30, 30-60, 60-90, 90+)
const EXERCISE_COLORS: [string, string, string, string, string] = [
  "#ebedf0", // 0 minutes (or no data)
  "#c6e48b", // < 30 minutes (light green)
  "#7bc96f", // 30-60 minutes (medium green)
  "#239a3b", // 60-90 minutes (dark green)
  "#196127", // 90+ minutes (darker green)
];

// Map exercise minutes to color steps
const exerciseValueToStep = (minutes: number): 0 | 1 | 2 | 3 | 4 => {
    if (minutes <= 0) return 0;
    if (minutes < 30) return 1;
    if (minutes < 60) return 2;
    if (minutes < 90) return 3;
    return 4;
};


export default function ExerciseHeatmapSection() {
  const { t } = useContext(SettingsContext);
  const currentT = t.value;

  const [heatmapData, setHeatmapData] = useState<HeatmapDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
         const filteredRecords = allRecords.filter(r => {
            try {
                const recordDate = new Date(r.dateTime);
                return recordDate >= startDate && recordDate <= endDate;
            } catch { return false; }
        });
        const processedData = processExerciseDataForHeatmap(filteredRecords, currentT);
        setHeatmapData(processedData);
      } catch (err) {
        console.error("Failed to fetch or process exercise data for heatmap:", err);
        const message = err instanceof Error ? err.message : String(err);
        setError(currentT.errorLoadHeatmap.replace("{message}", message));
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndProcessData();
  }, [startDate, endDate, currentT]);

   // Reuse translated placeholder
  if (!IS_BROWSER && isLoading) {
   return <div class="mt-8 p-6 border rounded-lg shadow-md bg-white dark:bg-gray-800 text-center">{currentT.loadingHeatmap}</div>;
 }

 return (
   // Main container for the section
   <div class="mt-8 p-4 md:p-6 border rounded-lg shadow-md bg-white dark:bg-gray-800 dark:border-gray-700">
      <h2 class="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">{currentT.exercise}</h2>
      {/* Container for charts, using flex for side-by-side layout on medium screens and up */}
      <div class="flex flex-col md:flex-row gap-4 md:gap-6 items-start">
         {/* Heatmap container */}
         <div class="flex-grow w-full"> {/* Removed overflow-x-auto */}
            <h3 class="text-lg font-medium mb-2 text-gray-700 dark:text-gray-300">{currentT.exerciseHeatmapTitle}</h3>
            {isLoading && <p class="text-center text-gray-500 dark:text-gray-400">{currentT.loadingHeatmapData}</p>}
            {error && (
               <div class="text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 p-3 rounded-md text-sm mb-4">
                 {error}
               </div>
            )}
            {!isLoading && !error && heatmapData.length > 0 && (
               <Heatmap
                 data={heatmapData}
                 startDate={startDate}
                 endDate={endDate}
                 colorSteps={EXERCISE_COLORS}
                 valueToStep={exerciseValueToStep}
                 class="mx-auto"
               />
            )}
            {!isLoading && !error && heatmapData.length === 0 && (
               <p class="text-center text-gray-500 dark:text-gray-400 mt-4">{currentT.noDataHeatmap.replace("{dataType}", currentT.exercise)}</p>
            )}
         </div>

         {/* Daily Summary Chart container */}
         {IS_BROWSER && (
           <div class="w-full md:w-auto md:flex-shrink-0 mt-4 md:mt-0">
               <DailySummaryChart recordType="exercise" titleKey="home.charts.exerciseTitle" days={7} />
           </div>
         )}
      </div>
   </div>
 );
}