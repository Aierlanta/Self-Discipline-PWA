import { useContext } from "preact/hooks";
import { SettingsContext } from "../contexts/SettingsContext.tsx";
// Import navigation icons
import { HomeIcon } from "./icons/HomeIcon.tsx";
import { SleepIcon } from "./icons/SleepIcon.tsx";
import { ExerciseIcon } from "./icons/ExerciseIcon.tsx";
import { StudyIcon } from "./icons/StudyIcon.tsx";

export function Header() {
  const { t } = useContext(SettingsContext);
  const currentT = t.value;

  // Helper function to determine active link styling (optional, basic example)
  // A more robust solution might involve using Fresh's route matching utilities if available
  // or passing the current path as a prop.
  const getLinkClass = (path: string) => {
    // Basic check, might need refinement based on actual routing needs
    const baseClass = "p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700";
    // This simple check only works for exact matches.
    // Consider using a library or Fresh's utilities for more complex active states.
    // if (typeof window !== 'undefined' && window.location.pathname === path) {
    //   return `${baseClass} bg-gray-100 dark:bg-gray-600`; // Example active style
    // }
    return baseClass;
  };


  return (
    <header class="bg-white dark:bg-gray-800 shadow-md">
      <nav class="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Left side: App Title */}
        <a href="/" class="text-xl font-bold text-blue-600 dark:text-blue-400">{currentT.appName}</a>

        {/* Center: Navigation Icons */}
        <div class="flex space-x-2"> {/* Reduced spacing for icons */}
          <a href="/" class={getLinkClass("/")} title={currentT.home}>
            <HomeIcon class="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </a>
          <a href="/sleep" class={getLinkClass("/sleep")} title={currentT.sleep}>
            <SleepIcon class="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </a>
          <a href="/exercise" class={getLinkClass("/exercise")} title={currentT.exercise}>
            <ExerciseIcon class="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </a>
          <a href="/study" class={getLinkClass("/study")} title={currentT.study}>
            <StudyIcon class="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </a>
        </div>

        {/* Right side: Placeholder to balance flexbox */}
        {/* Adjust width to roughly match the settings icons area */}
        <div class="w-20"></div>
      </nav>
    </header>
  );
}