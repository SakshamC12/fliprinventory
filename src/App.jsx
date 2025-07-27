import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient.js';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import StaffDashboard from './pages/StaffDashboard.jsx';
import AdminStaffManagement from './pages/AdminStaffManagement.jsx';

function PrivateRoute({ children, requiredRole }) {
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      // Check for admin authentication first
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profile?.role) {
          setUserRole(profile.role);
          setLoading(false);
          return;
        }
      }

      // Check for staff session if no admin auth
      const staffSession = localStorage.getItem('staff_session');
      if (staffSession) {
        const staff = JSON.parse(staffSession);
        if (staff.role === 'staff') {
          setUserRole('staff');
          setLoading(false);
          return;
        }
      }

      setUserRole(null);
      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) return <div>Loading...</div>;
  
  if (!userRole) return <Navigate to="/login" />;
  
  if (requiredRole && userRole !== requiredRole) {
    if (userRole === 'admin') return <Navigate to="/dashboard" />;
    if (userRole === 'staff') return <Navigate to="/staff-dashboard" />;
    return <Navigate to="/login" />;
  }
  
  return children;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard/*" element={  // Changed from /dashboard to /dashboard/* to handle nested routes
          <PrivateRoute requiredRole="admin">
            <Dashboard />
          </PrivateRoute>
        } />
        <Route path="/staff-dashboard" element={
          <PrivateRoute requiredRole="staff">
            <StaffDashboard />
          </PrivateRoute>
        } />
        <Route path="/admin/staff-management" element={
          <PrivateRoute requiredRole="admin">
            <AdminStaffManagement />
          </PrivateRoute>
        } />
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}
