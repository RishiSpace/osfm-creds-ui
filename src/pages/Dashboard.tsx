import React from 'react';
import CredentialList from '../components/credentials/CredentialList';
import BackupWarning from '../components/dashboard/BackupWarning';

const Dashboard: React.FC = () => {
  return (
    <div className="bg-gray-50 dark:bg-dark-bg min-h-screen">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Credentials Dashboard
      </h1>
      
      <BackupWarning />
      
      <CredentialList />
    </div>
  );
};

export default Dashboard;