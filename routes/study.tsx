import { Head } from "$fresh/runtime.ts";
import { useContext } from "preact/hooks"; // Import useContext
import { SettingsContext } from "../contexts/SettingsContext.tsx"; // Import context
import { Header } from "../components/Header.tsx"; // Import Header
import StudyForm from "../islands/StudyForm.tsx";
import StudyList from "../islands/StudyList.tsx";

export default function StudyPage() {
  const { t } = useContext(SettingsContext); // Get translation function
  const currentT = t.value; // Access translations

  return (
    <>
      <Head>
        {/* Use translated title */}
        <title>{currentT.record} {currentT.study} - {currentT.appName}</title>
      </Head>
      {/* Add Header */}
      <Header />
      {/* Main content container */}
      <div class="container mx-auto p-4 mt-4 flex flex-col items-center space-y-8">
        <h1 class="text-2xl font-semibold">{currentT.record} {currentT.study}</h1> {/* Added translated heading */}
        <StudyForm />
        <StudyList />
      </div>
    </>
  );
}