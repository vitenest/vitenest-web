import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import * as LucideIcons from 'lucide-react';
import { Search, ExternalLink } from 'lucide-react';
import styles from './Home.module.css';

const DynamicIcon = ({ name, size = 24, className }) => {
  const IconComponent = LucideIcons[name] || LucideIcons['FileText'];
  return <IconComponent size={size} className={className} />;
};

export default function ToolCatalog() {
  const [apps, setApps] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeSection, setActiveSection] = useState('All');
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

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
      setIsLoading(false);
    });
  }, []);

  // Filtering logic
  const filteredApps = apps.filter(app => {
    const matchesSection = activeSection === 'All' || app.section === activeSection;
    const matchesCategory = activeCategory === 'All' || app.categoryId === activeCategory;
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          app.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSection && matchesCategory && matchesSearch;
  });

  const availableCategories = categories.filter(c => activeSection === 'All' || c.section === activeSection);

  return (
    <>
      <Helmet><title>Explore Tools & Apps | ViteNest</title></Helmet>
      
      <main style={{ paddingTop: '120px', minHeight: '80vh', paddingBottom: '80px' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', marginBottom: '16px' }}>Explore the Ecosystem</h1>
            <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
              Discover our collection of free websites, tools, and Android applications.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '48px' }}>
            
            {/* Search Bar */}
            <div className={styles.searchBar} style={{ margin: '0 auto' }}>
              <Search className={styles.searchIcon} />
              <input 
                type="text" 
                placeholder="Search tools and apps..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Section Filters */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
              {['All', 'Website', 'Android App'].map(section => (
                <button
                  key={section}
                  onClick={() => {
                    setActiveSection(section);
                    setActiveCategory('All');
                  }}
                  className="btn-secondary"
                  style={{
                    background: activeSection === section ? 'rgba(2, 132, 199, 0.2)' : 'transparent',
                    borderColor: activeSection === section ? 'var(--neon-blue)' : 'var(--glass-border-strong)',
                    color: activeSection === section ? 'var(--neon-blue)' : 'var(--text-main)',
                  }}
                >
                  {section}s
                </button>
              ))}
            </div>

            {/* Category Filters */}
            {availableCategories.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setActiveCategory('All')}
                  style={{
                    padding: '6px 16px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)',
                    background: activeCategory === 'All' ? 'rgba(255,255,255,0.1)' : 'transparent',
                    color: activeCategory === 'All' ? 'white' : '#94a3b8', cursor: 'pointer'
                  }}
                >
                  All Categories
                </button>
                {availableCategories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    style={{
                      padding: '6px 16px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)',
                      background: activeCategory === cat.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                      color: activeCategory === cat.id ? 'white' : '#94a3b8', cursor: 'pointer'
                    }}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>Loading apps...</div>
          ) : (
            <div className={styles.productGrid}>
              {filteredApps.map((app) => (
                <Link 
                  key={app.id} 
                  to={`/app/${app.appSlug}`} 
                  className={`glass-panel ${styles.toolCard}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div className={styles.toolIconWrapper}>
                    {app.icon && app.icon.startsWith('http') ? (
                      <img src={app.icon} alt={app.name} style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                    ) : (
                      <DynamicIcon name={app.icon} size={24} />
                    )}
                  </div>
                  <h3>{app.name}</h3>
                  <p style={{ height: '48px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {app.description}
                  </p>
                  <div className={styles.toolFooter}>
                    <span className={styles.toolUsers} style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)' }}>
                      {app.section}
                    </span>
                    <div className={styles.launchBtn} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      Details
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!isLoading && filteredApps.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8', background: 'rgba(255,255,255,0.02)', borderRadius: '16px' }}>
              No apps found matching your filters.
            </div>
          )}
        </div>
      </main>
    </>
  );
}
