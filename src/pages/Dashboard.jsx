import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Package, 
  Users, 
  BarChart3, 
  FileText, 
  Settings, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { supabase } from '../supabaseClient.js';
import InventoryOverview from './InventoryOverview.jsx';
import RealTimeMonitoring from './dashboard/RealTimeMonitoring.jsx';
import InventoryManagement from './dashboard/InventoryManagement.jsx';
import StaffManagement from './dashboard/StaffManagement.jsx';
import MovementLogs from './dashboard/MovementLogs.jsx';
import ReportsAnalytics from './dashboard/ReportsAnalytics.jsx';
import ErrorBoundary from '../components/ErrorBoundary.jsx';
import './Dashboard.css';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();  // Add this line

  const navigation = [
    { name: 'Overview', href: '/dashboard', icon: BarChart3 },
    { name: 'Real-Time Monitoring', href: '/dashboard/monitoring', icon: Package },
    { name: 'Inventory Management', href: '/dashboard/inventory', icon: Package },
    { name: 'Staff Management', href: '/dashboard/staff', icon: Users },
    { name: 'Movement Logs', href: '/dashboard/logs', icon: FileText },
    { name: 'Reports & Analytics', href: '/dashboard/reports', icon: BarChart3 },
  ];

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = async () => {
    const { error } = await supabase.auth.signOut();
    setShowLogoutConfirm(false);
    if (!error) {
      navigate('/login');
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  const isActive = (href) => {
    if (href === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <ErrorBoundary>
      <div className="dashboard-container">
        {/* Logout Confirmation Modal */}
        {showLogoutConfirm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Confirm Logout</h3>
              <p>Are you sure you want to logout?</p>
              <div className="modal-buttons">
                <button onClick={handleLogoutCancel} className="cancel-btn">
                  Cancel
                </button>
                <button onClick={handleLogoutConfirm} className="confirm-btn">
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile sidebar toggle */}
        <div className="mobile-sidebar-toggle">
          <button onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Sidebar */}
        <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <h2>Inventory Portal</h2>
            <p>Admin Dashboard</p>
          </div>
          
          <nav className="sidebar-nav">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`nav-item ${isActive(item.href) ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon size={20} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="sidebar-footer">
            {user && (
              <div className="user-info">
                <p>{user.email}</p>
              </div>
            )}
            <button onClick={handleLogoutClick} className="logout-btn">
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="main-content">
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<InventoryOverview />} />
              <Route path="/monitoring" element={<RealTimeMonitoring />} />
              <Route path="/inventory" element={<InventoryManagement />} />
              <Route path="/staff" element={<StaffManagement />} />
              <Route path="/logs" element={<MovementLogs />} />
              <Route path="/reports" element={<ReportsAnalytics />} />
            </Routes>
          </ErrorBoundary>
        </div>
      </div>
    </ErrorBoundary>
  );
}