// ============================================================
// FILE: src/lib/localStore.ts
// PURPOSE: Offline-first IndexedDB manager for local file storage
// LAST CHANGED: 13 Jun 2026
// ============================================================

export interface SavedFile {
  id: string;
  tool: string;
  name: string;
  content: string;
  updatedAt: string;
}

const DB_NAME = 'forgeyours-db';
const STORE_NAME = 'documents';
const DB_VERSION = 1;

function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

export async function saveFile(file: Omit<SavedFile, 'updatedAt'> & { updatedAt?: string }): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const record: SavedFile = {
      ...file,
      updatedAt: file.updatedAt || new Date().toISOString(),
    };

    const request = store.put(record);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getFile(id: string): Promise<SavedFile> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteFile(id: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function listFiles(tool: string): Promise<SavedFile[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const all = request.result as SavedFile[];
      // Filter by tool type and sort by updatedAt desc
      const filtered = all
        .filter(f => f.tool === tool)
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      resolve(filtered);
    };
    request.onerror = () => reject(request.error);
  });
}

export function generateFileId(tool: string): string {
  return `${tool}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
