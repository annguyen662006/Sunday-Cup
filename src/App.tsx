/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import React, { useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Matches } from './pages/Matches';
import { Statistics } from './pages/Statistics';
import { Teams } from './pages/Teams';
import { Login } from './pages/Login';
import { Admin } from './pages/Admin';
import { useStore } from './store/useStore';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { supabase } from './lib/supabase';

function ProtectedRoute({ children, requireAdmin = false }: { children: React.ReactNode, requireAdmin?: boolean }) {
  const currentUser = useStore(state => state.currentUser);
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && currentUser.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  const fetchData = useStore(state => state.fetchData);
  const isLoading = useStore(state => state.isLoading);
  const isDarkMode = useStore(state => state.isDarkMode);
  const currentUser = useStore(state => state.currentUser);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (!currentUser) return;

    const interval = setInterval(async () => {
      try {
        await supabase.rpc('increment_user_time', {
          p_user_id: currentUser.id,
          p_seconds: 30
        });
      } catch (err) {
        console.error('Error updating user time:', err);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [currentUser]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      {currentUser?.is_first_login && <ChangePasswordModal />}
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="login" element={
            currentUser ? <Navigate to="/" replace /> : <Login />
          } />
          <Route path="statistics" element={<Statistics />} />
          <Route path="matches" element={
            <ProtectedRoute>
              <Matches />
            </ProtectedRoute>
          } />
          <Route path="teams" element={
            <ProtectedRoute>
              <Teams />
            </ProtectedRoute>
          } />
          <Route path="admin" element={
            <ProtectedRoute requireAdmin>
              <Admin />
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
