import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { SettingsState } from '../types';

type SettingsAction = 
  | { type: 'TOGGLE_AUTO_BACKUP' }
  | { type: 'TOGGLE_ALLOW_EXPORT' }
  | { type: 'TOGGLE_GOOGLE_SYNC' }
  | { type: 'LOAD_SETTINGS'; payload: SettingsState };

const initialState: SettingsState = {
  autoBackup: true,
  allowExport: true,
  enableGoogleSync: true,
};

const SETTINGS_STORAGE_KEY = 'osfm-creds-settings';

const settingsReducer = (state: SettingsState, action: SettingsAction): SettingsState => {
  switch (action.type) {
    case 'TOGGLE_AUTO_BACKUP':
      return {
        ...state,
        autoBackup: !state.autoBackup,
      };
    case 'TOGGLE_ALLOW_EXPORT':
      return {
        ...state,
        allowExport: !state.allowExport,
      };
    case 'TOGGLE_GOOGLE_SYNC':
      return {
        ...state,
        enableGoogleSync: !state.enableGoogleSync,
      };
    case 'LOAD_SETTINGS':
      return action.payload;
    default:
      return state;
  }
};

interface SettingsContextType {
  state: SettingsState;
  toggleAutoBackup: () => void;
  toggleAllowExport: () => void;
  toggleGoogleSync: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(settingsReducer, initialState);

  // Load settings from local storage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        dispatch({ type: 'LOAD_SETTINGS', payload: parsedSettings });
      } catch (error) {
        console.error('Failed to parse settings:', error);
      }
    }
  }, []);

  // Save settings to local storage whenever they change
  useEffect(() => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const toggleAutoBackup = () => {
    dispatch({ type: 'TOGGLE_AUTO_BACKUP' });
  };

  const toggleAllowExport = () => {
    dispatch({ type: 'TOGGLE_ALLOW_EXPORT' });
  };

  const toggleGoogleSync = () => {
    dispatch({ type: 'TOGGLE_GOOGLE_SYNC' });
  };

  return (
    <SettingsContext.Provider value={{ 
      state, 
      toggleAutoBackup, 
      toggleAllowExport, 
      toggleGoogleSync 
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};