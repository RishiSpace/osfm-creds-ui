import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CredentialsProvider } from './context/CredentialsContext';
import { SettingsProvider } from './context/SettingsContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import ImportExport from './pages/ImportExport';
import Auth from './pages/Auth';
import { initGoogleApi } from './services/googleDrive';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { state } = useAuth();
  
  if (!state.isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  // Initialize Google API - moved inside the component
  useEffect(() => {
    initGoogleApi();
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <SettingsProvider>
          <CredentialsProvider>
            <Router>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/" element={<Layout />}>
                  <Route index element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="settings" element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  } />
                  <Route path="import-export" element={
                    <ProtectedRoute>
                      <ImportExport />
                    </ProtectedRoute>
                  } />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Router>
          </CredentialsProvider>
        </SettingsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;