import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { AuthState } from '../types';
import { storageExists } from '../utils';
import { isGoogleAuthenticated } from '../services/googleDrive';

type AuthAction = 
  | { type: 'LOGIN'; password: string }
  | { type: 'LOGOUT' }
  | { type: 'CHANGE_PASSWORD'; oldPassword: string; newPassword: string }
  | { type: 'CONNECT_GOOGLE' }
  | { type: 'DISCONNECT_GOOGLE' };

const initialState: AuthState = {
  isAuthenticated: false,
  masterPassword: null,
  isGoogleConnected: false,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        isAuthenticated: true,
        masterPassword: action.password,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        masterPassword: null,
      };
    case 'CHANGE_PASSWORD':
      return {
        ...state,
        masterPassword: action.newPassword,
      };
    case 'CONNECT_GOOGLE':
      return {
        ...state,
        isGoogleConnected: true,
      };
    case 'DISCONNECT_GOOGLE':
      return {
        ...state,
        isGoogleConnected: false,
      };
    default:
      return state;
  }
};

interface AuthContextType {
  state: AuthState;
  login: (password: string) => void;
  logout: () => void;
  changePassword: (oldPassword: string, newPassword: string) => void;
  connectGoogle: () => void;
  disconnectGoogle: () => void;
  isInitialSetup: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [isInitialSetup, setIsInitialSetup] = useState(false);

  useEffect(() => {
    // Check if this is the first time using the app
    const hasExistingStorage = storageExists();
    setIsInitialSetup(!hasExistingStorage);
    
    // Check Google authentication status
    const googleAuthStatus = isGoogleAuthenticated();
    if (googleAuthStatus) {
      dispatch({ type: 'CONNECT_GOOGLE' });
    }
  }, []);

  const login = (password: string) => {
    dispatch({ type: 'LOGIN', password });
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const changePassword = (oldPassword: string, newPassword: string) => {
    dispatch({ type: 'CHANGE_PASSWORD', oldPassword, newPassword });
  };

  const connectGoogle = () => {
    dispatch({ type: 'CONNECT_GOOGLE' });
  };

  const disconnectGoogle = () => {
    dispatch({ type: 'DISCONNECT_GOOGLE' });
  };

  return (
    <AuthContext.Provider value={{ 
      state, 
      login, 
      logout, 
      changePassword, 
      connectGoogle, 
      disconnectGoogle,
      isInitialSetup 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};