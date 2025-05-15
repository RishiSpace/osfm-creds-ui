import React, { useState, useRef } from 'react';
import { Download, Upload, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCredentials } from '../context/CredentialsContext';
import { useSettings } from '../context/SettingsContext';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { exportToFile, importFromFile } from '../services/storage';

const ImportExport: React.FC = () => {
  const { state: authState } = useAuth();
  const { state: credentialsState, importCredentials } = useCredentials();
  const { state: settingsState } = useSettings();
  
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importPassword, setImportPassword] = useState('');
  const [exportPassword, setExportPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setError(null);
    }
  };
  
  const handleExport = async () => {
    if (!authState.masterPassword) return;
    
    if (exportPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setIsExporting(false);
    
    try {
      const password = exportPassword || authState.masterPassword;
      
      exportToFile(
        {
          credentials: credentialsState.credentials,
          lastBackup: credentialsState.lastBackup,
        },
        password
      );
      
      setExportPassword('');
      setConfirmPassword('');
      setSuccess('Credentials exported successfully');
      
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      setError('Failed to export credentials');
    }
  };
  
  const handleImport = async () => {
    if (!selectedFile) {
      setError('Please select a file to import');
      return;
    }
    
    if (!importPassword) {
      setError('Please enter the password for the imported file');
      return;
    }
    
    try {
      const importedData = await importFromFile(selectedFile, importPassword);
      
      await importCredentials(importedData.credentials);
      
      setIsImporting(false);
      setSelectedFile(null);
      setImportPassword('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      setSuccess('Credentials imported successfully');
      
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      setError('Failed to import credentials. The password may be incorrect or the file is corrupted.');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Import & Export
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Export Section */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          <div className="flex items-center mb-4">
            <Download className="h-6 w-6 text-blue-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Export Credentials
            </h2>
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Export your credentials to a secure, encrypted file. You can use this file to restore your credentials later or transfer them to another device.
          </p>
          
          {!settingsState.allowExport ? (
            <div className="mb-4">
              <Alert
                variant="warning"
                message="Exports are disabled in settings. Enable them to export your credentials."
              />
            </div>
          ) : (
            <>
              <div className="mb-6">
                <Alert
                  variant="info"
                  message="The exported file will be encrypted. Keep the export password safe, you'll need it to import your credentials again."
                />
              </div>
              
              <Button
                icon={<Download className="h-5 w-5" />}
                onClick={() => setIsExporting(true)}
                disabled={credentialsState.credentials.length === 0}
                fullWidth
              >
                Export
              </Button>
              
              {credentialsState.credentials.length === 0 && (
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  You need to have at least one credential to export.
                </p>
              )}
            </>
          )}
        </div>
        
        {/* Import Section */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          <div className="flex items-center mb-4">
            <Upload className="h-6 w-6 text-green-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Import Credentials
            </h2>
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Import credentials from a previously exported file. This will merge with your existing credentials.
          </p>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Select File
            </label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".osfmdb,.json"
              className="
                block w-full text-sm text-gray-500 dark:text-gray-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-medium
                file:bg-blue-50 file:text-blue-700
                dark:file:bg-blue-900/30 dark:file:text-blue-300
                hover:file:bg-blue-100 dark:hover:file:bg-blue-800/40
              "
            />
          </div>
          
          <Button
            icon={<Upload className="h-5 w-5" />}
            onClick={() => setIsImporting(true)}
            disabled={!selectedFile}
            fullWidth
          >
            Import
          </Button>
        </div>
      </div>
      
      {/* Security Notice */}
      <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Security Notice
            </h3>
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              <p>
                Exported credential files contain sensitive information. Always keep them secure and never share them with others.
              </p>
              <p className="mt-1">
                Use a strong, unique password for your exported files, different from your master password for added security.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Export Modal */}
      <Modal
        isOpen={isExporting}
        onClose={() => setIsExporting(false)}
        title="Export Credentials"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            Your credentials will be exported to an encrypted file. Please enter a password to protect your export.
          </p>
          
          <Input
            label="Export Password"
            type="password"
            value={exportPassword}
            onChange={(e) => setExportPassword(e.target.value)}
            placeholder="Enter a strong password"
            fullWidth
          />
          
          <Input
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            fullWidth
            error={
              confirmPassword && exportPassword !== confirmPassword
                ? 'Passwords do not match'
                : ''
            }
          />
          
          <div className="pt-4 flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setIsExporting(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleExport}
              disabled={!exportPassword || exportPassword !== confirmPassword}
            >
              Export Now
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* Import Modal */}
      <Modal
        isOpen={isImporting}
        onClose={() => setIsImporting(false)}
        title="Import Credentials"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            Enter the password that was used to encrypt this file.
          </p>
          
          <Input
            label="Import Password"
            type="password"
            value={importPassword}
            onChange={(e) => setImportPassword(e.target.value)}
            placeholder="Enter the file password"
            fullWidth
          />
          
          <div className="pt-4 flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setIsImporting(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={!importPassword}
            >
              Import Now
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ImportExport;