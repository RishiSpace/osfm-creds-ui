import React from 'react';
import { AlertCircle, Cloud } from 'lucide-react';
import { useCredentials } from '../../context/CredentialsContext';
import { useAuth } from '../../context/AuthContext';
import { needsBackup } from '../../utils';
import Button from '../ui/Button';

const BackupWarning: React.FC = () => {
  const { state, backupToCloud } = useCredentials();
  const { state: authState } = useAuth();
  
  const shouldShowWarning = () => {
    // Show warning if there are credentials but no backup
    if (state.credentials.length === 0) {
      return false;
    }
    
    // No backup at all
    if (state.lastBackup === null) {
      return true;
    }
    
    // Backup is too old
    return needsBackup(state.lastBackup);
  };
  
  const getDaysSinceBackup = () => {
    if (state.lastBackup === null) {
      return null;
    }
    
    const now = Date.now();
    const days = Math.floor((now - state.lastBackup) / (1000 * 60 * 60 * 24));
    return days;
  };
  
  if (!shouldShowWarning()) {
    return null;
  }
  
  const days = getDaysSinceBackup();
  const isConnected = authState.isGoogleConnected;

  return (
    <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-yellow-400" />
        </div>
        <div className="ml-3 flex-1 md:flex md:justify-between">
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            {days === null ? (
              <>Your credentials are stored only on this device. It is recommended to back them up for safety.</>
            ) : (
              <>Your last backup was {days} {days === 1 ? 'day' : 'days'} ago. It is recommended to back up regularly.</>
            )}
          </p>
          <div className="mt-3 flex md:ml-6 md:mt-0">
            {isConnected ? (
              <Button
                variant="secondary"
                size="sm"
                icon={<Cloud className="h-4 w-4" />}
                onClick={() => backupToCloud()}
              >
                Backup Now
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => window.location.href = '/settings'}
              >
                Setup Backup
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupWarning;