import { useState, useEffect, useMemo, useContext } from "preact/hooks";
import { IS_BROWSER } from "$fresh/runtime.ts";
import { SettingsContext } from "../contexts/SettingsContext.tsx";
import type { SleepRecord } from "../types/records.ts";
import { getAllSleepRecords } from "../services/db.ts";
import Heatmap from "./Heatmap.tsx";
import DailySummaryChart from "./DailySummaryChart.tsx"; // Import the daily chart

// Define HeatmapDataPoint locally if not exported from Heatmap.tsx
interface HeatmapDataPoint {
  date: string; // YYYY-MM-DD
  value: number;
  tooltip?: string;
}

// Function to process sleep records into heatmap data
function processSleepDataForHeatmap(records: SleepRecord[], t: any): HeatmapDataPoint[] {
  const dataMap = new Map<string, number>(); // Date -> Total Duration Hours

  records.forEach(record => {
    try {
        // Extract date part (YYYY-MM-DD) from sleepTime
        const dateKey = record.sleepTime.substring(0, 10);
        const currentDuration = dataMap.get(dateKey) || 0;
        // Assuming durationMinutes is always present as per type definition
        const durationHours = record.durationMinutes / 60;
        dataMap.set(dateKey, currentDuration + durationHours); // Store hours directly
    } catch (e) {
        console.error("Error processing record date:", record.sleepTime, e);
    }
  });

  return Array.from(dataMap.entries()).map(([date, totalHours]) => {
    const hours = Math.round(totalHours * 10) / 10; // Round to 1 decimal place
    return {
      date: date,
      value: hours, // Use hours for the heatmap value
      tooltip: t.tooltipSleep
                 ? t.tooltipSleep.replace("{date}", date).replace("{hours}", hours.toString())
                 : `${date}: ${hours} hours sleep`, // Fallback
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
    if (hours < 4) return 0;
    if (hours < 6) return 1;
    if (hours < 7) return 2;
    if (hours < 9) return 3;
    return 4;
};


export default function SleepHeatmapSection() {
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
        const allRecords = await getAllSleepRecords();
        const filteredRecords = allRecords.filter(r => {
            try {
                const recordDate = new Date(r.sleepTime);
                return recordDate >= startDate && recordDate <= endDate;
            } catch { return false; }
        });
        const processedData = processSleepDataForHeatmap(filteredRecords, currentT);
        setHeatmapData(processedData);
      } catch (err) {
        console.error("Failed to fetch or process sleep data for heatmap:", err);
        const message = err instanceof Error ? err.message : String(err);
        setError(currentT.errorLoadHeatmap.replace("{message}", message));
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndProcessData();
  }, [startDate, endDate, currentT]);

  // Placeholder during SSR / initial client load
  if (!IS_BROWSER && isLoading) {
    return <div class="mt-8 p-6 border rounded-lg shadow-md bg-white dark:bg-gray-800 text-center">{currentT.loadingHeatmap}</div>;
  }

  return (
    // Main container for the section
    <div class="mt-8 p-4 md:p-6 border rounded-lg shadow-md bg-white dark:bg-gray-800 dark:border-gray-700">
       <h2 class="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">{currentT.sleep}</h2>
       {/* Container for charts, using flex for side-by-side layout on medium screens and up */}
       <div class="flex flex-col md:flex-row gap-4 md:gap-6 items-start">
          {/* Heatmap container */}
          <div class="flex-grow w-full"> {/* Removed overflow-x-auto */}
             <h3 class="text-lg font-medium mb-2 text-gray-700 dark:text-gray-300">{currentT.sleepHeatmapTitle}</h3>
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
                  colorSteps={SLEEP_COLORS}
                  valueToStep={sleepValueToStep}
                  class="mx-auto" // Keep centering if needed
                />
             )}
             {!isLoading && !error && heatmapData.length === 0 && (
                <p class="text-center text-gray-500 dark:text-gray-400 mt-4">{currentT.noDataHeatmap.replace("{dataType}", currentT.sleep)}</p>
             )}
          </div>

          {/* Daily Summary Chart container */}
          {/* Render DailySummaryChart only on the client */}
          {IS_BROWSER && (
            <div class="w-full md:w-auto md:flex-shrink-0 mt-4 md:mt-0"> {/* Add margin top for small screens */}
                <DailySummaryChart recordType="sleep" titleKey="home.charts.sleepTitle" days={7} />
            </div>
          )}
       </div>
    </div>
  );
}