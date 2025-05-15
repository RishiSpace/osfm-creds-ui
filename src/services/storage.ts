import { Credential, StorageData } from '../types';
import { encryptData, decryptData } from '../utils';

const STORAGE_KEY = 'osfm-creds-encrypted';

// Save encrypted credentials to localStorage
export const saveToLocalStorage = (data: StorageData, password: string): void => {
  try {
    const encrypted = encryptData(data, password);
    localStorage.setItem(STORAGE_KEY, encrypted);
  } catch (error) {
    console.error('Error saving data:', error);
    throw new Error('Failed to save data locally');
  }
};

// Load and decrypt credentials from localStorage
export const loadFromLocalStorage = (password: string): StorageData => {
  try {
    const encrypted = localStorage.getItem(STORAGE_KEY);
    if (!encrypted) {
      return { credentials: [], lastBackup: null };
    }
    
    return decryptData(encrypted, password);
  } catch (error) {
    console.error('Error loading data:', error);
    throw new Error('Failed to load data. Invalid password or corrupted data.');
  }
};

// Export credentials to a downloadable file
export const exportToFile = (data: StorageData, password: string): void => {
  try {
    const encrypted = encryptData(data, password);
    const blob = new Blob([encrypted], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `osfm-creds-backup-${new Date().toISOString().split('T')[0]}.osfmdb`;
    a.click();
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting data:', error);
    throw new Error('Failed to export data');
  }
};

// Import credentials from a file
export const importFromFile = async (file: File, password: string): Promise<StorageData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        if (!event.target || typeof event.target.result !== 'string') {
          throw new Error('Failed to read file');
        }
        
        const encrypted = event.target.result;
        const decrypted = decryptData(encrypted, password);
        
        // Validate the imported data structure
        if (!decrypted.credentials || !Array.isArray(decrypted.credentials)) {
          throw new Error('Invalid data format');
        }
        
        resolve(decrypted);
      } catch (error) {
        reject(new Error('Failed to import data. Invalid password or corrupted file.'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
};

// Merge imported credentials with existing ones
export const mergeCredentials = (
  existing: Credential[], 
  imported: Credential[]
): Credential[] => {
  const merged = [...existing];
  const existingIds = new Set(existing.map(cred => cred.id));
  
  for (const importedCred of imported) {
    if (!existingIds.has(importedCred.id)) {
      merged.push(importedCred);
    } else {
      // Find index of existing credential with same ID
      const index = merged.findIndex(cred => cred.id === importedCred.id);
      
      // Update if imported is newer
      if (importedCred.updatedAt > merged[index].updatedAt) {
        merged[index] = importedCred;
      }
    }
  }
  
  return merged;
};