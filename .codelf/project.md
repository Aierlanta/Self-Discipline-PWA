<attention>

## Development Guidelines

### Framework and Language
> Analyze the framework and language choices for this project, focusing on best practices and standardization.

**Framework Considerations:**
- Version Compatibility: Ensure all dependencies are compatible with the chosen framework version (Fresh, Preact)
- Feature Usage: Leverage framework-specific features (Islands, Routing, Server Components) rather than reinventing solutions
- Performance Patterns: Follow recommended patterns for optimal performance (Islands architecture, lazy loading)
- Upgrade Strategy: Plan for future framework updates with minimal disruption
- Importance Notes for Framework:
	* Fresh framework for Deno, utilizing Preact and Islands architecture. Focus on performance and modern web standards.

**Language Best Practices:**
- Type Safety: Use TypeScript for strong typing to prevent runtime errors.
- Modern Features: Utilize modern TypeScript/JavaScript features supported by Deno.
- Consistency: Apply consistent coding patterns throughout the codebase (e.g., Deno fmt).
- Documentation: Document complex logic, components, and APIs.

### Code Abstraction and Reusability
> During development, prioritize code abstraction and reusability to ensure modular and component-based functionality. Try to search for existing solutions before reinventing the wheel.
> List below the directory structure of common components, utility functions, and API encapsulations in the current project.


**Modular Design Principles:**
- Single Responsibility: Each module/component is responsible for only one functionality.
- High Cohesion, Low Coupling: Related functions are centralized, reducing dependencies between modules.
- Stable Interfaces: Expose stable interfaces externally while internal implementations can vary.

**Reusable Component Library:** (Actual Structure)
```
self-discipline-pwa/
- components/       # Reusable UI components (non-interactive)
  - Header.tsx      # Global Header component
  - icons/          # SVG icon components (e.g., LanguagesIcon.tsx)
- contexts/         # React Context providers (e.g., SettingsContext.tsx)
- islands/          # Interactive UI components (client-side JS), e.g., SettingsManager.tsx (used in Header)
- locales/          # Language resource files (e.g., en.json, zh.json)
- utils/            # Utility functions (to be created)
- services/         # Data services (e.g., db.ts)
- types/            # TypeScript type definitions (e.g., records.ts)
```

### Coding Standards and Tools
**Code Formatting Tools:**
- [Deno fmt](https://deno.land/manual@v1.x/tools/formatter) // Built-in Deno code formatter
- [Deno lint](https://deno.land/manual@v1.x/tools/linter) // Built-in Deno linter
- [Tailwind CSS]() // Atomic CSS framework (Configured with class-based dark mode)

**Naming and Structure Conventions:**
- Semantic Naming: Variable/function names should clearly express their purpose.
- Consistent Naming Style: TypeScript/JavaScript uses camelCase, CSS classes follow framework conventions (e.g., utility classes). File names use kebab-case or snake_case as per Fresh conventions.
- Directory Structure follows Fresh framework conventions and functional responsibility division (routes, islands, components, etc.).

### Frontend-Backend Collaboration Standards (Integrated in Fresh)
**API Design and Documentation:**
- Fresh API Routes: Use Fresh's built-in API routes (`routes/api/`).
- RESTful design principles: Use HTTP methods appropriately.
- Data Transfer: Use JSON for request/response bodies.
- Timely interface documentation updates: Document API endpoints, parameters, and responses using comments or potentially a dedicated tool later.
- Unified error handling specifications: Define consistent error response formats.

**Data Flow:**
- Clear frontend state management: Using Preact Signals (`@preact/signals`) managed within a global Context (`SettingsContext.tsx`) for theme and language state. State is persisted in localStorage via effects in the provider. Both page components (`routes/*.tsx`) and interactive Island components (`islands/*.tsx`) consume this context via `useContext` to access state (like theme) and computed values (like translations `t`).
- Data validation on both frontend (client-side islands) and backend (API routes).
- Standardized asynchronous operation handling: Use `fetch` API within islands or server components.

### Performance and Security
**Performance Optimization Focus:**
- Resource loading optimization: Leverage Fresh's Islands architecture for minimal client-side JS. Use code splitting implicitly via Islands.
- Rendering performance optimization: Server-side rendering by default, client-side hydration only for Islands.
- Appropriate use of caching: Implement Service Worker caching for PWA offline capabilities and static assets. Consider API response caching if applicable.

**Security Measures:**
- Input validation and filtering: Validate user inputs in API routes and potentially in Islands. Sanitize data before storing or displaying.
- Protection of sensitive information: Use secure methods for authentication (e.g., HTTPS, secure session/token handling). Avoid storing sensitive data client-side unless necessary and encrypted.
- Access control mechanisms: Implement checks in API routes to ensure users can only access their own data.

</attention>

<project>

## Self-Discipline PWA

> A Progressive Web Application (PWA) built with Deno and Fresh for tracking personal habits like sleep, exercise, and study.

> The main purpose is to provide a simple, modern, and customizable interface for users to log and visualize their self-discipline efforts through heatmaps and summaries.

> Project Status: Core features (sleep, exercise, study tracking with forms, lists, heatmaps) implemented. Global settings (language, theme) functional via Context API.

> Project Team: Roo (AI Engineer) and User

> Framework/language/other: Deno, Fresh (Web Framework), Preact (UI Library), TypeScript, Tailwind CSS (Styling), IndexedDB (Local Storage), Preact Signals (State Management), Preact Context (State Sharing)

## Dependencies (From deno.json - Note: Iconify dependencies can be removed)

*   `$fresh/`: "https://deno.land/x/fresh@1.7.3/" (Fresh framework core)
*   `preact`: "https://esm.sh/preact@10.22.0" (UI Library)
*   `preact/`: "https://esm.sh/preact@10.22.0/"
*   `@preact/signals`: "https://esm.sh/*@preact/signals@1.2.2" (State management - Used for theme/lang)
*   `@preact/signals-core`: "https://esm.sh/*@preact/signals-core@1.5.1" (State management core)
*   `tailwindcss`: "npm:tailwindcss@3.4.1" (Styling framework)
*   `tailwindcss/`: "npm:/tailwindcss@3.4.1/"
*   `tailwindcss/plugin`: "npm:/tailwindcss@3.4.1/plugin.js"
*   `@iconify/tailwind`: "npm:@iconify/tailwind" (Tailwind plugin for icons - **NO LONGER USED, CAN BE REMOVED**)
*   `@iconify-json/lucide`: "npm:@iconify-json/lucide" (Lucide icon set for Iconify - **NO LONGER USED, CAN BE REMOVED**)
*   `$std/`: "https://deno.land/std@0.216.0/" (Deno standard library)

## Development Environment

*   **Deno:** Latest stable version required. Installation instructions: [https://deno.land/manual/getting_started/installation](https://deno.land/manual/getting_started/installation)
*   **IDE:** VS Code with Deno extension recommended.
*   **Run Development Server:** `deno task start` (Starts the dev server on http://localhost:8000/)

## Structure (Current as of 2025-05-03)

```
self-discipline-pwa/
├── .gitignore          # Git ignore file
├── deno.json           # Deno configuration (tasks, import map, etc.)
├── dev.ts              # Development server entry point
├── fresh.config.ts     # Fresh framework configuration (Tailwind plugin)
├── fresh.gen.ts        # Auto-generated manifest (routes, islands)
├── main.ts             # Production server entry point
├── README.md           # Project README
├── tailwind.config.ts  # Tailwind CSS configuration (dark mode: class)
├── components/         # Reusable Preact components (non-Island)
│   ├── Button.tsx      # Basic button component
│   ├── Header.tsx      # Global Header component (now uses icons for navigation)
│   └── icons/          # Directory for SVG icon components
│       ├── ExerciseIcon.tsx
│       ├── HomeIcon.tsx
│       ├── LanguagesIcon.tsx
│       ├── MoonIcon.tsx
│       ├── SleepIcon.tsx
│       ├── StudyIcon.tsx
│       └── SunIcon.tsx
├── contexts/           # React Context providers
│   └── SettingsContext.tsx # Context for managing language and theme state
├── islands/            # Interactive Preact components (Islands)
│   ├── Counter.tsx     # Example counter (can be removed)
│   ├── ExerciseForm.tsx
│   ├── ExerciseHeatmapSection.tsx
│   ├── ExerciseList.tsx
│   ├── Heatmap.tsx     # Generic heatmap component
│   ├── SettingsManager.tsx # UI for language/theme switching (uses SettingsContext)
│   ├── SleepForm.tsx
│   ├── SleepHeatmapSection.tsx
│   ├── SleepList.tsx
│   ├── StudyForm.tsx
│   ├── StudyHeatmapSection.tsx
│   └── StudyList.tsx
├── locales/            # Internationalization (i18n) resource files
│   ├── en.json         # English translations
│   └── zh.json         # Chinese translations
├── routes/             # Page and API routes
│   ├── _404.tsx        # 404 page
│   ├── _app.tsx        # Main application shell (minimal, includes SettingsProvider wrapping Component)
│   ├── exercise.tsx    # Exercise page route (renders Header)
│   ├── index.tsx       # Home page route (Dashboard, renders Header)
│   ├── sleep.tsx       # Sleep page route (renders Header)
│   ├── study.tsx       # Study page route (renders Header)
│   ├── api/            # Backend API endpoints
│   │   └── joke.ts     # Example API route
│   └── greet/
│       └── [name].tsx  # Example dynamic route
├── services/           # Data interaction services
│   └── db.ts           # IndexedDB service functions
├── static/             # Static assets
│   ├── favicon.ico
│   ├── logo.svg        # (Can be removed if not used)
│   └── styles.css      # Main CSS file (includes Tailwind directives)
└── types/              # TypeScript type definitions
    └── records.ts      # Core data type interfaces
```

</project>