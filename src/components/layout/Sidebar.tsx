import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Download, 
  Home, 
  Key, 
  Lock, 
  Settings, 
  Shield, 
  Terminal, 
  Upload
} from 'lucide-react';
import { useCredentials } from '../../context/CredentialsContext';

interface SidebarItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setFilterType } = useCredentials();
  
  const mainItems: SidebarItem[] = [
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
    {
      name: 'Settings',
      path: '/settings',
      icon: <Settings className="h-5 w-5" />,
    },
  ];
  
  const categoryItems: SidebarItem[] = [
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
    <aside className="hidden md:block w-64 bg-white/50 dark:bg-dark-bg/50 backdrop-blur-md border-r border-gray-200 dark:border-dark-border h-screen sticky top-0">
      <div className="px-6 py-6">
        <div className="flex items-center mb-8">
          <Key className="h-8 w-8 text-blue-600 dark:text-blue-500 mr-3" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            OSFM Creds
          </h1>
        </div>
        
        <nav className="space-y-6">
          <div>
            <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Main
            </h2>
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
            <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Categories
            </h2>
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
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;