import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Shield } from 'lucide-react';
import styles from './Admin.module.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, adminUsers: 0, editorUsers: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const res = await fetch('/api/admin/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!res.ok) throw new Error('Failed to fetch stats');
        
        const data = await res.json();
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className={styles.animateFadeIn}>
      <header className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Dashboard Overview</h1>
          <p style={{ color: '#94a3b8', marginTop: '8px' }}>Welcome back to your admin portal.</p>
        </div>
      </header>

      {error && <div className={styles.errorMsg}>{error}</div>}

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <span className={styles.statLabel}>Total Users</span>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '12px' }}>
              <Users size={24} color="#f8fafc" />
            </div>
          </div>
          <div className={styles.statValue}>{isLoading ? '-' : stats.totalUsers}</div>
        </div>

        <div className={styles.statCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <span className={styles.statLabel}>Administrators</span>
            <div style={{ background: 'rgba(124, 58, 237, 0.1)', padding: '10px', borderRadius: '12px' }}>
              <Shield size={24} color="#a78bfa" />
            </div>
          </div>
          <div className={styles.statValue}>{isLoading ? '-' : stats.adminUsers}</div>
        </div>

        <div className={styles.statCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <span className={styles.statLabel}>Editors</span>
            <div style={{ background: 'rgba(2, 132, 199, 0.1)', padding: '10px', borderRadius: '12px' }}>
              <UserPlus size={24} color="#7dd3fc" />
            </div>
          </div>
          <div className={styles.statValue}>{isLoading ? '-' : stats.editorUsers}</div>
        </div>
      </div>
      
      <div className={styles.glassPanel} style={{ padding: '32px' }}>
         <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: '16px' }}>Recent Activity</h2>
         <p style={{ color: '#94a3b8' }}>System is running smoothly. Analytics and activity logs will appear here in a future update.</p>
      </div>
    </div>
  );
}
