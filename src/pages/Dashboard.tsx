import React from 'react';
import CredentialList from '../components/credentials/CredentialList';
import BackupWarning from '../components/dashboard/BackupWarning';
import { useCredentials } from '../context/CredentialsContext';

const Dashboard: React.FC = () => {
  const { state } = useCredentials();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Credentials Dashboard
      </h1>
      
      <BackupWarning />
      
      <CredentialList />
    </div>
  );
};

export default Dashboard;