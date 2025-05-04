import { useState, useEffect, useMemo, useContext } from "preact/hooks";
import { IS_BROWSER } from "$fresh/runtime.ts";
import { SettingsContext } from "../contexts/SettingsContext.tsx";
import type { StudyRecord } from "../types/records.ts";
import { getAllStudyRecords } from "../services/db.ts";
import Heatmap from "./Heatmap.tsx";
import DailySummaryChart from "./DailySummaryChart.tsx"; // Import the daily chart

// Define HeatmapDataPoint locally
interface HeatmapDataPoint {
  date: string; // YYYY-MM-DD
  value: number; // Use total duration in minutes for study
  tooltip?: string;
}

// Function to process study records into heatmap data
function processStudyDataForHeatmap(records: StudyRecord[], t: any): HeatmapDataPoint[] {
  const dataMap = new Map<string, { totalMinutes: number; topics: Set<string> }>(); // Date -> { totalMinutes, topics }

  records.forEach(record => {
    try {
        const dateKey = record.dateTime.substring(0, 10);
        const existing = dataMap.get(dateKey) || { totalMinutes: 0, topics: new Set() };
        existing.totalMinutes += record.durationMinutes;
        existing.topics.add(record.topic);
        dataMap.set(dateKey, existing);
    } catch (e) {
        console.error("Error processing record date:", record.dateTime, e);
    }
  });

  return Array.from(dataMap.entries()).map(([date, data]) => {
    const topicList = Array.from(data.topics).join(', ');
    return {
      date: date,
      value: data.totalMinutes, // Use total minutes for heatmap value
      // Consider making tooltip translatable
      tooltip: `${date}: Studied ${data.totalMinutes} min (${topicList})`,
    };
  });
}

// Define the color steps for study duration (example: 0, <30, 30-60, 60-120, 120+)
const STUDY_COLORS: [string, string, string, string, string] = [
  "#ebedf0", // 0 minutes (or no data)
  "#c7d2fe", // < 30 minutes (light indigo)
  "#a5b4fc", // 30-60 minutes (medium indigo)
  "#818cf8", // 60-120 minutes (dark indigo)
  "#6366f1", // 120+ minutes (darker indigo)
];

// Map study minutes to color steps
const studyValueToStep = (minutes: number): 0 | 1 | 2 | 3 | 4 => {
    if (minutes <= 0) return 0;
    if (minutes < 30) return 1;
    if (minutes < 60) return 2;
    if (minutes < 120) return 3;
    return 4;
};


export default function StudyHeatmapSection() {
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
        const allRecords = await getAllStudyRecords();
         const filteredRecords = allRecords.filter(r => {
            try {
                const recordDate = new Date(r.dateTime);
                return recordDate >= startDate && recordDate <= endDate;
            } catch { return false; }
        });
        const processedData = processStudyDataForHeatmap(filteredRecords, currentT);
        setHeatmapData(processedData);
      } catch (err) {
        console.error("Failed to fetch or process study data for heatmap:", err);
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
      <h2 class="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">{currentT.study}</h2>
      {/* Container for charts, using flex for side-by-side layout on medium screens and up */}
      <div class="flex flex-col md:flex-row gap-4 md:gap-6 items-start">
         {/* Heatmap container */}
         <div class="flex-grow w-full"> {/* Removed overflow-x-auto */}
            <h3 class="text-lg font-medium mb-2 text-gray-700 dark:text-gray-300">{currentT.studyHeatmapTitle}</h3>
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
                 colorSteps={STUDY_COLORS} // Use updated colors
                 valueToStep={studyValueToStep} // Use updated step function
                 class="mx-auto"
               />
            )}
            {!isLoading && !error && heatmapData.length === 0 && (
               <p class="text-center text-gray-500 dark:text-gray-400 mt-4">{currentT.noDataHeatmap.replace("{dataType}", currentT.study)}</p>
            )}
         </div>

         {/* Daily Summary Chart container */}
         {IS_BROWSER && (
           <div class="w-full md:w-auto md:flex-shrink-0 mt-4 md:mt-0">
               <DailySummaryChart recordType="study" titleKey="home.charts.studyTitle" days={7} />
           </div>
         )}
      </div>
   </div>
 );
}
