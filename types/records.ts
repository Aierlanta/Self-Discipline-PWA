/**
 * Represents a single sleep record.
 */
export interface SleepRecord {
  id: string; // Unique identifier (e.g., UUID or timestamp-based)
  sleepTime: string; // ISO 8601 timestamp string
  wakeTime: string; // ISO 8601 timestamp string
  durationMinutes: number; // Calculated duration in minutes
  notes?: string; // Optional notes
  createdAt: string; // ISO 8601 timestamp string when the record was created
}

/**
 * Represents a single exercise record.
 */
export interface ExerciseRecord {
  id: string;
  dateTime: string; // ISO 8601 timestamp string for when the exercise occurred
  activity: string; // Type of exercise (e.g., "Running", "Weightlifting", "Yoga")
  durationMinutes: number;
  notes?: string;
  createdAt: string;
}

/**
 * Represents a single study record.
 */
export interface StudyRecord {
  id: string;
  dateTime: string; // ISO 8601 timestamp string for when the study session occurred
  topic: string; // What was studied (e.g., "English Vocabulary", "Deno Basics")
  durationMinutes: number;
  notes?: string;
  createdAt: string;
}

// Maybe add a union type later if needed for generic handling
// export type AnyRecord = SleepRecord | ExerciseRecord | StudyRecord;