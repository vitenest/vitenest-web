import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { LayoutGrid, Smartphone, Globe, Puzzle } from 'lucide-react';
import styles from './Categories.module.css';

export default function Categories() {
  const [activeCategory, setActiveCategory] = useState('All Categories');
  const [activeTab, setActiveTab] = useState('Websites');

  const categoriesList = [
    'All Categories',
    'Productivity',
    'Developer Tools',
    'AI Utilities',
    'Media Editors',
    'Finance',
    'Health & Fitness'
  ];

  const tabs = [
    { id: 'Websites', icon: <Globe size={18} /> },
    { id: 'Mobile Apps', icon: <Smartphone size={18} /> },
    { id: 'Chrome Extensions', icon: <Puzzle size={18} /> },
  ];

  // Mock data representing apps, websites, and extensions
  const mockTools = [
    { name: 'VitePDF', category: 'Productivity', type: 'Websites', desc: 'Compress, merge, and split PDFs entirely in your browser.' },
    { name: 'JsonFormatter', category: 'Developer Tools', type: 'Websites', desc: 'Beautify and validate JSON data instantly.' },
    { name: 'ViteTasks', category: 'Productivity', type: 'Mobile Apps', desc: 'Manage your tasks on the go with zero ads.' },
    { name: 'ColorPicker Pro', category: 'Developer Tools', type: 'Chrome Extensions', desc: 'Pick colors from any webpage instantly.' },
    { name: 'AI Resume Builder', category: 'AI Utilities', type: 'Websites', desc: 'Generate professional resumes tailored to job descriptions.' },
    { name: 'ExpenseTracker', category: 'Finance', type: 'Mobile Apps', desc: 'Track your daily expenses securely.' },
    { name: 'ImageResizer', category: 'Media Editors', type: 'Websites', desc: 'Batch resize and crop images without uploading.' },
    { name: 'TabManager', category: 'Productivity', type: 'Chrome Extensions', desc: 'Organize and group your Chrome tabs easily.' },
    { name: 'Workout Buddy', category: 'Health & Fitness', type: 'Mobile Apps', desc: 'Track your reps and sets offline.' },
  ];

  const filteredTools = mockTools.filter(tool => {
    const categoryMatch = activeCategory === 'All Categories' || tool.category === activeCategory;
    const tabMatch = tool.type === activeTab;
    return categoryMatch && tabMatch;
  });

  return (
    <>
      <Helmet><title>Categories | ViteNest</title></Helmet>
      <main className="container" style={{paddingTop: '120px', minHeight: '80vh', paddingBottom: '80px'}}>
        <div style={{marginBottom: '40px'}}>
          <h1 className="text-gradient">Explore Ecosystem</h1>
          <p style={{color: 'var(--text-muted)', fontSize: '1.1rem'}}>Browse our massive collection of free tools by category and platform.</p>
        </div>

        <div className={styles.layout}>
          {/* Sidebar Categories */}
          <aside className={styles.sidebar}>
            {categoriesList.map(cat => (
              <button 
                key={cat}
                className={`${styles.categoryBtn} ${activeCategory === cat ? styles.active : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
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
                  {tab.icon} {tab.id}
                </button>
              ))}
            </div>

            {filteredTools.length > 0 ? (
              <div className={styles.toolsGrid}>
                {filteredTools.map((tool, idx) => (
                  <div key={idx} className={`glass-panel ${styles.toolCard}`}>
                    <span className={styles.toolType}>{tool.category}</span>
                    <h3>{tool.name}</h3>
                    <p>{tool.desc}</p>
                    <button className={styles.launchBtn}>
                      {activeTab === 'Websites' ? 'Launch Web App' : activeTab === 'Mobile Apps' ? 'Download App' : 'Add to Chrome'}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.noResults}>
                <LayoutGrid size={48} style={{opacity: 0.2, margin: '0 auto 16px'}} />
                <h3>No tools found</h3>
                <p>We haven't built a {activeTab.slice(0, -1).toLowerCase()} for {activeCategory} yet.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
