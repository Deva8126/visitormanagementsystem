import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EntryForm from './pages/EntryForm';
import History from './pages/History';
import Exit from './pages/Exit';
import Settings from './pages/Settings';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Unprotected Auth Page */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected Receptionist & Admin Modules */}
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute allowedRoles={['admin', 'receptionist']}>
              <Layout>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          } 
        />
        
        <Route 
          path="/entry" 
          element={
            <PrivateRoute allowedRoles={['admin', 'receptionist']}>
              <Layout>
                <EntryForm />
              </Layout>
            </PrivateRoute>
          } 
        />
        
        <Route 
          path="/history" 
          element={
            <PrivateRoute allowedRoles={['admin', 'receptionist']}>
              <Layout>
                <History />
              </Layout>
            </PrivateRoute>
          } 
        />
        
        <Route 
          path="/exit" 
          element={
            <PrivateRoute allowedRoles={['admin', 'receptionist']}>
              <Layout>
                <Exit />
              </Layout>
            </PrivateRoute>
          } 
        />

        {/* Admin-only Config Module */}
        <Route 
          path="/settings" 
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <Layout>
                <Settings />
              </Layout>
            </PrivateRoute>
          } 
        />

        {/* Dynamic Fallback Catch-all Route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
