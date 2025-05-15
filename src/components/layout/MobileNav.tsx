import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Download, 
  Home, 
  Key, 
  Lock, 
  Menu, 
  Shield, 
  Terminal, 
  Upload, 
  X 
} from 'lucide-react';
import Button from '../ui/Button';
import { useCredentials } from '../../context/CredentialsContext';

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

const MobileNav: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { setFilterType } = useCredentials();
  
  const mainItems: NavItem[] = [
    {
      name: 'Dashboard',
      path: '/',
      icon: <Home className="h-5 w-5" />,
    },
    {
      name: 'Import/Export',
      path: '/import-export',
      icon: <div className="flex"><Download className="h-5 w-5 mr-1" /><Upload className="h-5 w-5" /></div>,
    },
  ];
  
  const categoryItems: NavItem[] = [
    {
      name: 'API Keys',
      path: '/?type=api',
      icon: <Key className="h-5 w-5" />,
    },
    {
      name: 'SSH Keys',
      path: '/?type=ssh',
      icon: <Terminal className="h-5 w-5" />,
    },
    {
      name: 'GPG Keys',
      path: '/?type=gpg',
      icon: <Shield className="h-5 w-5" />,
    },
    {
      name: 'Passwords',
      path: '/?type=password',
      icon: <Lock className="h-5 w-5" />,
    },
  ];
  
  const handleNavigation = (path: string, type?: string) => {
    if (type) {
      setFilterType(type as any);
    }
    navigate(path);
    setIsOpen(false);
  };
  
  const isActive = (path: string): boolean => {
    if (path === '/') {
      return location.pathname === '/' && !location.search;
    }
    
    if (path.includes('?type=')) {
      const pathWithoutQuery = path.split('?')[0];
      const queryParam = path.split('?type=')[1];
      return location.pathname === pathWithoutQuery && location.search === `?type=${queryParam}`;
    }
    
    return location.pathname === path;
  };

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        aria-label="Menu"
        onClick={() => setIsOpen(true)}
        className="p-2"
      >
        <Menu className="h-6 w-6" />
      </Button>
      
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-sm">
          <div className="fixed inset-y-0 right-0 w-full max-w-xs bg-white dark:bg-gray-900 shadow-xl">
            <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center">
                <Key className="h-6 w-6 text-blue-600 dark:text-blue-500 mr-2" />
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  OSFM Creds
                </h2>
              </div>
              <Button
                variant="ghost"
                aria-label="Close menu"
                onClick={() => setIsOpen(false)}
                className="p-2"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <nav className="p-4 space-y-6">
              <div>
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  Main
                </h3>
                <ul className="space-y-1">
                  {mainItems.map((item) => (
                    <li key={item.name}>
                      <button
                        onClick={() => handleNavigation(item.path)}
                        className={`
                          flex items-center w-full px-3 py-2 text-sm font-medium rounded-md
                          transition-colors duration-150 ease-in-out
                          ${
                            isActive(item.path)
                              ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200'
                              : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800/50'
                          }
                        `}
                      >
                        <span className="mr-3">{item.icon}</span>
                        {item.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  Categories
                </h3>
                <ul className="space-y-1">
                  {categoryItems.map((item) => (
                    <li key={item.name}>
                      <button
                        onClick={() => handleNavigation(item.path, item.path.split('=')[1])}
                        className={`
                          flex items-center w-full px-3 py-2 text-sm font-medium rounded-md
                          transition-colors duration-150 ease-in-out
                          ${
                            isActive(item.path)
                              ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200'
                              : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800/50'
                          }
                        `}
                      >
                        <span className="mr-3">{item.icon}</span>
                        {item.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                <button
                  onClick={() => {
                    handleNavigation('/settings');
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800/50"
                >
                  <span className="mr-3">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </span>
                  Settings
                </button>
              </div>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileNav;