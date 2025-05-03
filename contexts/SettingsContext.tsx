import { createContext } from "preact";
import { StateUpdater, useEffect } from "preact/hooks";
import { signal, effect, computed, Signal } from "@preact/signals";
import { IS_BROWSER } from "$fresh/runtime.ts";
import en from "../locales/en.json" with { type: "json" };
import zh from "../locales/zh.json" with { type: "json" };

type Theme = "light" | "dark";
type Lang = "en" | "zh";

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
}

// --- Define Context Shape (Pass Signals + setters) ---
interface SettingsContextProps {
  lang: Signal<Lang>;
  theme: Signal<Theme>;
  t: Signal<Translations>;
  setLang: (lang: Lang) => void;
  setTheme: (theme: Theme) => void;
}

// --- Create Module-Level Signals ---
const langSignal = signal<Lang>("zh");
const themeSignal = signal<Theme>("light");
const translations: Record<Lang, Translations> = {
    en: en as Translations,
    zh: zh as Translations
};
const tSignal = computed<Translations>(() => translations[langSignal.value]);

// --- Functions to update module-level signals ---
const setLang = (newLang: Lang) => {
  langSignal.value = newLang;
};
const setTheme = (newTheme: Theme) => {
  themeSignal.value = newTheme;
};

// --- Effects for Persistence and Applying Side Effects (Run globally on client) ---
// These effects run whenever the module-level signals change, ensuring updates are applied.
if (IS_BROWSER) {
    effect(() => {
      const currentLang = langSignal.value; // Read value inside effect
      localStorage.setItem("lang", currentLang);
      document.documentElement.lang = currentLang;
      console.log("Global Effect: Language changed to:", currentLang);
    });

    effect(() => {
      const currentTheme = themeSignal.value; // Read value inside effect
      localStorage.setItem("theme", currentTheme);
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(currentTheme);
      console.log("Global Effect: Theme changed to:", currentTheme);
    });
}

// --- Create Context ---
export const SettingsContext = createContext<SettingsContextProps>({
  lang: langSignal,
  theme: themeSignal,
  t: tSignal,
  setLang: setLang,
  setTheme: setTheme,
});

// --- Create Provider Component ---
// Now primarily responsible for loading initial state on mount.
export function SettingsProvider({ children }: { children: preact.ComponentChildren }) {

  // --- Effect for loading initial state (Client-side only, runs once) ---
  useEffect(() => {
    if (!IS_BROWSER) return;

    // Load initial language
    const storedLang = localStorage.getItem("lang") as Lang | null;
    const browserLang = navigator.language.startsWith("zh") ? "zh" : "en";
    // Update the module-level signal (triggers the global effect above)
    langSignal.value = storedLang ?? browserLang;

    // Load initial theme
    const storedTheme = localStorage.getItem("theme") as Theme | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    // Update the module-level signal (triggers the global effect above)
    themeSignal.value = storedTheme ?? (prefersDark ? "dark" : "light");

    // No need to return cleanup for the global effects here
  }, []); // Run only once on mount

  // --- Provide context value (Pass module-level Signals + setters) ---
  // The value provided is stable references.
  const contextValue: SettingsContextProps = {
    lang: langSignal,
    theme: themeSignal,
    t: tSignal,
    setLang,
    setTheme,
  };

  // Provider just passes the stable context value down.
  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
}