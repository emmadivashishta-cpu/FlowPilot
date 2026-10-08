import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateWorkflow from './pages/CreateWorkflow';
import WorkflowPreview from './pages/WorkflowPreview';
import Profile from './pages/Profile';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes with Layout */}
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/create" element={<CreateWorkflow />} />
            <Route path="/workflows/:id" element={<WorkflowPreview />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
