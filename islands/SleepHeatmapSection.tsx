import { useState, useEffect, useMemo, useContext } from "preact/hooks"; // Added useContext
import { IS_BROWSER } from "$fresh/runtime.ts";
import { SettingsContext } from "../contexts/SettingsContext.tsx"; // Import context
import type { SleepRecord } from "../types/records.ts";
import { getAllSleepRecords } from "../services/db.ts";
import Heatmap from "./Heatmap.tsx"; // Assuming HeatmapDataPoint is defined within Heatmap.tsx for now

// Define HeatmapDataPoint locally if not exported from Heatmap.tsx
interface HeatmapDataPoint {
  date: string; // YYYY-MM-DD
  value: number;
  tooltip?: string;
}

// Function to process sleep records into heatmap data
function processSleepDataForHeatmap(records: SleepRecord[]): HeatmapDataPoint[] {
  const dataMap = new Map<string, number>(); // Date -> Total Duration Minutes

  records.forEach(record => {
    try {
        // Extract date part (YYYY-MM-DD) from sleepTime
        const dateKey = record.sleepTime.substring(0, 10);
        const currentDuration = dataMap.get(dateKey) || 0;
        dataMap.set(dateKey, currentDuration + record.durationMinutes);
    } catch (e) {
        console.error("Error processing record date:", record.sleepTime, e);
    }
  });

  return Array.from(dataMap.entries()).map(([date, totalMinutes]) => {
    const hours = Math.round(totalMinutes / 60 * 10) / 10; // Duration in hours (1 decimal place)
    return {
      date: date,
      value: hours, // Use hours for the heatmap value
      tooltip: `${date}: ${hours} hours sleep`, // Tooltip can remain in English or be translated later if needed
    };
  });
}

// Define the color steps for sleep duration (example)
const SLEEP_COLORS: [string, string, string, string, string] = [
  "#ebedf0", // < 4 hours (or no data)
  "#fad0c4", // 4-6 hours (light orange)
  "#ff9a9e", // 6-7 hours (light red/pink)
  "#9be9a8", // 7-9 hours (green - target)
  "#40c463", // 9+ hours (darker green)
];

// Map sleep hours to color steps
const sleepValueToStep = (hours: number): 0 | 1 | 2 | 3 | 4 => {
    if (hours <= 0) return 0;
    if (hours < 4) return 0; // Or maybe 1 if you want to show very short sleep
    if (hours < 6) return 1;
    if (hours < 7) return 2;
    if (hours < 9) return 3;
    return 4;
};


export default function SleepHeatmapSection() {
  // Get the translation signal 't' from context
  const { t } = useContext(SettingsContext);
  // Access the current translation object using .value
  const currentT = t.value;

  const [heatmapData, setHeatmapData] = useState<HeatmapDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Define the date range for the heatmap (e.g., last 3 months)
  const { startDate, endDate } = useMemo(() => {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - 3); // Go back 3 months
    start.setDate(1); // Start from the beginning of that month for cleaner look
    return { startDate: start, endDate: end };
  }, []);


  useEffect(() => {
    if (!IS_BROWSER) return;

    const fetchAndProcessData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const allRecords = await getAllSleepRecords();
        // Filter records within the date range (optional, but good for performance if many records)
        const filteredRecords = allRecords.filter(r => {
            try {
                const recordDate = new Date(r.sleepTime);
                return recordDate >= startDate && recordDate <= endDate;
            } catch { return false; }
        });
        const processedData = processSleepDataForHeatmap(filteredRecords);
        setHeatmapData(processedData);
      } catch (err) {
        console.error("Failed to fetch or process sleep data for heatmap:", err);
        setError(`Failed to load heatmap data: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndProcessData();
  }, [startDate, endDate]); // Re-fetch if date range changes (though it's static here)

  if (!IS_BROWSER && isLoading) {
     // Placeholder during SSR / initial client load
    return <div class="mt-8 p-6 border rounded-lg shadow-md bg-white dark:bg-gray-800 text-center">Loading Sleep Heatmap...</div>;
  }

  return (
    <div class="mt-8 p-6 border rounded-lg shadow-md bg-white dark:bg-gray-800">
      {isLoading && <p class="text-center text-gray-500 dark:text-gray-400">Loading heatmap data...</p>}
      {error && (
         <div class="text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 p-3 rounded-md text-sm mb-4">
          {error}
        </div>
      )}
      {!isLoading && !error && (
        <Heatmap
          data={heatmapData}
          startDate={startDate}
          endDate={endDate}
          colorSteps={SLEEP_COLORS}
          valueToStep={sleepValueToStep}
          title={currentT.sleepHeatmapTitle} // Use translated title from currentT
          class="mx-auto" // Center the heatmap SVG if container is wider
        />
      )}
       {!isLoading && !error && heatmapData.length === 0 && (
         <p class="text-center text-gray-500 dark:text-gray-400 mt-4">No sleep data available for the selected period.</p> // Consider translating this too
      )}
    </div>
  );
}