import { Head } from "$fresh/runtime.ts";
import { useContext } from "preact/hooks";
import { SettingsContext } from "../contexts/SettingsContext.tsx";
import { Header } from "../components/Header.tsx"; // Import the Header component
import SleepHeatmapSection from "../islands/SleepHeatmapSection.tsx";
import ExerciseHeatmapSection from "../islands/ExerciseHeatmapSection.tsx";
import StudyHeatmapSection from "../islands/StudyHeatmapSection.tsx";

export default function Home() {
  // Get the translation signal 't' from context
  const { t } = useContext(SettingsContext);
  // Access the current translation object using .value
  const currentT = t.value;

  return (
    <>
      <Head>
        <title>{currentT.home} - {currentT.appName}</title>
      </Head>
      {/* Add Header component here */}
      <Header />
      {/* Adjust main content container if needed, e.g., remove top padding if header handles it */}
      <div class="container mx-auto p-4 mt-4 space-y-8"> {/* Main content container */}
        <h1 class="text-3xl font-bold text-center mb-6 text-gray-800 dark:text-gray-200">{currentT.home}</h1>
        <SleepHeatmapSection />
        <ExerciseHeatmapSection />
        <StudyHeatmapSection /> {/* Add Study heatmap */}
      </div>
    </>
  );
}
