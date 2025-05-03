import { useSignal, computed } from "@preact/signals"; // Restore computed
import { IS_BROWSER } from "$fresh/runtime.ts";
import { useRef, useContext, useEffect } from "preact/hooks";
import { SettingsContext } from "../contexts/SettingsContext.tsx";
import { LanguagesIcon } from "../components/icons/LanguagesIcon.tsx";
import { SunIcon } from "../components/icons/SunIcon.tsx";
import { MoonIcon } from "../components/icons/MoonIcon.tsx";

type Lang = "en" | "zh";

// --- Component ---
export default function SettingsManager() {
  // Get signals and setters from Context
  const { lang, theme, t, setLang, setTheme } = useContext(SettingsContext);

  const isLangMenuOpen = useSignal(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  // Access computed translations signal from context and read its value
  const currentT = t.value;
  // Compute dark mode based on the theme signal's value
  const isDark = computed(() => theme.value === 'dark'); // Use computed here

  // Determine button labels based on current translation values
  // Read signal values here for labels
  const langButtonLabel = currentT.switchLanguage;
  const themeButtonLabel = isDark.value ? currentT.toggleLightMode : currentT.toggleDarkMode;

  // --- Click outside handler for language menu ---
  useEffect(() => {
    if (!IS_BROWSER || !isLangMenuOpen.value) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && event.target instanceof Node && !langMenuRef.current.contains(event.target)) {
        isLangMenuOpen.value = false;
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isLangMenuOpen.value]);

  // --- Effect to potentially force re-evaluation on client mount ---
  useEffect(() => {
    if (IS_BROWSER) {
      // Forcefully re-set the theme using the current value from context.
      // This might help trigger effects if hydration caused issues.
      console.log("SettingsManager: Forcing theme update on mount with value:", theme.peek());
      setTheme(theme.value);
    }
  }, []); // Run only once on mount

  // --- Event Handlers ---
  const handleLangButtonClick = () => {
    isLangMenuOpen.value = !isLangMenuOpen.value;
  };

  const handleSelectLang = (newLang: Lang) => {
    setLang(newLang); // Call context setter (updates the signal in the provider)
    isLangMenuOpen.value = false;
  };

  const handleToggleTheme = () => {
    console.log("handleToggleTheme called. Current theme signal value:", theme.peek()); // Add log
    // Read the signal's value *inside* the handler before calling setter
    setTheme(theme.value === 'light' ? 'dark' : 'light');
    console.log("setTheme called. New theme should be:", theme.peek() === 'light' ? 'dark' : 'light'); // Add log
  };


  return (
    <div class="flex items-center space-x-2">
      {/* Language Button and Dropdown */}
      <div class="relative" ref={langMenuRef}>
        <button
          onClick={handleLangButtonClick}
          class="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          aria-haspopup="true"
          aria-expanded={isLangMenuOpen.value}
          aria-label={langButtonLabel} // Use computed label
          title={langButtonLabel} // Use computed label
        >
          <LanguagesIcon class="w-5 h-5" />
        </button>

        {/* Dropdown Menu */}
        {isLangMenuOpen.value && (
          <div class="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-700 rounded-md shadow-lg py-1 z-20">
            <button
              onClick={() => handleSelectLang("zh")}
              class={`block w-full text-left px-4 py-2 text-sm ${
                // Read lang signal value for comparison
                lang.value === 'zh' ? 'bg-blue-100 dark:bg-blue-600' : ''
              } text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600`}
            >
              中文
            </button>
            <button
              onClick={() => handleSelectLang("en")}
              class={`block w-full text-left px-4 py-2 text-sm ${
                // Read lang signal value for comparison
                lang.value === 'en' ? 'bg-blue-100 dark:bg-blue-600' : ''
              } text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600`}
            >
              English
            </button>
          </div>
        )}
      </div>

      {/* Theme Toggle Button */}
      <button
        onClick={handleToggleTheme}
        class="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
        aria-label={themeButtonLabel} // Use computed label
        title={themeButtonLabel} // Use computed label
      >
        {/* Conditionally render based on isDark computed signal's value */}
        {isDark.value
          ? <SunIcon class="w-5 h-5" />
          : <MoonIcon class="w-5 h-5" />}
      </button>
    </div>
  );
}

// No need for global exports anymore