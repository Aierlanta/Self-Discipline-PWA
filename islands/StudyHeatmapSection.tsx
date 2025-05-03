import { useState, useEffect, useMemo, useContext } from "preact/hooks"; // Added useContext
import { IS_BROWSER } from "$fresh/runtime.ts";
import { SettingsContext } from "../contexts/SettingsContext.tsx"; // Import context
import type { StudyRecord } from "../types/records.ts";
import { getAllStudyRecords } from "../services/db.ts";
import Heatmap from "./Heatmap.tsx";

// Define HeatmapDataPoint locally if not exported from Heatmap.tsx
interface HeatmapDataPoint {
  date: string; // YYYY-MM-DD
  value: number; // Use 1 for studied, 0 for not (or duration)
  tooltip?: string;
}

// Function to process study records into heatmap data
function processStudyDataForHeatmap(records: StudyRecord[]): HeatmapDataPoint[] {
  const dataMap = new Map<string, { count: number; totalMinutes: number; topics: Set<string> }>(); // Date -> { count, totalMinutes, topics }

  records.forEach(record => {
    try {
        const dateKey = record.dateTime.substring(0, 10);
        const existing = dataMap.get(dateKey) || { count: 0, totalMinutes: 0, topics: new Set() };
        existing.count += 1;
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
      // Value: 1 if studied, 0 otherwise. Could also use data.totalMinutes for intensity.
      value: data.totalMinutes > 0 ? 1 : 0,
      tooltip: `${date}: Studied (${data.totalMinutes} min - ${topicList})`,
    };
  });
}

// Define the color steps for study (simple yes/no)
const STUDY_COLORS: [string, string, string, string, string] = [
  "#ebedf0", // 0: No study
  "#a5b4fc", // 1: Studied (light blue/purple)
  "#ebedf0", // 2: Not used
  "#ebedf0", // 3: Not used
  "#ebedf0", // 4: Not used
];

// Map study value (0 or 1) to color steps
const studyValueToStep = (value: number): 0 | 1 | 2 | 3 | 4 => {
    return value > 0 ? 1 : 0;
};


export default function StudyHeatmapSection() {
  // Get the translation signal 't' from context
  const { t } = useContext(SettingsContext);
  // Access the current translation object using .value
  const currentT = t.value;

  const [heatmapData, setHeatmapData] = useState<HeatmapDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Define the date range (reuse logic or move to utils)
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
        // Optional filtering by date range
         const filteredRecords = allRecords.filter(r => {
            try {
                const recordDate = new Date(r.dateTime);
                return recordDate >= startDate && recordDate <= endDate;
            } catch { return false; }
        });
        const processedData = processStudyDataForHeatmap(filteredRecords);
        setHeatmapData(processedData);
      } catch (err) {
        console.error("Failed to fetch or process study data for heatmap:", err);
        setError(`Failed to load heatmap data: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndProcessData();
  }, [startDate, endDate]);

   if (!IS_BROWSER && isLoading) {
    return <div class="mt-8 p-6 border rounded-lg shadow-md bg-white dark:bg-gray-800 text-center">Loading Study Heatmap...</div>;
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
          colorSteps={STUDY_COLORS}
          valueToStep={studyValueToStep}
          title={currentT.studyHeatmapTitle} // Use translated title from currentT
          class="mx-auto"
        />
      )}
       {!isLoading && !error && heatmapData.length === 0 && (
         <p class="text-center text-gray-500 dark:text-gray-400 mt-4">No study data available for the selected period.</p> // Consider translating
      )}
    </div>
  );
}