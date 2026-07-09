import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { LayoutDashboard, Users, LogOut, Shield } from 'lucide-react';
import styles from './Admin.module.css';

export default function AdminLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  useEffect(() => {
    // Simple check for token existence. Real validation happens on API calls.
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  // While checking auth state, return null to avoid flash of content
  if (isAuthenticated === null) return null;

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const username = localStorage.getItem('adminUser') || 'Admin';

  return (
    <div className={styles.adminContainer}>
      <Helmet>
        <title>Admin Dashboard - ViteNest</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.sidebarLogo}>
            <Shield className="text-gradient" size={28} />
            <span>ViteNest Admin</span>
          </div>
        </div>

        <nav className={styles.navLinks}>
          <Link 
            to="/admin" 
            className={`${styles.navItem} ${currentPath === '/admin' ? styles.active : ''}`}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </Link>
          <Link 
            to="/admin/users" 
            className={`${styles.navItem} ${currentPath === '/admin/users' ? styles.active : ''}`}
          >
            <Users size={20} />
            Users
          </Link>
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ padding: '0 16px', marginBottom: '16px', color: '#94a3b8', fontSize: '0.875rem' }}>
            Logged in as <strong style={{color: '#f8fafc'}}>{username}</strong>
          </div>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  );
}
