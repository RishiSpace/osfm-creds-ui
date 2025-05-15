import { StorageData } from '../types';
import { encryptData, decryptData } from '../utils';

const DRIVE_FILE_NAME = 'osfm-creds-backup.osfmdb';
const DRIVE_FOLDER_NAME = 'OSFM Credentials Manager';
const ACCESS_TOKEN_KEY = 'google_access_token';

let gapi: any = null;
let accessToken: string | null = null;

// Restore access token from local storage
const restoreAccessToken = () => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (token) {
    accessToken = token;
    if (gapi && gapi.client) {
      gapi.client.setToken({ access_token: token });
    }
  }
};

// Initialize Google API
export const initGoogleApi = async (): Promise<void> => {
  try {
    console.log('Loading Google API...');
    gapi = (window as any).gapi;
    await new Promise((resolve, reject) => {
      gapi.load('client', async () => {
        try {
          console.log('Initializing Google API client...');
          await gapi.client.init({
            apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
          });
          console.log('Google API client initialized successfully.');
          resolve(null);
        } catch (error) {
          console.error('Error initializing Google API client:', error);
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error('Failed to initialize Google API:', error);
    throw new Error('Failed to initialize Google API');
  }
};

// Authenticate with Google using GIS
export const authenticateWithGoogle = async (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    try {
      if (typeof google === 'undefined') {
        throw new Error('Google Identity Services library is not loaded');
      }

      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (!clientId) {
        throw new Error('Google Client ID is not set');
      }

      // Initialize the token client
      const tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/drive.file',
        callback: (response: { access_token: string; error?: string }) => {
          if (response.error) {
            console.error('Error during token acquisition:', response.error);
            reject(new Error('Failed to acquire access token'));
            return;
          }
          accessToken = response.access_token;
          // Store the token for persistence
          localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);

          // *** Set the access token for gapi ***
          if (gapi && gapi.client) {
            gapi.client.setToken({ accessToken });
          }

          console.log('Access token acquired:', accessToken);
          resolve(true);
        },
      });

      // Explicitly show the OAuth popup
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } catch (error) {
      console.error('Google authentication failed:', error);
      reject(error);
    }
  });
};

// Check if the user is authenticated with Google
export const isGoogleAuthenticated = (): boolean => {
  return !!accessToken;
};

// Create backup folder in Google Drive if it doesn't exist
const createFolderIfNeeded = async (): Promise<string> => {
  try {
    const response = await gapi.client.drive.files.list({
      q: `name='${DRIVE_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id, name)',
    });

    const folder = response.result.files?.[0];
    if (folder) {
      console.log('Folder already exists. Folder ID:', folder.id);
      return folder.id;
    }

    console.log('Creating new folder...');
    const folderResponse = await gapi.client.drive.files.create({
      resource: {
        name: DRIVE_FOLDER_NAME,
        mimeType: 'application/vnd.google-apps.folder',
      },
      fields: 'id',
    });

    console.log('Folder created successfully. Folder ID:', folderResponse.result.id);
    return folderResponse.result.id;
  } catch (error) {
    console.error('Failed to create folder:', error);
    throw new Error('Failed to create backup folder in Google Drive');
  }
};

// Check if backup file exists in Google Drive
const getBackupFileId = async (folderId: string): Promise<string | null> => {
  try {
    const response = await gapi.client.drive.files.list({
      q: `name='${DRIVE_FILE_NAME}' and '${folderId}' in parents and trashed=false`,
      fields: 'files(id, name)',
    });

    const file = response.result.files?.[0];
    return file ? file.id : null;
  } catch (error) {
    console.error('Failed to check for backup file:', error);
    return null;
  }
};

// Backup data to Google Drive
export const backupToGoogleDrive = async (data: StorageData): Promise<number> => {
  try {
    if (!accessToken) {
      throw new Error('User is not authenticated with Google');
    }

    const folderId = await createFolderIfNeeded();
    const jsonData = JSON.stringify(data, null, 2);

    // --- Multipart upload ---
    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const metadata = {
      name: DRIVE_FILE_NAME,
      mimeType: 'application/json',
      parents: [folderId],
    };

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      jsonData +
      closeDelimiter;

    const response = await gapi.client.request({
      path: '/upload/drive/v3/files',
      method: 'POST',
      params: { uploadType: 'multipart' },
      headers: {
        'Content-Type': `multipart/related; boundary="${boundary}"`,
        Authorization: `Bearer ${accessToken}`,
      },
      body: multipartRequestBody,
    });

    console.log('File uploaded successfully. File ID:', response.result.id);
    return Date.now();
  } catch (error) {
    console.error('Backup to Google Drive failed:', error);
    throw new Error('Failed to backup to Google Drive');
  }
};

// Restore data from Google Drive
export const restoreFromGoogleDrive = async (): Promise<StorageData> => {
  try {
    if (!accessToken) {
      throw new Error('User is not authenticated with Google');
    }

    const folderId = await createFolderIfNeeded();
    const fileId = await getBackupFileId(folderId);

    if (!fileId) {
      throw new Error('No backup found in Google Drive');
    }

    console.log('Downloading JSON file from Google Drive...');
    const response = await gapi.client.drive.files.get({
      fileId,
      alt: 'media',
    });

    console.log('File downloaded successfully. Parsing JSON...');
    const data = JSON.parse(response.body);
    console.log('Restored data:', data);

    return data;
  } catch (error) {
    console.error('Restore from Google Drive failed:', error);
    throw new Error('Failed to restore from Google Drive');
  }
};

// Disconnect from Google
export const disconnectFromGoogle = async (): Promise<void> => {
  try {
    accessToken = null;
    console.log('Disconnected from Google');
  } catch (error) {
    console.error('Failed to disconnect from Google:', error);
    throw new Error('Failed to disconnect from Google');
  }
};