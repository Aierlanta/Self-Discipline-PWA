import { Head } from "$fresh/runtime.ts";
import { useContext } from "preact/hooks";
import { SettingsContext } from "../contexts/SettingsContext.tsx";
import { Header } from "../components/Header.tsx"; // Import the Header component
import PageTitle from "../islands/PageTitle.tsx"; // Import the new Island
import SleepHeatmapSection from "../islands/SleepHeatmapSection.tsx";
import ExerciseHeatmapSection from "../islands/ExerciseHeatmapSection.tsx";
import StudyHeatmapSection from "../islands/StudyHeatmapSection.tsx";

export default function Home() {
  // Get the translation signal 't' and 'lang' signal from context
  const { t, lang } = useContext(SettingsContext);
  // Read lang.value here to ensure dependency
  const currentLang = lang.value;
  // We will access t.value directly in JSX or get appName separately
  const appName = t.value.appName; // Get appName once
  console.log(`[routes/index.tsx] Rendering with lang: ${currentLang}`); // Simplified log

  return (
    <>
      <Head>
        {/* Access t.value directly here */}
        <title>{t.value.home} - {appName}</title>
      </Head>
      {/* Add Header component here */}
      <Header />
      {/* Adjust main content container if needed, e.g., remove top padding if header handles it */}
      <div class="container mx-auto p-4 mt-4 space-y-8"> {/* Main content container */}
        {/* Use the PageTitle Island */}
        <PageTitle titleKey="home" />
        <SleepHeatmapSection />
        <ExerciseHeatmapSection />
        <StudyHeatmapSection /> {/* Add Study heatmap */}
      </div>
    </>
  );
}
