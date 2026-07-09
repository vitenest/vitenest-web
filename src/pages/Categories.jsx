import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { LayoutGrid, Smartphone, Globe, ExternalLink, ArrowLeft } from 'lucide-react';
import styles from './Categories.module.css';

export default function Categories() {
  const [apps, setApps] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 'All' | 'Website' | 'Android App'
  const [activeTab, setActiveTab] = useState('All');
  // null = show categories grid, otherwise the selected category id
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/apps').then(res => res.json()),
      fetch('/api/categories').then(res => res.json())
    ])
    .then(([appsData, catsData]) => {
      setApps(appsData);
      setCategories(catsData);
      setIsLoading(false);
    })
    .catch(() => setIsLoading(false));
  }, []);

  const tabs = [
    { id: 'All', label: 'All Categories', icon: <LayoutGrid size={18} /> },
    { id: 'Website', label: 'Websites', icon: <Globe size={18} /> },
    { id: 'Android App', label: 'Android Apps', icon: <Smartphone size={18} /> },
  ];

  // Categories visible in the current tab
  const visibleCategories = categories.filter(cat =>
    activeTab === 'All' ? true : cat.section === activeTab
  );

  // Apps in the selected category
  const appsInCategory = selectedCategory
    ? apps.filter(app => app.categoryId === selectedCategory)
    : [];

  const selectedCategoryName = categories.find(c => c.id === selectedCategory)?.name;

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSelectedCategory(null);
  };

  // Count apps in each category
  const appCountForCategory = (catId) =>
    apps.filter(a => a.categoryId === catId).length;

  return (
    <>
      <Helmet><title>Categories | ViteNest</title></Helmet>
      <main className="container" style={{ paddingTop: '120px', minHeight: '80vh', paddingBottom: '80px' }}>
        <div style={{ marginBottom: '48px' }}>
          <h1 className="text-gradient">Explore Ecosystem</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
            Browse our collection of free tools by category and platform.
          </p>
        </div>

        {/* Section Tabs */}
        <div className={styles.tabs} style={{ marginBottom: '40px' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`${styles.tab} ${activeTab === tab.id ? styles.activeTab : ''}`}
              onClick={() => handleTabChange(tab.id)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>Loading...</div>
        ) : selectedCategory ? (
          /* ── Apps in selected category ── */
          <div>
            <button
              onClick={() => setSelectedCategory(null)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: 'transparent', border: 'none', color: 'var(--neon-blue)',
                cursor: 'pointer', fontSize: '0.95rem', marginBottom: '32px', padding: 0
              }}
            >
              <ArrowLeft size={18} /> Back to Categories
            </button>

            <h2 style={{ marginBottom: '24px', fontFamily: 'var(--font-display)' }}>
              {selectedCategoryName}
            </h2>

            {appsInCategory.length > 0 ? (
              <div className={styles.toolsGrid}>
                {appsInCategory.map(app => (
                  <div key={app.id} className={`glass-panel ${styles.toolCard}`}>
                    <span className={styles.toolType}>{app.section}</span>
                    <h3>{app.name}</h3>
                    <p>{app.description}</p>
                    <a
                      href={app.link}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.launchBtn}
                      style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                      {app.section === 'Website' ? 'Launch Web App' : 'Download App'}
                      <ExternalLink size={16} />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.noResults}>
                <LayoutGrid size={48} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
                <h3>No apps yet</h3>
                <p>No apps have been added to this category yet.</p>
              </div>
            )}
          </div>
        ) : (
          /* ── Category Cards Grid ── */
          visibleCategories.length > 0 ? (
            <div className={styles.categoryCardsGrid}>
              {visibleCategories.map(cat => (
                <button
                  key={cat.id}
                  className={`glass-panel ${styles.categoryCard}`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  <div className={styles.catIconWrapper}>
                    {cat.section === 'Website' ? <Globe size={28} /> : <Smartphone size={28} />}
                  </div>
                  <h3>{cat.name}</h3>
                  <p className={styles.catMeta}>
                    {appCountForCategory(cat.id)} app{appCountForCategory(cat.id) !== 1 ? 's' : ''} · {cat.section}
                  </p>
                </button>
              ))}
            </div>
          ) : (
            <div className={styles.noResults}>
              <LayoutGrid size={48} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
              <h3>No categories found</h3>
              <p>Add categories from the admin panel to see them here.</p>
            </div>
          )
        )}
      </main>
    </>
  );
}
