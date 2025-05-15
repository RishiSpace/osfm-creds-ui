import React, { useState, useEffect } from 'react';
import { Credential, CredentialType } from '../../types';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Key, X } from 'lucide-react';

interface CredentialFormProps {
  initialData?: Credential;
  onSubmit: (data: Omit<Credential, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const CredentialForm: React.FC<CredentialFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [type, setType] = useState<CredentialType>(initialData?.type || 'api');
  const [value, setValue] = useState(initialData?.value || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!value.trim()) {
      newErrors.value = 'Value is required';
    }
    
    setErrors(newErrors);
    
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    onSubmit({
      name,
      type,
      value,
      description: description.trim() || undefined,
      tags: tags.length > 0 ? tags : undefined,
    });
  };
  
  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };
  
  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };
  
  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Name"
        id="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="My API Key"
        fullWidth
        error={errors.name}
        required
      />
      
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Type
        </label>
        <select
          id="type"
          value={type}
          onChange={(e) => setType(e.target.value as CredentialType)}
          className="
            block w-full px-3 py-2 rounded-md border bg-white dark:bg-gray-800 
            text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          "
        >
          <option value="api">API Key</option>
          <option value="ssh">SSH Key</option>
          <option value="gpg">GPG Key</option>
          <option value="password">Password</option>
          <option value="other">Other</option>
        </select>
      </div>
      
      <div>
        <label htmlFor="value" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Value
        </label>
        <textarea
          id="value"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={
            type === 'api' 
              ? 'sk_live_123abc456def...' 
              : type === 'ssh' 
              ? '-----BEGIN OPENSSH PRIVATE KEY-----\n...\n-----END OPENSSH PRIVATE KEY-----' 
              : 'Enter value...'
          }
          rows={type === 'ssh' || type === 'gpg' ? 5 : 3}
          className={`
            block w-full px-3 py-2 rounded-md border 
            bg-white dark:bg-gray-800 
            text-gray-900 dark:text-gray-100
            font-mono text-sm
            border-gray-300 dark:border-gray-700
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            ${errors.value ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
          `}
          required
        ></textarea>
        {errors.value && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.value}</p>
        )}
      </div>
      
      <Input
        label="Description (optional)"
        id="description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="What this credential is for..."
        fullWidth
      />
      
      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Tags (optional)
        </label>
        <div className="flex">
          <Input
            id="tags"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Add a tag..."
            fullWidth
            onKeyDown={handleTagInputKeyDown}
          />
          <Button
            type="button"
            onClick={handleAddTag}
            disabled={!tagInput.trim()}
            className="ml-2"
          >
            Add
          </Button>
        </div>
        
        {tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="
                  inline-flex items-center text-sm px-2 py-1 rounded-full
                  bg-blue-50 dark:bg-blue-900/30 
                  text-blue-700 dark:text-blue-300
                "
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
      
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          {initialData ? 'Update' : 'Save'} Credential
        </Button>
      </div>
    </form>
  );
};

export default CredentialForm;