import { type PageProps } from "$fresh/server.ts";
import { SettingsProvider } from "../contexts/SettingsContext.tsx";
// Removed Header import
import SettingsManager from "../islands/SettingsManager.tsx"; // Keep Island for buttons

export default function App({ Component }: PageProps) {
  return (
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>自律 PWA</title>
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body class="bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100 min-h-screen transition-colors duration-300 relative">
        <SettingsProvider>
          {/* Header component is no longer rendered here */}

          {/* Render SettingsManager separately and position it */}
          <div class="absolute top-3 right-4 z-20">
            <SettingsManager />
          </div>

          {/* Render the main page content */}
          {/* Pages themselves will render the Header component now */}
          <Component />
        </SettingsProvider>
      </body>
    </html>
  );
}
