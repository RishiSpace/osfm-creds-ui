import React, { useState } from 'react';
import { Cloud, Lock, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { useTheme } from '../context/ThemeContext';
import { useCredentials } from '../context/CredentialsContext'; // Ensure this is imported
import Button from '../components/ui/Button';
import Toggle from '../components/ui/Toggle';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Alert from '../components/ui/Alert';
import { formatDate } from '../utils';
import {authenticateWithGoogle, disconnectFromGoogle } from '../services/googleDrive';
import { registerWebAuthnCredential, authenticateWebAuthnCredential } from '../utils/WebAuthn';

const Settings: React.FC = () => {
  const { state: authState, changePassword, connectGoogle, disconnectGoogle } = useAuth();
  const { state: settingsState, toggleAutoBackup, toggleAllowExport, toggleGoogleSync } = useSettings();
  const { state: themeState, toggleDarkMode } = useTheme();
  const { state: credentialsState, backupToCloud, restoreFromCloud } = useCredentials(); // Import restoreFromCloud here
  
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [is2FAEnabled, setIs2FAEnabled] = useState(
    !!localStorage.getItem('osfm-2fa-credentialId')
  );
  
  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    if (currentPassword !== authState.masterPassword) {
      setError('Current password is incorrect');
      return;
    }
    
    try {
      changePassword(currentPassword, newPassword);
      setIsChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccess('Password changed successfully');
      
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      setError('Failed to change password');
    }
  };
  
  const handleConnectGoogle = async () => {
    try {
      console.log('Attempting to authenticate with Google...');
      const success = await authenticateWithGoogle();
      if (success) {
        connectGoogle(); // Update state only after successful authentication
        setSuccess('Connected to Google Drive successfully');
        console.log('Google Drive connected successfully.');
      } else {
        setError('Failed to authenticate with Google');
        console.error('Authentication failed.');
      }
    } catch (error) {
      setError('Failed to connect to Google Drive');
      console.error('Error during Google Drive connection:', error);
    }
  };
  
  const handleDisconnectGoogle = async () => {
    try {
      await disconnectFromGoogle();
      disconnectGoogle();
      setSuccess('Disconnected from Google Drive');
    } catch (error) {
      setError('Failed to disconnect from Google Drive');
    }
  };
  
  const handleBackup = async () => {
    try {
      await backupToCloud();
      setSuccess('Backup completed successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError('Failed to backup to Google Drive');
    }
  };

  const handleRestore = async () => {
    try {
      await restoreFromCloud(); // Use restoreFromCloud here
      setSuccess('Restore completed successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError('Failed to restore from Google Drive');
    }
  };

  const handleRegister2FA = async () => {
    // Use a unique identifier for the user; fallback to a static string if not available
    const username =
      authState?.email ||
      authState?.username ||
      authState?.name ||
      "user";

    // WebAuthn returns a PublicKeyCredential, which has a 'rawId' property
    const credential = await registerWebAuthnCredential(username);

    // Type guard to ensure credential is a PublicKeyCredential
    if (
      credential &&
      "rawId" in credential &&
      credential.rawId instanceof ArrayBuffer
    ) {
      localStorage.setItem(
        "osfm-2fa-credentialId",
        btoa(String.fromCharCode(...new Uint8Array(credential.rawId)))
      );
      setIs2FAEnabled(true);
      setSuccess("2FA (Passkey/Biometrics) registered successfully.");
    } else {
      setError("Failed to register 2FA credential.");
    }
  };

  const handleRemove2FA = () => {
    localStorage.removeItem('osfm-2fa-credentialId');
    setIs2FAEnabled(false);
    setSuccess('2FA disabled.');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Settings
      </h1>
      
      {error && (
        <div className="mb-6">
          <Alert 
            variant="error" 
            message={error}
            onClose={() => setError(null)}
          />
        </div>
      )}
      
      {success && (
        <div className="mb-6">
          <Alert 
            variant="success" 
            message={success}
            onClose={() => setSuccess(null)}
          />
        </div>
      )}
      
      <div className="space-y-8">
        {/* Security Section */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Security
          </h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-medium text-gray-900 dark:text-white mb-1">
                Master Password
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                Your master password is used to encrypt all your credentials. Make sure it's strong and unique.
              </p>
              <Button
                icon={<Lock className="h-5 w-5" />}
                onClick={() => setIsChangingPassword(true)}
              >
                Change Master Password
              </Button>
            </div>
          </div>
        </div>
        
        {/* Backup & Sync */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Backup & Sync
          </h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-medium text-gray-900 dark:text-white mb-1">
                Google Drive Integration
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                Connect to Google Drive to securely backup your encrypted credentials.
              </p>
              
              {authState.isGoogleConnected ? (
                <div className="space-y-4">
                  <div className="flex items-center text-green-600 dark:text-green-400">
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm font-medium">Connected to Google Drive</span>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
                    <Button
                      onClick={handleBackup}
                      icon={<Cloud className="h-5 w-5" />}
                    >
                      Backup Now
                    </Button>
                    <Button
                      onClick={handleRestore} // Add restore button
                      icon={<Cloud className="h-5 w-5" />}
                    >
                      Restore Now
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={handleDisconnectGoogle}
                      icon={<LogOut className="h-5 w-5" />}
                    >
                      Disconnect
                    </Button>
                  </div>
                  
                  {credentialsState.lastBackup && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Last backup: {formatDate(credentialsState.lastBackup)}
                    </p>
                  )}
                </div>
              ) : (
                <Button
                  onClick={handleConnectGoogle}
                  icon={<Cloud className="h-5 w-5" />}
                >
                  Connect to Google Drive
                </Button>
              )}
            </div>
            
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
              <Toggle
                label="Enable Google Drive Sync"
                description="Automatically sync your credentials with Google Drive"
                checked={settingsState.enableGoogleSync}
                onChange={toggleGoogleSync}
                disabled={!authState.isGoogleConnected}
              />
              
              <Toggle
                label="Auto Backup"
                description="Automatically backup your credentials when changes are made"
                checked={settingsState.autoBackup}
                onChange={toggleAutoBackup}
                disabled={!authState.isGoogleConnected || !settingsState.enableGoogleSync}
              />
              
              <Toggle
                label="Allow Export"
                description="Enable exporting your credentials to a file"
                checked={settingsState.allowExport}
                onChange={toggleAllowExport}
              />
            </div>
          </div>
        </div>
        
        {/* Appearance */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Appearance
          </h2>
          
          <div className="space-y-4">
            <Toggle
              label="Dark Mode"
              description="Toggle between light and dark theme"
              checked={themeState.darkMode}
              onChange={toggleDarkMode}
            />
          </div>
        </div>
        
        {/* Two-Factor Authentication (2FA) */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Two-Factor Authentication (2FA)
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            Add an extra layer of security using Passkeys, Windows Hello, or your device's biometrics.
          </p>
          {is2FAEnabled ? (
            <Button onClick={handleRemove2FA} variant="danger">
              Remove 2FA
            </Button>
          ) : (
            <Button onClick={handleRegister2FA} variant="primary">
              Enable 2FA (Passkey/Biometrics)
            </Button>
          )}
        </div>
      </div>
      
      {/* Change Password Modal */}
      <Modal
        isOpen={isChangingPassword}
        onClose={() => setIsChangingPassword(false)}
        title="Change Master Password"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            Changing your master password will re-encrypt all your credentials. Make sure to remember your new password!
          </p>
          
          <Input
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter your current password"
            fullWidth
          />
          
          <Input
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter a strong new password"
            fullWidth
          />
          
          <Input
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your new password"
            fullWidth
            error={
              confirmPassword && newPassword !== confirmPassword
                ? 'Passwords do not match'
                : ''
            }
          />
          
          <div className="pt-4 flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setIsChangingPassword(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleChangePassword}
              disabled={!currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
            >
              Change Password
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Settings;