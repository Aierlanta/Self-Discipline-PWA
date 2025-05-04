import { type PageProps } from "$fresh/server.ts";
import { SettingsProvider } from "../contexts/SettingsContext.tsx";
// Removed Header import
import SettingsManager from "../islands/SettingsManager.tsx"; // Keep Island for buttons

export default function App({ Component }: PageProps) {
  return (
    // Add lang attribute to html tag
    <html lang="en">
      <head>
        {/* Apply theme class via inline script before rendering */}
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>自律 PWA</title>

        {/* PWA Manifest Link */}
        <link rel="manifest" href="/manifest.json" />
        {/* Theme Color for PWA */}
        <meta name="theme-color" content="#673ab7" /> {/* Match manifest */}

        {/* Inline script to apply theme immediately */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme') || 'light';
                  // Apply 'dark' class directly to the <html> element
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {
                  console.error('Error applying theme from localStorage:', e);
                }
              })();
            `,
          }}
        />

        <link rel="stylesheet" href="/styles.css" />
      </head>
      {/* Body classes remain for base styling, dark mode is handled by html tag */}
      <body class="bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100 min-h-screen transition-colors duration-300 relative">
        <SettingsProvider>
          {/* SettingsManager remains positioned */}
          <div class="absolute top-3 right-4 z-20">
            <SettingsManager />
          </div>

          {/* Render the main page content */}
          <Component />
        </SettingsProvider>

        {/* Service Worker Registration Script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  // Register Service Worker from the root path
                  navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                      console.log('Service Worker registered: ', registration);
                    })
                    .catch(registrationError => {
                      console.log('Service Worker registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
