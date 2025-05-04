# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - 2025-05-04

### Added
- **Exercise Record Deletion:** Added functionality to delete individual exercise records from the history list (`islands/ExerciseList.tsx`).
    - Added `deleteExerciseRecord` function to `services/db.ts`.
    - Added delete button (trash icon) and confirmation logic to `islands/ExerciseList.tsx`.
    - Added necessary translations (`confirmDeleteExercise`, `errorFailedToDeleteExercise`) to `locales/en.json`, `locales/zh.json`, and updated `Translations` interface in `contexts/SettingsContext.tsx`.
- **Study Record Deletion:** Added functionality to delete individual study records from the history list (`islands/StudyList.tsx`).
    - Added `deleteStudyRecord` function to `services/db.ts`.
    - Added delete button (trash icon) and confirmation logic to `islands/StudyList.tsx`.
    - Added necessary translations (`confirmDeleteStudy`, `errorFailedToDeleteStudy`) to `locales/en.json`, `locales/zh.json`, and updated `Translations` interface in `contexts/SettingsContext.tsx`.
- **Sleep Record Deletion:** Added functionality to delete individual sleep records from the history list (`islands/SleepList.tsx`).
    - Added `deleteSleepRecord` function to `services/db.ts`.
    - Added delete button and confirmation logic to `islands/SleepList.tsx`.
    - Added necessary translations (`confirmDeleteSleep`, `errorFailedToDelete`, `deleteRecordTooltip`) to `locales/en.json`, `locales/zh.json`, and updated `Translations` interface in `contexts/SettingsContext.tsx`.
- **Homepage Daily Summary Charts:** Introduced bar charts on the homepage (`routes/index.tsx`) to display daily summaries for sleep, exercise, and study over the last 7 days.
    - Created new Island component `islands/DailySummaryChart.tsx` to render the charts using SVG.
    - Added `getDailySummaries` function to `services/db.ts` to fetch aggregated daily data from IndexedDB.
    - Added necessary translations for chart titles and labels in `locales/en.json` and `locales/zh.json`.
    - Updated `Translations` interface in `contexts/SettingsContext.tsx`.

### Changed
- **Delete Button Icon:** Replaced the 'X' delete button icon with an SVG trash can icon in `islands/SleepList.tsx`. (Exercise and Study lists implemented directly with the trash icon).
- **Homepage Layout:** Refactored the homepage (`routes/index.tsx`) layout. Moved the `DailySummaryChart` components into their respective heatmap section components (`islands/*HeatmapSection.tsx`) to display them side-by-side with the heatmaps.

### Fixed
- **Sleep Form Error Persistence:** Error messages in the sleep form (`islands/SleepForm.tsx`) now clear automatically when the user starts typing in any input field.