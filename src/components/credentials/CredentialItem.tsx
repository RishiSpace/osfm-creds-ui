import React, { useState } from 'react';
import { 
  Clipboard, 
  Eye, 
  EyeOff, 
  Key, 
  Lock, 
  PenSquare, 
  Shield, 
  Terminal, 
  Trash2 
} from 'lucide-react';
import { Credential } from '../../types';
import { formatDate, copyToClipboard } from '../../utils';
import Button from '../ui/Button';

interface CredentialItemProps {
  credential: Credential;
  onEdit: (credential: Credential) => void;
  onDelete: (id: string) => void;
}

const CredentialItem: React.FC<CredentialItemProps> = ({
  credential,
  onEdit,
  onDelete,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const handleCopy = async () => {
    const success = await copyToClipboard(credential.value);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  const getIcon = () => {
    switch (credential.type) {
      case 'api':
        return <Key className="h-5 w-5 text-blue-500" />;
      case 'ssh':
        return <Terminal className="h-5 w-5 text-purple-500" />;
      case 'gpg':
        return <Shield className="h-5 w-5 text-green-500" />;
      case 'password':
        return <Lock className="h-5 w-5 text-red-500" />;
      default:
        return <Key className="h-5 w-5 text-gray-500" />;
    }
  };
  
  const getTypeLabel = () => {
    switch (credential.type) {
      case 'api':
        return 'API Key';
      case 'ssh':
        return 'SSH Key';
      case 'gpg':
        return 'GPG Key';
      case 'password':
        return 'Password';
      default:
        return 'Other';
    }
  };
  
  const getCredentialPreview = () => {
    if (isVisible) {
      return credential.value;
    }
    
    if (credential.type === 'ssh' || credential.type === 'gpg') {
      return credential.value.length > 50
        ? '••••••••••••••••••••••••••••••••••••••••••••••••••••'
        : '•'.repeat(credential.value.length);
    }
    
    return '•'.repeat(Math.min(credential.value.length, 20));
  };

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            {getIcon()}
            <h3 className="ml-2 text-lg font-medium text-gray-900 dark:text-white">
              {credential.name}
            </h3>
          </div>
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
            {getTypeLabel()}
          </span>
        </div>
        
        {credential.description && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 mb-3">
            {credential.description}
          </p>
        )}
        
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Value:
            </p>
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(!isVisible)}
                aria-label={isVisible ? 'Hide value' : 'Show value'}
              >
                {isVisible ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                aria-label="Copy to clipboard"
              >
                <Clipboard className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="mt-1 p-2 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 relative">
            <pre className="text-sm whitespace-pre-wrap break-all font-mono text-gray-800 dark:text-gray-200">
              {getCredentialPreview()}
            </pre>
            {copied && (
              <span className="absolute -top-1 right-0 px-2 py-1 bg-green-500 text-white text-xs rounded-full transform translate-x-1/2 -translate-y-1/2">
                Copied!
              </span>
            )}
          </div>
        </div>
        
        {credential.tags && credential.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {credential.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs font-medium px-2 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        
        <div className="mt-4 flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Updated: {formatDate(credential.updatedAt)}
          </p>
          
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(credential)}
              aria-label="Edit"
            >
              <PenSquare className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(credential.id)}
              aria-label="Delete"
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CredentialItem;