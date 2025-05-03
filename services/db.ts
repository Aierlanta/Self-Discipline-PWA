import type { SleepRecord, ExerciseRecord, StudyRecord } from "../types/records.ts";

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

export async function addSleepRecord(record: Omit<SleepRecord, "id" | "createdAt">): Promise<string> {
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
    transaction.oncomplete = () => console.log(`Sleep record ${id} added.`);
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

// --- Exercise Records ---

export async function addExerciseRecord(record: Omit<ExerciseRecord, "id" | "createdAt">): Promise<string> {
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
    transaction.oncomplete = () => console.log(`Exercise record ${id} added.`);
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

// --- Study Records ---

export async function addStudyRecord(record: Omit<StudyRecord, "id" | "createdAt">): Promise<string> {
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
    transaction.oncomplete = () => console.log(`Study record ${id} added.`);
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