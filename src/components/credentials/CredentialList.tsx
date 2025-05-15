import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { CredentialType } from '../../types';
import { useCredentials } from '../../context/CredentialsContext';
import CredentialItem from './CredentialItem';
import CredentialForm from './CredentialForm';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import Alert from '../ui/Alert';

const CredentialList: React.FC = () => {
  const { 
    state, 
    filteredCredentials, 
    addCredential, 
    updateCredential, 
    deleteCredential,
    setSearchTerm,
    setFilterType
  } = useCredentials();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentCredential, setCurrentCredential] = useState<any>(null);
  
  const handleEditClick = (credential: any) => {
    setCurrentCredential(credential);
    setIsEditModalOpen(true);
  };
  
  const handleDeleteClick = (id: string) => {
    setCurrentCredential({ id });
    setIsDeleteModalOpen(true);
  };
  
  const handleAddSubmit = async (data: any) => {
    await addCredential(data);
    setIsAddModalOpen(false);
  };
  
  const handleEditSubmit = async (data: any) => {
    await updateCredential({
      ...data,
      id: currentCredential.id,
      createdAt: currentCredential.createdAt,
      updatedAt: Date.now(),
    });
    setIsEditModalOpen(false);
  };
  
  const handleDeleteConfirm = async () => {
    await deleteCredential(currentCredential.id);
    setIsDeleteModalOpen(false);
  };
  
  const filterTypes: Array<{ label: string; value: CredentialType | 'all' }> = [
    { label: 'All', value: 'all' },
    { label: 'API Keys', value: 'api' },
    { label: 'SSH Keys', value: 'ssh' },
    { label: 'GPG Keys', value: 'gpg' },
    { label: 'Passwords', value: 'password' },
    { label: 'Other', value: 'other' },
  ];

  return (
    <div>
      {!state.isLoading && state.credentials.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No credentials found
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Get started by adding your first credential
            </p>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              icon={<Plus className="h-5 w-5" />}
            >
              Add Credential
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search credentials..."
                icon={<Search className="h-5 w-5 text-gray-400" />}
                fullWidth
                value={state.searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="flex flex-wrap gap-2">
                {filterTypes.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setFilterType(filter.value)}
                    className={`
                      px-3 py-1 text-sm font-medium rounded-full
                      ${
                        state.filterType === filter.value
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                      }
                    `}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
              
              <Button
                onClick={() => setIsAddModalOpen(true)}
                icon={<Plus className="h-5 w-5" />}
                variant="primary"
                size="md"
              >
                Add
              </Button>
            </div>
          </div>
          
          {state.error && (
            <div className="mb-4">
              <Alert
                variant="error"
                message={state.error}
                onClose={() => {}}
              />
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCredentials.length === 0 ? (
              <div className="col-span-full p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  No credentials found matching your search
                </p>
              </div>
            ) : (
              filteredCredentials.map((credential) => (
                <CredentialItem
                  key={credential.id}
                  credential={credential}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                />
              ))
            )}
          </div>
        </>
      )}
      
      {/* Add Credential Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Credential"
        size="lg"
      >
        <CredentialForm
          onSubmit={handleAddSubmit}
          onCancel={() => setIsAddModalOpen(false)}
        />
      </Modal>
      
      {/* Edit Credential Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Credential"
        size="lg"
      >
        {currentCredential && (
          <CredentialForm
            initialData={currentCredential}
            onSubmit={handleEditSubmit}
            onCancel={() => setIsEditModalOpen(false)}
          />
        )}
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Credential"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Are you sure you want to delete this credential? This action cannot be undone.
          </p>
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteConfirm}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CredentialList;