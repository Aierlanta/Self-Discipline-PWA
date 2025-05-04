# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Homepage Daily Summary Charts:** Introduced bar charts on the homepage (`routes/index.tsx`) to display daily summaries for sleep, exercise, and study over the last 7 days.
    - Created new Island component `islands/DailySummaryChart.tsx` to render the charts using SVG.
    - Added `getDailySummaries` function to `services/db.ts` to fetch aggregated daily data from IndexedDB.
    - Added necessary translations for chart titles and labels in `locales/en.json` and `locales/zh.json`.
    - Updated `Translations` interface in `contexts/SettingsContext.tsx`.
### Changed
- **Homepage Layout:** Refactored the homepage (`routes/index.tsx`) layout. Moved the `DailySummaryChart` components into their respective heatmap section components (`islands/*HeatmapSection.tsx`) to display them side-by-side with the heatmaps.