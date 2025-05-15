import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Key, Moon, Settings, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';

const Header: React.FC = () => {
  const { state: themeState, toggleDarkMode } = useTheme();
  const { state: authState, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 dark:border-gray-800 backdrop-blur-md bg-white/75 dark:bg-gray-900/75">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Key className="h-6 w-6 text-blue-600 dark:text-blue-500 mr-2" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            OSFM Creds
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          {authState.isAuthenticated && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleDarkMode()}
                aria-label={themeState.darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {themeState.darkMode ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/settings')}
                aria-label="Settings"
              >
                <Settings className="h-5 w-5" />
              </Button>
              
              <Button
                variant="secondary"
                size="sm"
                onClick={() => logout()}
              >
                Logout
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;