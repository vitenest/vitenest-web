import { Helmet } from 'react-helmet-async';
import { ExternalLink, Download } from 'lucide-react';
import styles from './Products.module.css';

export default function Products() {
  const categories = [
    {
      id: 'web',
      title: 'Web Applications',
      description: 'High-performance web apps tailored for modern businesses.',
      products: [
        { name: 'ViteFlow', desc: 'Project management and workflow automation.', type: 'Free' },
        { name: 'ViteAnalytics', desc: 'Real-time privacy-first web analytics.', type: 'Free' }
      ]
    },
    {
      id: 'extensions',
      title: 'Chrome Extensions',
      description: 'Boost your productivity directly from your browser.',
      products: [
        { name: 'ViteClip', desc: 'Advanced clipboard manager and sync.', type: 'Free' },
        { name: 'ViteFocus', desc: 'Pomodoro timer and website blocker.', type: 'Free' }
      ]
    },
    {
      id: 'mobile',
      title: 'Mobile & iOS Apps',
      description: 'Native experiences for iOS and Android platforms.',
      products: [
        { name: 'ViteSync Mobile', desc: 'Access all your ViteNest data on the go.', type: 'Free' },
        { name: 'ViteScanner', desc: 'AI-powered document scanner and OCR.', type: 'Free' }
      ]
    }
  ];

  return (
    <>
      <Helmet>
        <title>Products | ViteNest Free Tools</title>
        <meta name="description" content="Explore ViteNest's suite of free web apps, Chrome extensions, and mobile applications." />
      </Helmet>

      <main className={styles.main}>
        <div className="container">
          <div className={`animate-fade-in ${styles.header}`}>
            <h1 className="text-gradient">Our Products</h1>
            <p>100% Free. Built with cutting-edge technology for maximum speed and security.</p>
          </div>

          <div className={styles.categoryList}>
            {categories.map((category) => (
              <section key={category.id} id={category.id} className={styles.categorySection}>
                <div className={styles.categoryHeader}>
                  <h2>{category.title}</h2>
                  <p>{category.description}</p>
                </div>
                
                <div className={styles.productGrid}>
                  {category.products.map((product, idx) => (
                    <div key={idx} className={`glass-panel glow-effect ${styles.productCard}`}>
                      <div className={styles.productBadge}>{product.type}</div>
                      <h3>{product.name}</h3>
                      <p>{product.desc}</p>
                      
                      <div className={styles.productAction}>
                        <button className="btn-secondary" style={{width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'}}>
                          {category.id === 'web' ? (
                            <><ExternalLink size={18} /> Launch App</>
                          ) : (
                            <><Download size={18} /> Download</>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
