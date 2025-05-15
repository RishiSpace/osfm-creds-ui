import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import { useAuth } from '../../context/AuthContext';

const Layout: React.FC = () => {
  const { state: authState } = useAuth();

  if (!authState.isAuthenticated) {
    return <Outlet />;
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Sidebar />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex items-center md:hidden">
          <Header />
        </div>
        
        <div className="hidden md:block">
          <Header />
        </div>
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="md:hidden mb-4">
            <MobileNav />
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;