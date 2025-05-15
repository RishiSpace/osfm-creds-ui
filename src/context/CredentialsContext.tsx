import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Credential, CredentialsState, CredentialType, StorageData } from '../types';
import { generateId } from '../utils';
import { 
  saveToLocalStorage, 
  loadFromLocalStorage,
  mergeCredentials 
} from '../services/storage';
import { backupToGoogleDrive, restoreFromGoogleDrive } from '../services/googleDrive';
import { useAuth } from './AuthContext';
import { useSettings } from './SettingsContext';

type CredentialsAction = 
  | { type: 'LOAD_CREDENTIALS'; payload: StorageData }
  | { type: 'ADD_CREDENTIAL'; payload: Omit<Credential, 'id' | 'createdAt' | 'updatedAt'> }
  | { type: 'UPDATE_CREDENTIAL'; payload: Credential }
  | { type: 'DELETE_CREDENTIAL'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_LAST_BACKUP'; payload: number }
  | { type: 'SET_SEARCH_TERM'; payload: string }
  | { type: 'SET_FILTER_TYPE'; payload: CredentialType | 'all' }
  | { type: 'IMPORT_CREDENTIALS'; payload: Credential[] };

const initialState: CredentialsState = {
  credentials: [],
  isLoading: false,
  error: null,
  lastBackup: null,
  searchTerm: '',
  filterType: 'all',
};

const credentialsReducer = (
  state: CredentialsState, 
  action: CredentialsAction
): CredentialsState => {
  switch (action.type) {
    case 'LOAD_CREDENTIALS':
      return {
        ...state,
        credentials: action.payload.credentials,
        lastBackup: action.payload.lastBackup,
        isLoading: false,
        error: null,
      };
    case 'ADD_CREDENTIAL':
      const newCredential: Credential = {
        ...action.payload,
        id: generateId(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      return {
        ...state,
        credentials: [...state.credentials, newCredential],
      };
    case 'UPDATE_CREDENTIAL':
      return {
        ...state,
        credentials: state.credentials.map(cred => 
          cred.id === action.payload.id 
            ? { ...action.payload, updatedAt: Date.now() }
            : cred
        ),
      };
    case 'DELETE_CREDENTIAL':
      return {
        ...state,
        credentials: state.credentials.filter(cred => cred.id !== action.payload),
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case 'SET_LAST_BACKUP':
      return {
        ...state,
        lastBackup: action.payload,
      };
    case 'SET_SEARCH_TERM':
      return {
        ...state,
        searchTerm: action.payload,
      };
    case 'SET_FILTER_TYPE':
      return {
        ...state,
        filterType: action.payload,
      };
    case 'IMPORT_CREDENTIALS':
      return {
        ...state,
        credentials: mergeCredentials(state.credentials, action.payload),
      };
    default:
      return state;
  }
};

interface CredentialsContextType {
  state: CredentialsState;
  loadCredentials: () => Promise<void>;
  addCredential: (credential: Omit<Credential, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateCredential: (credential: Credential) => Promise<void>;
  deleteCredential: (id: string) => Promise<void>;
  backupToCloud: () => Promise<void>;
  restoreFromCloud: () => Promise<void>;
  importCredentials: (credentials: Credential[]) => Promise<void>;
  setSearchTerm: (term: string) => void;
  setFilterType: (type: CredentialType | 'all') => void;
  filteredCredentials: Credential[];
}

const CredentialsContext = createContext<CredentialsContextType | undefined>(undefined);

export const CredentialsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(credentialsReducer, initialState);
  const { state: authState } = useAuth();
  const { state: settingsState } = useSettings();

  // Load credentials from storage when authenticated
  useEffect(() => {
    if (authState.isAuthenticated && authState.masterPassword) {
      loadCredentials();
    }
  }, [authState.isAuthenticated, authState.masterPassword]);

  // Auto backup to Google Drive if enabled
  useEffect(() => {
    const autoBackup = async () => {
      if (
        authState.isAuthenticated && 
        authState.masterPassword && 
        authState.isGoogleConnected &&
        settingsState.autoBackup && 
        settingsState.enableGoogleSync &&
        state.credentials.length > 0
      ) {
        try {
          await backupToCloud();
        } catch (error) {
          console.error('Auto backup failed:', error);
        }
      }
    };
    
    autoBackup();
  }, [state.credentials, settingsState.autoBackup, authState.isGoogleConnected]);

  const loadCredentials = async () => {
    if (!authState.masterPassword) return;
    
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const data = loadFromLocalStorage(authState.masterPassword);
      dispatch({ type: 'LOAD_CREDENTIALS', payload: data });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load credentials' });
    }
  };

  const saveCredentials = async () => {
    if (!authState.masterPassword) return;
    
    const data: StorageData = {
      credentials: state.credentials,
      lastBackup: state.lastBackup,
    };
    
    saveToLocalStorage(data, authState.masterPassword);
  };

  const addCredential = async (credential: Omit<Credential, 'id' | 'createdAt' | 'updatedAt'>) => {
    dispatch({ type: 'ADD_CREDENTIAL', payload: credential });
    await saveCredentials();
  };

  const updateCredential = async (credential: Credential) => {
    dispatch({ type: 'UPDATE_CREDENTIAL', payload: credential });
    await saveCredentials();
  };

  const deleteCredential = async (id: string) => {
    dispatch({ type: 'DELETE_CREDENTIAL', payload: id });
    await saveCredentials();
  };

  const backupToCloud = async () => {
    if (!authState.masterPassword || !authState.isGoogleConnected) return;
    
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const data: StorageData = {
        credentials: state.credentials,
        lastBackup: state.lastBackup,
      };
      
      const backupTime = await backupToGoogleDrive(data, authState.masterPassword);
      dispatch({ type: 'SET_LAST_BACKUP', payload: backupTime });
      await saveCredentials();
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to backup to Google Drive' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const restoreFromCloud = async () => {
    if (!authState.masterPassword || !authState.isGoogleConnected) return;
    
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const data = await restoreFromGoogleDrive(authState.masterPassword);
      
      // Merge with existing credentials
      const mergedCredentials = mergeCredentials(
        state.credentials, 
        data.credentials
      );
      
      dispatch({ 
        type: 'LOAD_CREDENTIALS', 
        payload: {
          credentials: mergedCredentials,
          lastBackup: Date.now(),
        } 
      });
      
      await saveCredentials();
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to restore from Google Drive' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const importCredentials = async (credentials: Credential[]) => {
    dispatch({ type: 'IMPORT_CREDENTIALS', payload: credentials });
    await saveCredentials();
  };

  const setSearchTerm = (term: string) => {
    dispatch({ type: 'SET_SEARCH_TERM', payload: term });
  };

  const setFilterType = (type: CredentialType | 'all') => {
    dispatch({ type: 'SET_FILTER_TYPE', payload: type });
  };

  // Filter credentials based on search term and filter type
  const filteredCredentials = state.credentials.filter(cred => {
    const matchesSearch = 
      cred.name.toLowerCase().includes(state.searchTerm.toLowerCase()) || 
      (cred.description && cred.description.toLowerCase().includes(state.searchTerm.toLowerCase()));
    
    const matchesType = state.filterType === 'all' || cred.type === state.filterType;
    
    return matchesSearch && matchesType;
  });

  return (
    <CredentialsContext.Provider value={{ 
      state, 
      loadCredentials, 
      addCredential, 
      updateCredential, 
      deleteCredential, 
      backupToCloud, 
      restoreFromCloud, 
      importCredentials,
      setSearchTerm,
      setFilterType,
      filteredCredentials
    }}>
      {children}
    </CredentialsContext.Provider>
  );
};

export const useCredentials = (): CredentialsContextType => {
  const context = useContext(CredentialsContext);
  if (context === undefined) {
    throw new Error('useCredentials must be used within a CredentialsProvider');
  }
  return context;
};