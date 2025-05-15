import CryptoJS from 'crypto-js';

// Generate a random ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Format date in a human-readable way
export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleString();
};

// Copy text to clipboard
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy:', error);
    return false;
  }
};

// Check if the string is JSON
export const isJsonString = (str: string): boolean => {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
};

// Basic encryption using CryptoJS
export const encryptData = (data: any, password: string): string => {
  const jsonData = JSON.stringify(data);
  return CryptoJS.AES.encrypt(jsonData, password).toString();
};

// Basic decryption using CryptoJS
export const decryptData = (encrypted: string, password: string): any => {
  try {
    const decrypted = CryptoJS.AES.decrypt(encrypted, password).toString(CryptoJS.enc.Utf8);
    if (!decrypted) {
      throw new Error('Decryption failed');
    }
    return JSON.parse(decrypted);
  } catch (error) {
    throw new Error('Invalid password or corrupted data');
  }
};

// Check if storage exists
export const storageExists = (): boolean => {
  return localStorage.getItem('osfm-creds-encrypted') !== null;
};

// Calculate days since last backup
export const daysSinceBackup = (lastBackupTimestamp: number | null): number | null => {
  if (!lastBackupTimestamp) return null;
  
  const currentTime = Date.now();
  const timeDifference = currentTime - lastBackupTimestamp;
  return Math.floor(timeDifference / (1000 * 60 * 60 * 24));
};

// Check if data needs backup (more than 7 days)
export const needsBackup = (lastBackupTimestamp: number | null): boolean => {
  const days = daysSinceBackup(lastBackupTimestamp);
  return days === null || days > 7;
};

// Get credential type icon name
export const getCredentialTypeIcon = (type: string): string => {
  switch (type) {
    case 'api':
      return 'key';
    case 'ssh':
      return 'terminal';
    case 'gpg':
      return 'shield';
    case 'password':
      return 'lock';
    default:
      return 'file';
  }
};