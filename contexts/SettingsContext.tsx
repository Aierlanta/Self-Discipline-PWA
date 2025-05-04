import { createContext } from "preact";
import { StateUpdater, useEffect } from "preact/hooks";
import { signal, effect, computed, Signal } from "@preact/signals";
import { IS_BROWSER } from "$fresh/runtime.ts";
import en from "../locales/en.json" with { type: "json" };
import zh from "../locales/zh.json" with { type: "json" };

type Theme = "light" | "dark";
type Lang = "en" | "zh";

// --- Function to get initial state from localStorage (Client-side only) ---
function getInitialLang(): Lang {
  if (!IS_BROWSER) return "zh"; // Default for SSR
  try {
    const storedLang = localStorage.getItem("lang") as Lang | null;
    console.log(`[SettingsContext Init] Read lang from localStorage: ${storedLang}`);
    const browserLang = navigator.language.startsWith("zh") ? "zh" : "en";
    return storedLang ?? browserLang;
  } catch (e) {
    console.error("[SettingsContext Init] Failed to read lang from localStorage:", e);
    return navigator.language.startsWith("zh") ? "zh" : "en"; // Fallback
  }
}

function getInitialTheme(): Theme {
  if (!IS_BROWSER) return "light"; // Default for SSR
  try {
    const storedTheme = localStorage.getItem("theme") as Theme | null;
    console.log(`[SettingsContext Init] Read theme from localStorage: ${storedTheme}`);
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    return storedTheme ?? (prefersDark ? "dark" : "light");
  } catch (e) {
    console.error("[SettingsContext Init] Failed to read theme from localStorage:", e);
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"; // Fallback
  }
}


// --- Explicitly define the Translations interface ---
interface Translations {
  appName: string;
  switchLanguage: string;
  switchTheme: string;
  toggleDarkMode: string;
  toggleLightMode: string;
  language: string;
  theme: string;
  sleep: string;
  exercise: string;
  study: string;
  home: string;
  record: string;
  viewData: string;
  sleepHeatmapTitle: string;
  exerciseHeatmapTitle: string;
  studyHeatmapTitle: string;
  // SleepForm keys
  logSleepTitle: string;
  labelSleepTime: string;
  labelWakeTime: string;
  labelNotesOptional: string;
  placeholderSleepNotes: string;
  buttonLogSleep: string;
  buttonLogging: string;
  errorEnterTimes: string;
  errorInvalidDate: string;
  errorWakeBeforeSleep: string;
  errorFailedToSave: string; // e.g., "Failed to save: {message}"
  alertSleepLogged: string;
  alertDuration: string; // e.g., "Duration: {hours}h {minutes}m"
  // SleepList keys
  durationNA: string; // For formatDuration helper
  invalidDate: string; // For formatDateTime helper
  errorFailedToLoad: string; // e.g., "Failed to load: {message}"
  ssrLoadingRecords: string; // Placeholder during SSR
  sleepHistoryTitle: string;
  loading: string;
  noSleepRecords: string;
  labelSleep: string; // In list item
  labelWake: string; // In list item
  labelNotes: string; // In list item
  // ExerciseForm keys
  errorFillAllFields: string;
  errorPositiveDuration: string;
  alertExerciseLogged: string; // e.g., "Exercise logged: {activity} for {duration} minutes."
  logExerciseTitle: string;
  labelDateTime: string;
  labelActivity: string;
  placeholderActivity: string;
  labelDurationMinutes: string;
  placeholderDuration: string;
  placeholderExerciseNotes: string;
  buttonLogExercise: string;
  // ExerciseList keys
  exerciseHistoryTitle: string;
  noExerciseRecords: string;
  // StudyForm keys
  errorFillAllStudyFields: string;
  alertStudyLogged: string; // e.g., "Study logged: {topic} for {duration} minutes."
  logStudyTitle: string;
  labelTopic: string;
  placeholderTopic: string;
  placeholderStudyNotes: string;
  buttonLogStudy: string;
  // StudyList keys
  studyHistoryTitle: string;
  noStudyRecords: string;
  // Heatmap Section keys
  loadingHeatmap: string;
  loadingHeatmapData: string;
  errorLoadHeatmap: string; // e.g., "Failed to load heatmap data: {message}"
  noDataHeatmap: string; // e.g., "No {dataType} data available for the selected period."
  tooltipSleep: string; // e.g., "{date}: {hours} hours sleep" (Optional)
  // Daily Summary Chart keys
  "home.charts.sleepTitle": string;
  "home.charts.exerciseTitle": string;
  "home.charts.studyTitle": string;
  "home.charts.lastDays": string; // e.g., "Last {count} days"
  "home.charts.loading": string;
  "home.charts.errorLoading": string;
  "home.charts.noData": string;
}

// --- Define Context Shape (Pass Signals + setters) ---
interface SettingsContextProps {
  lang: Signal<Lang>;
  theme: Signal<Theme>;
  t: Signal<Translations>;
  setLang: (lang: Lang) => void;
  setTheme: (theme: Theme) => void;
  // Re-add data version signal and updater
  dataVersion: Signal<number>;
  incrementDataVersion: () => void;
}

// --- Create Module-Level Signals with Initial Values from localStorage ---
const initialLang = getInitialLang();
const initialTheme = getInitialTheme();
console.log(`[SettingsContext Init] Initial Lang: ${initialLang}, Initial Theme: ${initialTheme}`);
const langSignal = signal<Lang>(initialLang);
const themeSignal = signal<Theme>(initialTheme);

const translations: Record<Lang, Translations> = {
    en: en as Translations,
    zh: zh as Translations
};
const tSignal = computed<Translations>(() => {
    console.log(`[SettingsContext] tSignal computed. langSignal is: ${langSignal.value}`);
    return translations[langSignal.value];
  });
  
  // --- Data Version Signal ---
  const dataVersionSignal = signal(0); // Initialize data version
  
  // --- Functions to update module-level signals ---
const setLang = (newLang: Lang) => {
  console.log(`[SettingsContext] setLang called with: ${newLang}. Current value: ${langSignal.peek()}`);
  if (newLang !== langSignal.peek()) {
      langSignal.value = newLang;
      console.log(`[SettingsContext] langSignal value after set: ${langSignal.peek()}`);
  } else {
      console.log(`[SettingsContext] setLang skipped, already ${newLang}`);
  }
};
const setTheme = (newTheme: Theme) => {
  console.log(`[SettingsContext] setTheme called with: ${newTheme}. Current value: ${themeSignal.peek()}`);
   if (newTheme !== themeSignal.peek()) {
      themeSignal.value = newTheme;
      console.log(`[SettingsContext] themeSignal value after set: ${themeSignal.peek()}`);
   } else {
       console.log(`[SettingsContext] setTheme skipped, already ${newTheme}`);
   }
};

// Re-add incrementDataVersion function
const incrementDataVersion = () => {
    dataVersionSignal.value++;
    console.log(`[SettingsContext] Data version incremented to: ${dataVersionSignal.value}`);
};

// --- Effects for Persistence and Applying Side Effects (Run globally on client) ---
// These effects run whenever the module-level signals change, ensuring updates are applied.
if (IS_BROWSER) {
    // Apply initial theme/lang to documentElement immediately on client load
    document.documentElement.lang = langSignal.peek();
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(themeSignal.peek());
    console.log(`[SettingsContext Init] Applied initial lang '${langSignal.peek()}' and theme '${themeSignal.peek()}' to documentElement.`);


    effect(() => {
      const currentLang = langSignal.value; // Read value inside effect
      console.log(`[SettingsContext] Language effect triggered. Value: ${currentLang}`);
      try {
        localStorage.setItem("lang", currentLang);
        console.log(`[SettingsContext] Saved lang '${currentLang}' to localStorage.`);
      } catch (e) {
        console.error("[SettingsContext] Failed to save lang to localStorage:", e);
      }
      document.documentElement.lang = currentLang;
    });

    effect(() => {
      const currentTheme = themeSignal.value; // Read value inside effect
      console.log(`[SettingsContext] Theme effect triggered. Value: ${currentTheme}`);
       try {
        localStorage.setItem("theme", currentTheme);
        console.log(`[SettingsContext] Saved theme '${currentTheme}' to localStorage.`);
      } catch (e) {
        console.error("[SettingsContext] Failed to save theme to localStorage:", e);
      }
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(currentTheme);
    });
}

// --- Create Context ---
export const SettingsContext = createContext<SettingsContextProps>({
  lang: langSignal,
  theme: themeSignal,
  t: tSignal,
  setLang: setLang,
  setTheme: setTheme,
  // Re-add dataVersion and incrementDataVersion
  dataVersion: dataVersionSignal,
  incrementDataVersion: incrementDataVersion,
});

// --- Create Provider Component ---
// Provider now just provides the context, initialization happens above.
export function SettingsProvider({ children }: { children: preact.ComponentChildren }) {
  console.log("[SettingsProvider] Rendering."); // Log provider render

  // No longer need useEffect for initial load here

  // --- Provide context value (Pass module-level Signals + setters) ---
  const contextValue: SettingsContextProps = {
    lang: langSignal,
    theme: themeSignal,
    t: tSignal,
    setLang,
    setTheme,
    // Re-add dataVersion and incrementDataVersion
    dataVersion: dataVersionSignal,
    incrementDataVersion,
  };

  // Provider just passes the stable context value down.
  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
}