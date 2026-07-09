import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { LayoutGrid, Smartphone, Globe, ExternalLink } from 'lucide-react';
import styles from './Categories.module.css';

export default function Categories() {
  const [apps, setApps] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeCategory, setActiveCategory] = useState('All Categories');
  // 'All', 'Website', 'Android App'
  const [activeTab, setActiveTab] = useState('All');

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
    .catch(err => {
      console.error('Failed to fetch data:', err);
      setError('Failed to load data. Please try again later.');
      setIsLoading(false);
    });
  }, []);

  const tabs = [
    { id: 'All', label: 'All', icon: <LayoutGrid size={18} /> },
    { id: 'Website', label: 'Websites', icon: <Globe size={18} /> },
    { id: 'Android App', label: 'Android Apps', icon: <Smartphone size={18} /> },
  ];

  // Filter categories for the sidebar based on the active tab
  const sidebarCategories = categories.filter(cat => 
    activeTab === 'All' ? true : cat.section === activeTab
  );

  // When tab changes, if the current active category isn't in the new list, reset to 'All Categories'
  useEffect(() => {
    if (activeCategory !== 'All Categories') {
      const categoryExists = sidebarCategories.find(c => c.id === activeCategory);
      if (!categoryExists) {
        setActiveCategory('All Categories');
      }
    }
  }, [activeTab, sidebarCategories, activeCategory]);

  // Filter apps based on active tab and category
  const filteredApps = apps.filter(app => {
    const tabMatch = activeTab === 'All' || app.section === activeTab;
    const categoryMatch = activeCategory === 'All Categories' || app.categoryId === activeCategory;
    return tabMatch && categoryMatch;
  });

  return (
    <>
      <Helmet><title>Categories | ViteNest</title></Helmet>
      <main className="container" style={{paddingTop: '120px', minHeight: '80vh', paddingBottom: '80px'}}>
        <div style={{marginBottom: '40px'}}>
          <h1 className="text-gradient">Explore Ecosystem</h1>
          <p style={{color: 'var(--text-muted)', fontSize: '1.1rem'}}>Browse our massive collection of free tools by category and platform.</p>
        </div>

        {error ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#f87171' }}>{error}</div>
        ) : (
          <div className={styles.layout}>
            {/* Sidebar Categories */}
            <aside className={styles.sidebar}>
              <button 
                className={`${styles.categoryBtn} ${activeCategory === 'All Categories' ? styles.active : ''}`}
                onClick={() => setActiveCategory('All Categories')}
              >
                All Categories
              </button>
              {sidebarCategories.map(cat => (
                <button 
                  key={cat.id}
                  className={`${styles.categoryBtn} ${activeCategory === cat.id ? styles.active : ''}`}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  {cat.name}
                </button>
              ))}
            </aside>

            {/* Main Content & Tabs */}
            <div className={styles.mainContent}>
              <div className={styles.tabs}>
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    className={`${styles.tab} ${activeTab === tab.id ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                    style={{display: 'flex', alignItems: 'center', gap: '8px'}}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>

              {isLoading ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>Loading tools...</div>
              ) : filteredApps.length > 0 ? (
                <div className={styles.toolsGrid}>
                  {filteredApps.map((app) => {
                    const catName = categories.find(c => c.id === app.categoryId)?.name || 'Uncategorized';
                    return (
                      <div key={app.id} className={`glass-panel ${styles.toolCard}`}>
                        <span className={styles.toolType}>{catName}</span>
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
                    );
                  })}
                </div>
              ) : (
                <div className={styles.noResults}>
                  <LayoutGrid size={48} style={{opacity: 0.2, margin: '0 auto 16px'}} />
                  <h3>No tools found</h3>
                  <p>We haven't added any apps matching these filters yet.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
