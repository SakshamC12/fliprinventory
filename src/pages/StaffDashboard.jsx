import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Package, 
  User,
  FileText, 
  Search,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import { supabase } from '../supabaseClient.js';
import './Dashboard.css';

// Import staff-specific page components
import StaffInventoryView from './staff/StaffInventoryView.jsx';
import StaffMovements from './staff/StaffMovements.jsx';
import StaffSearch from './staff/StaffSearch.jsx';
import StaffProfile from './staff/StaffProfile.jsx';

function StaffDashboard() {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    { name: 'Inventory View', href: '/staff-dashboard', icon: Package },
    { name: 'Stock Movements', href: '/staff-dashboard/movements', icon: FileText },
    { name: 'Search & Filter', href: '/staff-dashboard/search', icon: Search },
    { name: 'My Profile', href: '/staff-dashboard/profile', icon: User },
  ];

  const isActive = (href) => {
    if (href === '/staff-dashboard') {
      return location.pathname === '/staff-dashboard';
    }
    return location.pathname.startsWith(href);
  };

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

  const [movementStats, setMovementStats] = useState({
    inMovements: 0,
    outMovements: 0,
  });

  useEffect(() => {
    fetchMovementStats();
  }, []);

  const fetchMovementStats = async () => {
    try {
      const staffData = JSON.parse(sessionStorage.getItem('staffData'));
      if (!staffData) return;

      // Fetch IN movements count
      const { count: inCount } = await supabase
        .from('stock_movements')
        .select('*', { count: 'exact' })
        .eq('staff_id', staffData.id)
        .eq('movement_type', 'IN');

      // Fetch OUT movements count
      const { count: outCount } = await supabase
        .from('stock_movements')
        .select('*', { count: 'exact' })
        .eq('staff_id', staffData.id)
        .eq('movement_type', 'OUT');

      setMovementStats({
        inMovements: inCount || 0,
        outMovements: outCount || 0,
      });
    } catch (error) {
      console.error('Error fetching movement stats:', error);
    }
  };

  return (
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
          <p>Staff Dashboard</p>
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
        <Routes>
          <Route index element={<>
            <StaffInventoryView />
            <div className="movement-stats">
              <h3>My Movement Statistics</h3>
              <Bar
                data={{
                  labels: ['Stock In', 'Stock Out'],
                  datasets: [{
                    label: 'Movement Count',
                    data: [movementStats.inMovements, movementStats.outMovements],
                    backgroundColor: ['#2ecc71', '#e74c3c'],
                  }],
                }}
                options={{
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 1
                      }
                    }
                  }
                }}
              />
            </div>
          </>} />
          <Route path="movements" element={<StaffMovements />} />
          <Route path="search" element={<StaffSearch />} />
          <Route path="profile" element={<StaffProfile />} />
        </Routes>
      </div>
    </div>
  );
}

export default StaffDashboard;