import type {
  SleepRecord,
  ExerciseRecord,
  StudyRecord,
  RecordType,
  DailySummary,
} from "../types/records.ts";

const DB_NAME = "SelfDisciplineDB";
const DB_VERSION = 1;
const SLEEP_STORE = "sleepRecords";
const EXERCISE_STORE = "exerciseRecords";
const STUDY_STORE = "studyRecords";

let dbPromise: Promise<IDBDatabase> | null = null;

function getDb(): Promise<IDBDatabase> {
  if (typeof indexedDB === 'undefined') {
    return Promise.reject(new Error("IndexedDB is not supported in this environment."));
  }
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = (event) => {
        console.error("Database error:", request.error);
        reject(new Error(`Database error: ${request.error?.message}`));
      };

      request.onsuccess = (event) => {
        console.log("Database opened successfully");
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        console.log("Database upgrade needed");
        const db = request.result;

        if (!db.objectStoreNames.contains(SLEEP_STORE)) {
          console.log(`Creating ${SLEEP_STORE} object store`);
          // Use 'id' as the key path and make it auto-incrementing for simplicity now,
          // or generate UUIDs in the form component before saving. Let's use UUIDs later.
          // For now, let's assume ID is provided.
           const store = db.createObjectStore(SLEEP_STORE, { keyPath: "id" });
           // Add indexes if needed later, e.g., for sorting by date
           store.createIndex("createdAt", "createdAt", { unique: false });
           store.createIndex("sleepTime", "sleepTime", { unique: false });
        }
        if (!db.objectStoreNames.contains(EXERCISE_STORE)) {
           console.log(`Creating ${EXERCISE_STORE} object store`);
           const store = db.createObjectStore(EXERCISE_STORE, { keyPath: "id" });
           store.createIndex("createdAt", "createdAt", { unique: false });
           store.createIndex("dateTime", "dateTime", { unique: false });
        }
         if (!db.objectStoreNames.contains(STUDY_STORE)) {
           console.log(`Creating ${STUDY_STORE} object store`);
           const store = db.createObjectStore(STUDY_STORE, { keyPath: "id" });
           store.createIndex("createdAt", "createdAt", { unique: false });
           store.createIndex("dateTime", "dateTime", { unique: false });
        }
        console.log("Database upgrade complete");
      };
    });
  }
  return dbPromise;
}

// --- Sleep Records ---

export async function addSleepRecord(
  record: Omit<SleepRecord, "id" | "createdAt">,
  onSuccessCallback?: () => void // Re-add optional callback
): Promise<string> {
  const db = await getDb();
  const transaction = db.transaction(SLEEP_STORE, "readwrite");
  const store = transaction.objectStore(SLEEP_STORE);
  const id = crypto.randomUUID(); // Generate UUID for the record
  const fullRecord: SleepRecord = {
      ...record,
      id: id,
      createdAt: new Date().toISOString(),
  };

  return new Promise((resolve, reject) => {
    const request = store.add(fullRecord);
    request.onsuccess = () => resolve(id); // Return the generated ID
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => {
      console.log(`Sleep record ${id} added. Transaction complete.`);
      // Call the callback if provided
      if (onSuccessCallback) {
        console.log("Calling onSuccessCallback for addSleepRecord.");
        onSuccessCallback();
      }
    };
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function getAllSleepRecords(): Promise<SleepRecord[]> {
    const db = await getDb();
    const transaction = db.transaction(SLEEP_STORE, "readonly");
    const store = transaction.objectStore(SLEEP_STORE);
    // Sort by creation date, newest first
    const index = store.index("createdAt");

    return new Promise((resolve, reject) => {
        // getAll() is simpler but might not be supported everywhere or efficient for large datasets
        // const request = store.getAll();
        // Using a cursor for better compatibility and potential performance
        const records: SleepRecord[] = [];
        const request = index.openCursor(null, "prev"); // Use index to sort

        request.onsuccess = (event) => {
            const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
            if (cursor) {
                records.push(cursor.value);
                cursor.continue();
            } else {
                resolve(records);
            }
        };
        request.onerror = () => reject(request.error);
        transaction.onerror = () => reject(transaction.error);
    });
}

export async function deleteSleepRecord(
  id: string,
  onSuccessCallback?: () => void
): Promise<void> {
  const db = await getDb();
  const transaction = db.transaction(SLEEP_STORE, "readwrite");
  const store = transaction.objectStore(SLEEP_STORE);

  return new Promise((resolve, reject) => {
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => {
      console.log(`Sleep record ${id} deleted. Transaction complete.`);
      if (onSuccessCallback) {
        console.log("Calling onSuccessCallback for deleteSleepRecord.");
        onSuccessCallback();
      }
    };
    transaction.onerror = () => reject(transaction.error);
  });
}
// --- Exercise Records ---

export async function addExerciseRecord(
  record: Omit<ExerciseRecord, "id" | "createdAt">,
  onSuccessCallback?: () => void // Re-add optional callback
): Promise<string> {
  const db = await getDb();
  const transaction = db.transaction(EXERCISE_STORE, "readwrite");
  const store = transaction.objectStore(EXERCISE_STORE);
  const id = crypto.randomUUID();
  const fullRecord: ExerciseRecord = {
      ...record,
      id: id,
      createdAt: new Date().toISOString(),
  };

  return new Promise((resolve, reject) => {
    const request = store.add(fullRecord);
    request.onsuccess = () => resolve(id);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => {
      console.log(`Exercise record ${id} added. Transaction complete.`);
      // Call the callback if provided
      if (onSuccessCallback) {
        console.log("Calling onSuccessCallback for addExerciseRecord.");
        onSuccessCallback();
      }
    };
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function getAllExerciseRecords(): Promise<ExerciseRecord[]> {
    const db = await getDb();
    const transaction = db.transaction(EXERCISE_STORE, "readonly");
    const store = transaction.objectStore(EXERCISE_STORE);
    const index = store.index("createdAt"); // Sort by creation date

    return new Promise((resolve, reject) => {
        const records: ExerciseRecord[] = [];
        // Use index cursor for sorting (newest first)
        const request = index.openCursor(null, "prev");

        request.onsuccess = (event) => {
            const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
            if (cursor) {
                records.push(cursor.value);
                cursor.continue();
            } else {
                resolve(records);
            }
        };
        request.onerror = () => reject(request.error);
        transaction.onerror = () => reject(transaction.error);
    });
}

export async function deleteExerciseRecord(
  id: string,
  onSuccessCallback?: () => void
): Promise<void> {
  const db = await getDb();
  const transaction = db.transaction(EXERCISE_STORE, "readwrite");
  const store = transaction.objectStore(EXERCISE_STORE);

  return new Promise((resolve, reject) => {
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => {
      console.log(`Exercise record ${id} deleted. Transaction complete.`);
      if (onSuccessCallback) {
        console.log("Calling onSuccessCallback for deleteExerciseRecord.");
        onSuccessCallback();
      }
    };
    transaction.onerror = () => reject(transaction.error);
  });
}
// --- Study Records ---

export async function addStudyRecord(
  record: Omit<StudyRecord, "id" | "createdAt">,
  onSuccessCallback?: () => void // Re-add optional callback
): Promise<string> {
  const db = await getDb();
  const transaction = db.transaction(STUDY_STORE, "readwrite");
  const store = transaction.objectStore(STUDY_STORE);
  const id = crypto.randomUUID();
  const fullRecord: StudyRecord = {
      ...record,
      id: id,
      createdAt: new Date().toISOString(),
  };

  return new Promise((resolve, reject) => {
    const request = store.add(fullRecord);
    request.onsuccess = () => resolve(id);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => {
      console.log(`Study record ${id} added. Transaction complete.`);
      // Call the callback if provided
      if (onSuccessCallback) {
        console.log("Calling onSuccessCallback for addStudyRecord.");
        onSuccessCallback();
      }
    };
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function getAllStudyRecords(): Promise<StudyRecord[]> {
    const db = await getDb();
    const transaction = db.transaction(STUDY_STORE, "readonly");
    const store = transaction.objectStore(STUDY_STORE);
    const index = store.index("createdAt"); // Sort by creation date

    return new Promise((resolve, reject) => {
        const records: StudyRecord[] = [];
        // Use index cursor for sorting (newest first)
        const request = index.openCursor(null, "prev");

        request.onsuccess = (event) => {
            const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
            if (cursor) {
                records.push(cursor.value);
                cursor.continue();
            } else {
                resolve(records);
            }
        };
        request.onerror = () => reject(request.error);
        transaction.onerror = () => reject(transaction.error);
    });
}
export async function deleteStudyRecord(
  id: string,
  onSuccessCallback?: () => void
): Promise<void> {
  const db = await getDb();
  const transaction = db.transaction(STUDY_STORE, "readwrite");
  const store = transaction.objectStore(STUDY_STORE);

  return new Promise((resolve, reject) => {
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => {
      console.log(`Study record ${id} deleted. Transaction complete.`);
      if (onSuccessCallback) {
        console.log("Calling onSuccessCallback for deleteStudyRecord.");
        onSuccessCallback();
      }
    };
    transaction.onerror = () => reject(transaction.error);
  });
}
// --- Daily Summaries ---

/**
 * Fetches aggregated daily summaries for a given record type over the specified number of days.
 * @param recordType The type of record ('sleep', 'exercise', 'study').
 * @param days The number of past days to include (default: 7).
 * @returns A promise that resolves to an array of DailySummary objects, sorted by date.
 */
export async function getDailySummaries(
  recordType: RecordType,
  days: number = 7,
): Promise<DailySummary[]> {
  const db = await getDb();
  let storeName: string;
  let dateIndexName: string;
  let durationField: string;
  // let durationUnitMultiplier = 1; // Use this if converting all to minutes

  switch (recordType) {
    case "sleep":
      storeName = SLEEP_STORE;
      // Use the 'sleepTime' index for querying sleep records by date.
      dateIndexName = "sleepTime";
      durationField = "durationHours";
      // durationUnitMultiplier = 60; // If converting sleep hours to minutes
      break;
    case "exercise":
      storeName = EXERCISE_STORE;
      dateIndexName = "dateTime"; // Use the specific dateTime index
      durationField = "durationMinutes";
      break;
    case "study":
      storeName = STUDY_STORE;
      dateIndexName = "dateTime"; // Use the specific dateTime index
      durationField = "durationMinutes";
      break;
    default:
      // Handle invalid record type
      console.error(`Invalid record type provided to getDailySummaries: ${recordType}`);
      return Promise.reject(new Error(`Invalid record type: ${recordType}`));
  }

  const transaction = db.transaction(storeName, "readonly");
  const store = transaction.objectStore(storeName);
  const index = store.index(dateIndexName); // Use the date-specific index

  // Calculate date range (Today back to N-1 days ago)
  const endDate = new Date(); // Today
  endDate.setHours(23, 59, 59, 999); // End of today
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - (days - 1));
  startDate.setHours(0, 0, 0, 0); // Start of N days ago

  // Format dates for range query (assuming index stores ISO strings)
  const lowerBound = startDate.toISOString();
  const upperBound = endDate.toISOString();
  const range = IDBKeyRange.bound(lowerBound, upperBound);

  return new Promise((resolve, reject) => {
    const dailyTotals: Map<string, number> = new Map(); // YYYY-MM-DD -> total duration

    // Initialize map for the last N days with 0 duration
    for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
        dailyTotals.set(dateString, 0);
    }

    const request = index.openCursor(range); // Use the date index and range

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor) {
        const record = cursor.value as SleepRecord | ExerciseRecord | StudyRecord;
        // Extract date part (YYYY-MM-DD) from the record's date field
        let recordDateStr = "";
        // Use the indexed field for date extraction
        const dateValue = (record as any)[dateIndexName];
        if (typeof dateValue === 'string' && dateValue.includes('T')) {
            recordDateStr = dateValue.split('T')[0];
        } else if (dateValue instanceof Date) {
            recordDateStr = dateValue.toISOString().split('T')[0];
        }


        if (recordDateStr && dailyTotals.has(recordDateStr)) {
          const duration = (record as any)[durationField] || 0;
          const currentTotal = dailyTotals.get(recordDateStr) || 0;
          // Use original units (hours for sleep, minutes for others)
          dailyTotals.set(recordDateStr, currentTotal + duration);
        }
        cursor.continue();
      } else {
        // Convert map to array of DailySummary objects, sorted by date
        const summaries: DailySummary[] = Array.from(dailyTotals.entries())
          .map(([date, totalDuration]) => ({ date, totalDuration }))
          .sort((a, b) => a.date.localeCompare(b.date)); // Sort chronologically
        resolve(summaries);
      }
    };

    request.onerror = () => {
        console.error(`Error fetching daily summaries for ${recordType}:`, request.error);
        reject(request.error);
    };
    transaction.onerror = () => {
        console.error(`Transaction error fetching daily summaries for ${recordType}:`, transaction.error);
        reject(transaction.error);
    };
    transaction.oncomplete = () => {
        // Optional: console.log(`Transaction complete for fetching daily summaries (${recordType})`);
    };
  });
}