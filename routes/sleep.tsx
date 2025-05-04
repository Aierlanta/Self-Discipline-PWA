import { Head } from "$fresh/runtime.ts";
import { useContext } from "preact/hooks"; // Import useContext
import { SettingsContext } from "../contexts/SettingsContext.tsx"; // Import context
import { Header } from "../components/Header.tsx"; // Import Header
import PageTitle from "../islands/PageTitle.tsx"; // Import the new Island
import SleepForm from "../islands/SleepForm.tsx";
import SleepList from "../islands/SleepList.tsx";

export default function SleepPage() {
  // Get the translation signal 't' and 'lang' signal from context
  const { t, lang } = useContext(SettingsContext); // Get translation function
  // Read lang.value here to ensure dependency
  const currentLang = lang.value;
  // We will access t.value directly in JSX or get appName separately
  const appName = t.value.appName; // Get appName once
  console.log(`[routes/sleep.tsx] Rendering with lang: ${currentLang}`); // Simplified log

  return (
    <>
      <Head>
        {/* Access t.value directly here */}
        <title>{t.value.record} {t.value.sleep} - {appName}</title>
      </Head>
      {/* Add Header */}
      <Header />
      {/* Main content container */}
      {/* Removed flex flex-col items-center to allow content to fill width */}
      <div class="container mx-auto p-4 mt-4 space-y-8">
         {/* Use the PageTitle Island with an array of keys */}
        <PageTitle titleKey={["record", "sleep"]} />
        <SleepForm />
        <SleepList />
      </div>
    </>
  );
}