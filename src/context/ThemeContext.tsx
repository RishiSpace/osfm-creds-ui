import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { ThemeState } from '../types';

type ThemeAction = 
  | { type: 'TOGGLE_DARK_MODE' }
  | { type: 'SET_DARK_MODE'; payload: boolean };

const initialState: ThemeState = {
  darkMode: false,
};

const themeReducer = (state: ThemeState, action: ThemeAction): ThemeState => {
  switch (action.type) {
    case 'TOGGLE_DARK_MODE':
      return {
        ...state,
        darkMode: !state.darkMode,
      };
    case 'SET_DARK_MODE':
      return {
        ...state,
        darkMode: action.payload,
      };
    default:
      return state;
  }
};

interface ThemeContextType {
  state: ThemeState;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(themeReducer, initialState);

  // Check user's preferred color scheme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('osfm-creds-theme');
    
    if (savedTheme) {
      dispatch({ type: 'SET_DARK_MODE', payload: savedTheme === 'dark' });
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      dispatch({ type: 'SET_DARK_MODE', payload: prefersDark });
    }
  }, []);

  // Apply theme class to document
  useEffect(() => {
    if (state.darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('osfm-creds-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('osfm-creds-theme', 'light');
    }
  }, [state.darkMode]);

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      dispatch({ type: 'SET_DARK_MODE', payload: e.matches });
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  const toggleDarkMode = () => {
    dispatch({ type: 'TOGGLE_DARK_MODE' });
  };

  return (
    <ThemeContext.Provider value={{ state, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};