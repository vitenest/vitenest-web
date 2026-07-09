import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft } from 'lucide-react';
import styles from './LegalPage.module.css';

export default function LegalPage() {
  const { appSlug, docSlug } = useParams();
  const [app, setApp] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/apps')
      .then(res => res.json())
      .then(data => {
        const foundApp = data.find(a => a.appSlug === appSlug);
        if (foundApp) {
          setApp(foundApp);
        } else {
          setError('App not found');
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch app data:', err);
        setError('Failed to load document');
        setIsLoading(false);
      });
  }, [appSlug]);

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
        <p>Loading legal document...</p>
      </div>
    );
  }

  if (error || !app) {
    return (
      <div className={styles.errorContainer}>
        <h2>{error || 'Document not found'}</h2>
        <Link to="/" className="btn-primary">Return to Home</Link>
      </div>
    );
  }

  let doc = null;
  if (app.termsOfService?.slug === docSlug) {
    doc = app.termsOfService;
  } else if (app.privacyPolicy?.slug === docSlug) {
    doc = app.privacyPolicy;
  }

  if (!doc) {
    return (
      <div className={styles.errorContainer}>
        <h2>Document not found for this app</h2>
        <Link to="/" className="btn-primary">Return to Home</Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{doc.title} - {app.name} | ViteNest</title>
        <meta name="description" content={doc.headline} />
      </Helmet>

      <main className={styles.main}>
        <div className="container">
          <div className={styles.header}>
            <Link to="/" className={styles.backLink}>
              <ArrowLeft size={16} /> Back to Directory
            </Link>
            <h1 className={styles.title}>{doc.title}</h1>
            <p className={styles.headline}>{doc.headline}</p>
          </div>

          <div className={`glass-panel ${styles.contentPanel}`}>
            <div className={styles.content}>
              {doc.content.split('\n').map((paragraph, idx) => (
                paragraph.trim() ? <p key={idx} style={{ marginBottom: '16px' }}>{paragraph}</p> : <br key={idx} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
