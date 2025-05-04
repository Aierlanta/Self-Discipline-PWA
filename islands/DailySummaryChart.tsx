import { useEffect, useContext, useCallback } from "preact/hooks";
import { useSignal } from "@preact/signals";
import { IS_BROWSER } from "$fresh/runtime.ts";
// Import specific getAll functions instead of getDailySummaries
import { getAllSleepRecords, getAllExerciseRecords, getAllStudyRecords } from "../services/db.ts";
import type { DailySummary, RecordType, SleepRecord, ExerciseRecord, StudyRecord } from "../types/records.ts";
import { SettingsContext } from "../contexts/SettingsContext.tsx";

interface DailySummaryChartProps {
  recordType: RecordType;
  days?: number;
  titleKey: string;
}

// Helper function to get the start of a day (00:00:00)
function getStartOfDay(date: Date): Date {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    return start;
}

// Helper function to format date as YYYY-MM-DD
function formatDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

// Frontend data processing function
function processRecordsForDailySummary(
    records: (SleepRecord | ExerciseRecord | StudyRecord)[],
    recordType: RecordType,
    days: number
): DailySummary[] {
    const dailyTotals: Map<string, number> = new Map(); // YYYY-MM-DD -> total duration
    const endDate = getStartOfDay(new Date()); // Today 00:00:00
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - (days - 1)); // Start of N days ago

    console.log(`[processRecordsForDailySummary ${recordType}] Processing ${records.length} records from ${formatDateKey(startDate)} to ${formatDateKey(endDate)}`);

    // Initialize map for the last N days with 0 duration
    for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        const dateString = formatDateKey(date);
        dailyTotals.set(dateString, 0);
    }

    // Filter and aggregate records
    records.forEach(record => {
        let recordDate: Date | null = null;
        let duration = 0;
        let dateField: string | undefined;

        try {
            if (recordType === 'sleep' && 'sleepTime' in record) {
                // Use sleepTime (end time) to determine the date the sleep counts towards
                recordDate = new Date(record.sleepTime);
                duration = (record as SleepRecord).durationMinutes / 60; // Convert to hours for sleep
                dateField = 'sleepTime';
            } else if ((recordType === 'exercise' || recordType === 'study') && 'dateTime' in record) {
                recordDate = new Date(record.dateTime);
                duration = (record as ExerciseRecord | StudyRecord).durationMinutes; // Keep as minutes
                 dateField = 'dateTime';
            }

            if (recordDate && !isNaN(recordDate.getTime())) {
                 const recordStartOfDay = getStartOfDay(recordDate);
                 // Check if the record date is within the desired range
                 if (recordStartOfDay >= startDate && recordStartOfDay <= endDate) {
                    const dateKey = formatDateKey(recordStartOfDay);
                    const currentTotal = dailyTotals.get(dateKey) || 0;
                    dailyTotals.set(dateKey, currentTotal + duration);
                    // console.log(`[processRecordsForDailySummary ${recordType}] Added ${duration} to ${dateKey}. New total: ${dailyTotals.get(dateKey)}`);
                 } else {
                    // console.log(`[processRecordsForDailySummary ${recordType}] Record date ${formatDateKey(recordStartOfDay)} (${dateField}: ${record[dateField as keyof typeof record]}) outside range.`);
                 }
            } else {
                 console.warn(`[processRecordsForDailySummary ${recordType}] Invalid date found in record:`, record);
            }
        } catch (e) {
            console.error(`[processRecordsForDailySummary ${recordType}] Error processing record:`, record, e);
        }
    });

    // Convert map to array of DailySummary objects, sorted by date
    const summaries: DailySummary[] = Array.from(dailyTotals.entries())
      .map(([date, totalDuration]) => ({ date, totalDuration }))
      .sort((a, b) => a.date.localeCompare(b.date)); // Sort chronologically

    console.log(`[processRecordsForDailySummary ${recordType}] Resulting summaries:`, summaries);
    return summaries;
}


// --- BarChart Component (No changes needed here) ---
function BarChart({ data, recordType }: { data: DailySummary[], recordType: RecordType }) {
  const { lang } = useContext(SettingsContext);
  const width = 300;
  const height = 150;
  const padding = { top: 20, right: 10, bottom: 30, left: 35 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const maxValue = Math.max(...data.map(d => d.totalDuration), 1);
  const barWidth = chartWidth / data.length * 0.8;
  const barSpacing = chartWidth / data.length * 0.2;

  const yAxisLabels = [
    { value: 0, y: padding.top + chartHeight },
    { value: maxValue / 2, y: padding.top + chartHeight / 2 },
    { value: maxValue, y: padding.top },
  ];

  const unit = recordType === 'sleep' ? 'h' : 'min';

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString + 'T00:00:00');
      return date.toLocaleDateString(lang.value, { month: 'numeric', day: 'numeric' });
    } catch (e) {
      console.error("Error formatting date:", dateString, e);
      return dateString.substring(5);
    }
  };

  return (
    <svg width={width} height={height} class="bg-gray-100 dark:bg-gray-700 rounded-md shadow">
      {/* Y Axis Labels and Grid Lines */}
      {yAxisLabels.map(label => (
        <g key={label.value}>
          <text
            x={padding.left - 5}
            y={label.y + 4}
            text-anchor="end"
            class="text-xs fill-current text-gray-600 dark:text-gray-300"
          >
            {label.value === 0 ? 0 : label.value.toFixed(1)}{unit}
          </text>
          <line
            x1={padding.left}
            y1={label.y}
            x2={padding.left + chartWidth}
            y2={label.y}
            class="stroke-current text-gray-300 dark:text-gray-600"
            stroke-dasharray="2,2"
          />
        </g>
      ))}
      {/* Bars and X Axis Labels */}
      {data.map((d, i) => {
        const barHeight = (d.totalDuration / maxValue) * chartHeight;
        const x = padding.left + i * (barWidth + barSpacing) + barSpacing / 2;
        const y = padding.top + chartHeight - barHeight;
        return (
          <g key={d.date}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              class="fill-current text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              <title>{`${d.date}: ${d.totalDuration.toFixed(1)} ${unit}`}</title>
            </rect>
            <text
              x={x + barWidth / 2}
              y={padding.top + chartHeight + 15}
              text-anchor="middle"
              class="text-xs fill-current text-gray-600 dark:text-gray-300"
            >
              {formatDate(d.date)}
            </text>
          </g>
        );
      })}
       {/* X Axis Line */}
       <line
            x1={padding.left}
            y1={padding.top + chartHeight}
            x2={padding.left + chartWidth}
            y2={padding.top + chartHeight}
            class="stroke-current text-gray-400 dark:text-gray-500"
        />
    </svg>
  );
}


export default function DailySummaryChart({ recordType, days = 7, titleKey }: DailySummaryChartProps) {
  const { t, dataVersion } = useContext(SettingsContext); // Get dataVersion back
  const loading = useSignal(true);
  const error = useSignal<string | null>(null);
  const summaries = useSignal<DailySummary[]>([]);

  // Define fetchData using useCallback
  const fetchData = useCallback(async () => {
    console.log(`[DailySummaryChart ${recordType}] Fetching data...`);
    loading.value = true;
    error.value = null;
    try {
        let allRecords: (SleepRecord | ExerciseRecord | StudyRecord)[] = [];
        // Call the appropriate getAll* function based on recordType
        switch (recordType) {
            case 'sleep':
                allRecords = await getAllSleepRecords();
                break;
            case 'exercise':
                allRecords = await getAllExerciseRecords();
                break;
            case 'study':
                allRecords = await getAllStudyRecords();
                break;
        }
        // Process data on the client side
        const processedSummaries = processRecordsForDailySummary(allRecords, recordType, days);
        summaries.value = processedSummaries;

    } catch (err) {
      console.error(`Error fetching or processing ${recordType} records:`, err);
      error.value = t.value["home.charts.errorLoading"] || "Error loading data";
    } finally {
      loading.value = false;
    }
  }, [recordType, days, t]); // Dependencies for fetchData

  useEffect(() => {
    // Initial fetch and fetch on dataVersion change
    fetchData();
  // Dependencies: fetchData function reference and dataVersion value
  }, [fetchData, dataVersion.value]);

  return (
    <div class="mb-6 p-4 border rounded-lg shadow-sm bg-white dark:bg-gray-800 dark:border-gray-700">
       <h3 class="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
         {t.value[titleKey as keyof typeof t.value] || titleKey}
         ({(t.value['home.charts.lastDays'] || 'Last {count} days').replace('{count}', String(days))})
       </h3>
      {loading.value && <p class="text-gray-600 dark:text-gray-400">{t.value["home.charts.loading"] || "Loading..."}</p>}
      {error.value && <p class="text-red-600 dark:text-red-400">{error.value}</p>}
      {!loading.value && !error.value && summaries.value.length === 0 && (
        <p class="text-gray-600 dark:text-gray-400">{t.value["home.charts.noData"] || "No data available."}</p>
      )}
      {!loading.value && !error.value && summaries.value.length > 0 && (
        <BarChart data={summaries.value} recordType={recordType} />
      )}
    </div>
  );
}