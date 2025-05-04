import { useState, useMemo } from "preact/hooks";
import { IS_BROWSER } from "$fresh/runtime.ts";

// --- Configuration ---
const CELL_SIZE = 12; // Size of each day cell
const CELL_GAP = 3;   // Gap between cells
const WEEK_WIDTH = CELL_SIZE + CELL_GAP;
const MONTH_LABEL_HEIGHT = 20; // Space for month labels above

// --- Types ---
interface HeatmapDataPoint {
  date: string; // YYYY-MM-DD
  value: number; // The value to represent with color intensity
  tooltip?: string; // Optional custom tooltip text
}

interface HeatmapProps {
  data: HeatmapDataPoint[];
  startDate: Date;
  endDate: Date;
  // Basic color scale: 0 = light, 4 = dark (adjust as needed)
  colorSteps?: [string, string, string, string, string]; // e.g., ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39']
  // Function to determine the color step based on value
  valueToStep?: (value: number) => 0 | 1 | 2 | 3 | 4;
  class?: string; // Allow passing additional CSS classes
  title?: string; // Optional title for the heatmap
}

// --- Helper Functions ---

// Get the day of the week (0 for Sunday, 6 for Saturday)
function getDayOfWeek(date: Date): number {
  return date.getDay();
}

// Get the difference in days between two dates
function diffDays(date1: Date, date2: Date): number {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Get the start of the week (Sunday) for a given date
function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday, 6 = Saturday
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
}

// Format date as YYYY-MM-DD
function formatDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

// Default color steps (similar to GitHub)
const DEFAULT_COLORS: [string, string, string, string, string] = [
  "#ebedf0", // level 0 (no data or zero)
  "#9be9a8", // level 1
  "#40c463", // level 2
  "#30a14e", // level 3
  "#216e39", // level 4
];

// Default value mapping (example: maps duration in hours)
const defaultValueToStep = (value: number): 0 | 1 | 2 | 3 | 4 => {
    if (value <= 0) return 0;
    if (value < 4) return 1; // Less than 4 hours
    if (value < 7) return 2; // 4 to 7 hours
    if (value < 9) return 3; // 7 to 9 hours
    return 4; // 9+ hours
};


// --- Component ---

export default function Heatmap({
  data,
  startDate,
  endDate,
  colorSteps = DEFAULT_COLORS,
  valueToStep = defaultValueToStep,
  class: className = "",
  title = "Activity Heatmap",
}: HeatmapProps) {

  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);

  // Memoize processed data for performance
  const dataMap = useMemo(() => {
    const map = new Map<string, HeatmapDataPoint>();
    data.forEach(dp => map.set(dp.date, dp));
    return map;
  }, [data]);

  // Memoize calculations related to layout
  const { weeks, monthLabels, totalWidth, totalHeight } = useMemo(() => {
    const startDay = getStartOfWeek(startDate); // Align start to the beginning of a week
    const endDay = new Date(endDate);
    const numDays = diffDays(startDay, endDay) + 1; // Inclusive
    const numWeeks = Math.ceil(numDays / 7);

    const weeks = [];
    const monthLabels: { text: string; x: number }[] = [];
    let currentMonth = -1;

    for (let w = 0; w < numWeeks; w++) {
      const weekX = w * WEEK_WIDTH;
      let weekHasMonthLabel = false;

      for (let d = 0; d < 7; d++) {
        const dayIndex = w * 7 + d;
        const currentDate = new Date(startDay);
        currentDate.setDate(startDay.getDate() + dayIndex);

        // Stop if we go past the end date
        if (currentDate > endDay) break;
        // Skip days before the actual start date if start wasn't a Sunday
        if (currentDate < startDate) continue;


        const dateKey = formatDateKey(currentDate);
        const dataPoint = dataMap.get(dateKey);
        const value = dataPoint?.value ?? 0;
        const step = valueToStep(value);
        const color = colorSteps[step];
        const dayY = d * WEEK_WIDTH + MONTH_LABEL_HEIGHT;

        // Add month label if it's the start of a new month within the week
        const month = currentDate.getMonth();
        if (month !== currentMonth && !weekHasMonthLabel) {
             // Only add label if it's not the very first week starting mid-month sometimes
             if (w > 0 || currentDate.getDate() <= 7) {
                monthLabels.push({
                    text: currentDate.toLocaleString('default', { month: 'short' }),
                    x: weekX,
                });
                currentMonth = month;
                weekHasMonthLabel = true; // Ensure only one label per week column
             } else if (w === 0 && currentMonth === -1) {
                 // Handle case where the very first week starts mid-month
                 currentMonth = month;
             }
        }


        weeks.push({
          key: dateKey,
          x: weekX,
          y: dayY,
          fill: color,
          tooltip: dataPoint?.tooltip ?? `${dateKey}: ${value}`, // Default tooltip
        });
      }
    }

    const totalWidth = numWeeks * WEEK_WIDTH - CELL_GAP; // Adjust for last gap
    const totalHeight = 7 * WEEK_WIDTH - CELL_GAP + MONTH_LABEL_HEIGHT; // Adjust for last gap

    return { weeks, monthLabels, totalWidth, totalHeight };
  }, [startDate, endDate, dataMap, colorSteps, valueToStep]);


  // --- Event Handlers (only attach if IS_BROWSER) ---
  const handleMouseOver = IS_BROWSER ? (e: MouseEvent, week: typeof weeks[0]) => {
    // Use clientX/clientY relative to the viewport for positioning
    // The tooltip itself will be positioned absolutely within the relative parent div
    setTooltip({
      text: week.tooltip,
      x: e.clientX, // Use viewport X coordinate
      y: e.clientY, // Use viewport Y coordinate
    });
  } : undefined;

  const handleMouseOut = IS_BROWSER ? () => {
    setTooltip(null);
  } : undefined;


  // --- Render ---
  // Avoid rendering complex SVG during SSR if it relies heavily on client-side data/interaction
  // Or provide a simpler placeholder. Here we render it, but tooltips only work client-side.
  return (
    <div class={`relative ${className}`}>
       {title && <h3 class="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">{title}</h3>}
      <svg width={totalWidth} height={totalHeight} class="overflow-visible">
        <g>
          {/* Month Labels */}
          {monthLabels.map((label, i) => (
            <text
              key={`month-${i}`}
              x={label.x}
              y={MONTH_LABEL_HEIGHT - 8} // Position label above the cells
              class="text-xs fill-current text-gray-600 dark:text-gray-400"
            >
              {label.text}
            </text>
          ))}
        </g>
         <g>
           {/* Day Cells */}
          {weeks.map((week) => (
            <rect
              key={week.key}
              x={week.x}
              y={week.y}
              width={CELL_SIZE}
              height={CELL_SIZE}
              fill={week.fill}
              rx="2" // Rounded corners
              ry="2"
              class="cursor-pointer hover:opacity-80 transition-opacity"
              onMouseOver={handleMouseOver ? (e) => handleMouseOver(e, week) : undefined}
              onMouseOut={handleMouseOut}
            >
              {/* Basic SVG tooltip (limited styling) */}
              {/* <title>{week.tooltip}</title> */}
            </rect>
          ))}
        </g>
      </svg>

      {/* Custom HTML Tooltip (only rendered client-side) */}
      {IS_BROWSER && tooltip && (
        <div
          class="absolute z-10 px-2 py-1 text-xs text-white bg-gray-900 dark:bg-gray-700 rounded shadow-lg pointer-events-none"
          // Position fixed relative to viewport, near the cursor
          style={{
            left: `${tooltip.x + 10}px`, // Offset slightly from cursor
            top: `${tooltip.y - 20}px`, // Offset slightly above cursor
            position: 'fixed', // Use fixed positioning relative to viewport
            // transform: 'translateX(-50%) translateY(-100%)', // Remove transform for simpler fixed positioning
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}