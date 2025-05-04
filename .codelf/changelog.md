# Changelog

## [Unreleased] - 2025-05-04

### Fixed
- Implemented internationalization (i18n) support within Island components (`SleepForm`, `SleepList`, `ExerciseForm`, `ExerciseList`, `StudyForm`, `StudyList`) using `SettingsContext`.
- Added necessary translation keys to `contexts/SettingsContext.tsx` and locale files (`locales/en.json`, `locales/zh.json`).
- Ensured language and theme settings apply globally across all pages and interactive components.

### Changed
- Updated `.codelf/project.md` to reflect i18n implementation in Island components.