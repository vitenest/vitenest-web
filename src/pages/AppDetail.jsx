import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, ExternalLink, ShieldCheck, FileText, Smartphone, Globe, Calendar, Layers } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import styles from './AppDetail.module.css';

const DynamicIcon = ({ name, size = 24, className }) => {
  const IconComponent = LucideIcons[name] || LucideIcons['FileText'];
  return <IconComponent size={size} className={className} />;
};

export default function AppDetail() {
  const { appSlug } = useParams();
  const [app, setApp] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImage, setActiveImage] = useState(null);

  useEffect(() => {
    // Fetch details for the current app
    fetch(`/api/apps/${appSlug}`)
      .then(res => {
        if (!res.ok) throw new Error('App not found');
        return res.json();
      })
      .then(appData => {
        setApp(appData);
        // Fetch categories to find the name of this app's category
        return fetch('/api/categories')
          .then(res => res.json())
          .then(cats => {
            const cat = cats.find(c => c.id === appData.categoryId);
            if (cat) setCategoryName(cat.name);
            setIsLoading(false);
          });
      })
      .catch(err => {
        console.error(err);
        setError('App not found');
        setIsLoading(false);
      });
  }, [appSlug]);

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
        <p>Loading application details...</p>
      </div>
    );
  }

  if (error || !app) {
    return (
      <div className={styles.errorContainer}>
        <h2>{error || 'App not found'}</h2>
        <p>The app page you are looking for does not exist or has been removed.</p>
        <Link to="/" className="btn-primary" style={{ marginTop: '20px', display: 'inline-block' }}>Return to Home</Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{app.name} - Download & Launch | ViteNest</title>
        <meta name="description" content={app.description} />
      </Helmet>

      <main className={styles.main}>
        <div className="container">
          {/* Back Navigation */}
          <Link to="/tools" className={styles.backLink}>
            <ArrowLeft size={16} /> Back to Catalog
          </Link>

          {/* Main Layout Grid */}
          <div className={styles.layoutGrid}>
            
            {/* Left Content Area */}
            <div className={styles.mainContent}>
              
              {/* APKPure-style Hero Header */}
              <div className={`glass-panel ${styles.heroCard}`}>
                <div className={styles.heroFlex}>
                  <div className={styles.appIconWrapper}>
                    {app.icon && app.icon.startsWith('http') ? (
                      <img src={app.icon} alt={app.name} className={styles.appIcon} />
                    ) : (
                      <DynamicIcon name={app.icon} size={64} className={styles.lucideIcon} />
                    )}
                  </div>
                  <div className={styles.appHeaderInfo}>
                    <h1 className={styles.appName}>{app.name}</h1>
                    <div className={styles.metaBadges}>
                      <span className={styles.badge}>
                        {app.section === 'Website' ? <Globe size={14} /> : <Smartphone size={14} />}
                        {app.section}
                      </span>
                      {categoryName && (
                        <span className={styles.badge}>
                          <Layers size={14} />
                          {categoryName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className={styles.actionRow}>
                  <a 
                    href={app.link} 
                    target="_blank" 
                    rel="noreferrer" 
                    className={`btn-primary ${styles.ctaButton}`}
                  >
                    {app.section === 'Website' ? 'Launch Web App' : 'Download APK / Install'}
                    <ExternalLink size={18} style={{ marginLeft: '8px' }} />
                  </a>
                  <span className={styles.safetyInfo}>
                    <ShieldCheck size={16} color="#22c55e" /> Safe & Verified
                  </span>
                </div>
              </div>

              {/* Screenshots Gallery */}
              {app.images && app.images.length > 0 && (
                <div className={`glass-panel ${styles.sectionCard}`}>
                  <h2 className={styles.sectionTitle}>Screenshots</h2>
                  <div className={styles.screenshotsContainer}>
                    {app.images.map((imgUrl, idx) => (
                      <img 
                        key={idx}
                        src={imgUrl} 
                        alt={`${app.name} Screenshot ${idx + 1}`} 
                        className={styles.screenshot} 
                        onClick={() => setActiveImage(imgUrl)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Description Section */}
              <div className={`glass-panel ${styles.sectionCard}`}>
                <h2 className={styles.sectionTitle}>About {app.name}</h2>
                <div className={styles.description}>
                  {app.description ? (
                    app.description.split('\n').map((para, idx) => (
                      para.trim() ? <p key={idx}>{para}</p> : <br key={idx} />
                    ))
                  ) : (
                    <p>No description provided for this listing.</p>
                  )}
                </div>
              </div>

              {/* Legal documents footer inside the app view */}
              {app.hasLegal && (app.termsOfService?.content || app.privacyPolicy?.content) && (
                <div className={`glass-panel ${styles.sectionCard}`}>
                  <h2 className={styles.sectionTitle}>Legal Agreements</h2>
                  <div className={styles.legalLinksFlex}>
                    {app.termsOfService?.content && (
                      <Link to={`/legal/${app.appSlug}/${app.termsOfService.slug}`} className={styles.legalCard}>
                        <FileText size={20} />
                        <div>
                          <h4>{app.termsOfService.title}</h4>
                          <p>{app.termsOfService.headline || 'Terms of agreement for users.'}</p>
                        </div>
                      </Link>
                    )}
                    {app.privacyPolicy?.content && (
                      <Link to={`/legal/${app.appSlug}/${app.privacyPolicy.slug}`} className={styles.legalCard}>
                        <FileText size={20} />
                        <div>
                          <h4>{app.privacyPolicy.title}</h4>
                          <p>{app.privacyPolicy.headline || 'Privacy and data protection policy.'}</p>
                        </div>
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Stats Area */}
            <div className={styles.sidebar}>
              <div className={`glass-panel ${styles.sidebarCard}`}>
                <h3 className={styles.sidebarTitle}>Information</h3>
                <div className={styles.specList}>
                  <div className={styles.specItem}>
                    <Globe size={16} />
                    <div>
                      <span className={styles.specLabel}>Platform</span>
                      <span className={styles.specValue}>{app.section === 'Website' ? 'Web Browser' : 'Android'}</span>
                    </div>
                  </div>
                  {categoryName && (
                    <div className={styles.specItem}>
                      <Layers size={16} />
                      <div>
                        <span className={styles.specLabel}>Category</span>
                        <span className={styles.specValue}>{categoryName}</span>
                      </div>
                    </div>
                  )}
                  <div className={styles.specItem}>
                    <Calendar size={16} />
                    <div>
                      <span className={styles.specLabel}>Date Published</span>
                      <span className={styles.specValue}>
                        {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Lightbox / Zoomed image popup modal */}
      {activeImage && (
        <div className={styles.lightbox} onClick={() => setActiveImage(null)}>
          <div className={styles.lightboxContent}>
            <img src={activeImage} alt="Zoomed screenshot" />
            <button className={styles.lightboxClose} onClick={() => setActiveImage(null)}>✕</button>
          </div>
        </div>
      )}
    </>
  );
}
