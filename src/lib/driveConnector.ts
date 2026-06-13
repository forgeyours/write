// ============================================================
// FILE: src/lib/driveConnector.ts
// PURPOSE: Client-side Google Drive Sync & File Management
// LAST CHANGED: 13 Jun 2026
// ============================================================

const FOLDER_NAME = 'ForgeYours';
const DRIVE_API = 'https://www.googleapis.com/drive/v3';
const UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3';

export interface DriveDoc {
  id: string;
  name: string;
  modifiedTime: string;
}

// Access Token can be inputted by the user or saved in session/indexedDB
export function getSavedDriveToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('fy-google-drive-token');
}

export function saveDriveToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('fy-google-drive-token', token);
}

export function removeDriveToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('fy-google-drive-token');
}

async function getOrCreateFolder(token: string): Promise<string> {
  const searchRes = await fetch(
    `${DRIVE_API}/files?q=name='${FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false&fields=files(id,name)`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const searchData = await searchRes.json();

  if (searchData.files?.length > 0) {
    return searchData.files[0].id;
  }

  const createRes = await fetch(`${DRIVE_API}/files`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
    }),
  });
  const folder = await createRes.json();
  return folder.id;
}

export async function saveToDrive(params: {
  name: string;
  content: string;
  mimeType?: string;
  driveFileId?: string | null;
}): Promise<string> {
  const token = getSavedDriveToken();
  if (!token) throw new Error('Not signed in to Google Drive');

  const { name, content, mimeType = 'text/html', driveFileId } = params;
  const blob = new Blob([content], { type: mimeType });

  if (driveFileId) {
    // Update existing file
    const res = await fetch(`${UPLOAD_API}/files/${driveFileId}?uploadType=media`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': mimeType,
      },
      body: blob,
    });
    if (!res.ok) throw new Error('Failed to update Google Drive file');
    return driveFileId;
  } else {
    // Create new file
    const folderId = await getOrCreateFolder(token);
    const metadata = {
      name,
      parents: [folderId],
    };

    const form = new FormData();
    form.append(
      'metadata',
      new Blob([JSON.stringify(metadata)], { type: 'application/json' })
    );
    form.append('file', blob);

    const res = await fetch(
      `${UPLOAD_API}/files?uploadType=multipart&fields=id`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      }
    );
    if (!res.ok) throw new Error('Failed to create Google Drive file');
    const data = await res.json();
    return data.id;
  }
}

export async function listDriveFiles(): Promise<DriveDoc[]> {
  const token = getSavedDriveToken();
  if (!token) return [];

  const folderId = await getOrCreateFolder(token);

  const res = await fetch(
    `${DRIVE_API}/files?q='${folderId}' in parents and trashed=false&fields=files(id,name,modifiedTime)&orderBy=modifiedTime desc`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) throw new Error('Failed to fetch Drive items');
  const data = await res.json();
  return data.files ?? [];
}

export async function readDriveFile(driveFileId: string): Promise<string> {
  const token = getSavedDriveToken();
  if (!token) throw new Error('Not signed in to Google Drive');

  const res = await fetch(
    `${DRIVE_API}/files/${driveFileId}?alt=media`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) throw new Error('Failed to read Drive file content');
  return res.text();
}
