import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop.jsx';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Dashboard from './pages/StudentDashboard.jsx';
import AdminDashboard from './pages/AdminDashboard';
import StaffDashboard from './pages/StaffDashboard';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Login Page - Public */}
        <Route path="/" element={<Home />} />

        {/* Student Dashboard - Protected */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute 
              element={<Dashboard />} 
              allowedRoles={['student']}
            />
          } 
        />

        {/* Admin Dashboard - Protected */}
        <Route 
          path="/admin-dashboard" 
          element={
            <ProtectedRoute 
              element={<AdminDashboard />} 
              allowedRoles={['admin']}
            />
          } 
        />

        {/* Staff Dashboard - Protected */}
        <Route 
          path="/staff-dashboard" 
          element={
            <ProtectedRoute 
              element={<StaffDashboard />} 
              allowedRoles={['staff']}
            />
          } 
        />

        {/* 404 Page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  )
}

export default App
