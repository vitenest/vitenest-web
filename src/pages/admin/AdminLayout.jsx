import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { LayoutDashboard, Users, LogOut, Shield, Grid, Globe, Smartphone, Sun, Moon } from 'lucide-react';
import styles from './Admin.module.css';
import { useTheme } from '../../context/ThemeContext';

export default function AdminLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const { theme, toggleTheme } = useTheme();

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

          <div className={styles.navSection}>Content</div>

          <Link 
            to="/admin/websites" 
            className={`${styles.navItem} ${currentPath === '/admin/websites' ? styles.active : ''}`}
          >
            <Globe size={20} />
            Websites
          </Link>
          <Link 
            to="/admin/android-apps" 
            className={`${styles.navItem} ${currentPath === '/admin/android-apps' ? styles.active : ''}`}
          >
            <Smartphone size={20} />
            Android Apps
          </Link>
          <Link 
            to="/admin/categories" 
            className={`${styles.navItem} ${currentPath === '/admin/categories' ? styles.active : ''}`}
          >
            <Grid size={20} />
            Categories
          </Link>

          <div className={styles.navSection}>Settings</div>

          <Link 
            to="/admin/users" 
            className={`${styles.navItem} ${currentPath === '/admin/users' ? styles.active : ''}`}
          >
            <Users size={20} />
            Admin Users
          </Link>
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid var(--overlay-light)' }}>
          <div style={{ padding: '0 16px', marginBottom: '16px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Logged in as <strong style={{color: 'var(--text-main)'}}>{username}</strong>
          </div>
          <button onClick={toggleTheme} className={styles.logoutBtn} style={{ marginBottom: '8px', color: 'var(--text-main)' }}>
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            {theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          </button>
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
