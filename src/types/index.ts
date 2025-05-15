export type CredentialType = 'api' | 'ssh' | 'gpg' | 'password' | 'other';

export interface Credential {
  id: string;
  name: string;
  type: CredentialType;
  value: string;
  description?: string;
  tags?: string[];
  createdAt: number;
  updatedAt: number;
}

export interface CredentialsState {
  credentials: Credential[];
  isLoading: boolean;
  error: string | null;
  lastBackup: number | null;
  searchTerm: string;
  filterType: CredentialType | 'all';
}

export interface EncryptedData {
  data: string;
  iv: string;
}

export interface StorageData {
  credentials: Credential[];
  lastBackup: number | null;
}

export interface AuthState {
  isAuthenticated: boolean;
  masterPassword: string | null;
  isGoogleConnected: boolean;
}

export interface ThemeState {
  darkMode: boolean;
}

export interface SettingsState {
  autoBackup: boolean;
  allowExport: boolean;
  enableGoogleSync: boolean;
}