import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import * as LucideIcons from 'lucide-react';
import { Search, Grid, Zap, MessageSquare, Star, Heart, CheckCircle, ChevronDown, Smartphone, Globe } from 'lucide-react';
import styles from './Home.module.css';

// Helper to render dynamic icon from string
const DynamicIcon = ({ name, size = 24, className }) => {
  const IconComponent = LucideIcons[name] || LucideIcons['FileText'];
  return <IconComponent size={size} className={className} />;
};

export default function Home() {
  const [featuredApps, setFeaturedApps] = useState([]);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(true);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/apps').then(res => res.json()),
      fetch('/api/categories').then(res => res.json())
    ])
    .then(([appsData, catsData]) => {
      setFeaturedApps(appsData.filter(app => app.isFeatured));
      const catsWithCounts = catsData.map(cat => ({
        ...cat,
        count: appsData.filter(app => app.categoryId === cat.id).length
      }));
      setCategories(catsWithCounts);
      setIsLoadingFeatured(false);
    })
    .catch(err => {
      console.error('Failed to fetch data:', err);
      setIsLoadingFeatured(false);
    });
  }, []);

  const faqs = [
    { q: 'Is it really 100% free?', a: 'Yes! Our platform is supported by non-intrusive ads, allowing us to offer premium tools at zero cost to you.' },
    { q: 'Do I need to create an account?', a: 'Most of our tools work instantly without any sign-up required. Accounts are only needed to save preferences or upvote tool requests.' },
    { q: 'Are my files secure?', a: 'Absolutely. Tools that handle sensitive data like PDFs or images process everything locally in your browser. Nothing is uploaded to our servers.' },
  ];

  return (
    <>
      <Helmet>
        <title>ViteNest | The Ultimate Ecosystem of Free Tools</title>
        <meta name="description" content="Discover hundreds of free web apps, Chrome extensions, and utilities. No sign-up required. Built for speed and productivity." />
      </Helmet>

      <main className={styles.main}>
        {/* 1. Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroGlow}></div>
          <div className={`container ${styles.heroContainer}`}>
            <div className={`animate-fade-in ${styles.heroContent}`}>
              <div className={styles.badge}>
                <span className={styles.badgeDot}></span>
                ViteNest Ecosystem — 150+ Free Tools
              </div>
              <h1 className={styles.title}>
                The Ultimate Hub for <br />
                <span className="text-gradient">Free Digital Tools</span>
              </h1>
              <p className={styles.subtitle}>
                Supercharge your workflow with our massive collection of high-performance web apps, utilities, and mobile applications. 100% Free. No sign-up required.
              </p>

              <div className={styles.searchBar}>
                <Search className={styles.searchIcon} size={20} />
                <input type="text" placeholder="Search for PDF tools, JSON formatters, Android apps..." />
                <button className="btn-primary">Search</button>
              </div>

              <div className={styles.heroActions}>
                <Link to="/tools" className="btn-primary">
                  Browse All Tools
                </Link>
                <Link to="/categories" className="btn-secondary">
                  Explore Categories
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Ecosystem Stats */}
        <section className={styles.statsSection}>
          <div className="container">
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <h3>2M+</h3>
                <p>Monthly Active Users</p>
              </div>
              <div className={styles.statCard}>
                <h3>150+</h3>
                <p>Free Tools & Apps</p>
              </div>
              <div className={styles.statCard}>
                <h3>12</h3>
                <p>Tools Launched This Month</p>
              </div>
              <div className={styles.statCard}>
                <h3>5k+</h3>
                <p>User Requests Fulfilled</p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Featured Products */}
        <section className={styles.section}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2>Top Rated <span className="text-gradient">Tools & Apps</span></h2>
              <p>Discover the most popular utilities currently used by our community.</p>
            </div>

            {isLoadingFeatured ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
                <Zap size={32} style={{ opacity: 0.5, marginBottom: '16px' }} />
                <p>Loading featured apps...</p>
              </div>
            ) : featuredApps.length > 0 ? (
              <div className={styles.productGrid}>
                {featuredApps.map((app) => (
                  <Link
                    key={app.id}
                    to={`/app/${app.appSlug}`}
                    className={styles.toolCard}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <div className={styles.toolCardInner}>
                      <div className={styles.toolCardTop}>
                        <div className={styles.toolIconWrapper}>
                          {app.icon && app.icon.startsWith('http') ? (
                            <img src={app.icon} alt={app.name} className={styles.toolIconImg} />
                          ) : (
                            <DynamicIcon name={app.icon} size={28} />
                          )}
                        </div>
                        <div className={styles.toolCardMeta}>
                          <h3>{app.name}</h3>
                          <span className={styles.toolCardBadge}>
                            {app.section === 'Website' ? <Globe size={10} /> : <Smartphone size={10} />}
                            {app.section}
                          </span>
                        </div>
                      </div>
                      <p>{app.description}</p>
                      <div className={styles.toolFooter}>
                        <span className={styles.toolUsers}>
                          <Star size={12} fill="var(--neon-blue)" color="var(--neon-blue)" />
                          Featured
                        </span>
                        <div className={styles.launchBtn}>View Details →</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px', color: '#64748b', background: 'var(--overlay-light)', borderRadius: '20px', border: '1px solid var(--glass-border)' }}>
                <Star size={32} style={{ opacity: 0.4, marginBottom: '16px' }} />
                <p>No featured tools yet. Add some from the admin panel!</p>
              </div>
            )}
          </div>
        </section>

        {/* 4. Product Categories */}
        <section className={`${styles.section} ${styles.altBg}`}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2>Explore by <span className="text-gradient">Category</span></h2>
              <p>Find exactly what you need from our categorized ecosystem.</p>
            </div>
            <div className={styles.categoryGrid}>
              {categories.map((cat, i) => (
                <Link to="/categories" key={i} className={`glass-panel ${styles.categoryCard}`}>
                  <div className={styles.catIconWrapper}>
                    <Grid className={styles.catIcon} size={20} />
                  </div>
                  <div>
                    <h3>{cat.name}</h3>
                    <p>{cat.count} {cat.count === 1 ? 'tool' : 'tools'}</p>
                  </div>
                </Link>
              ))}
              {categories.length === 0 && (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#64748b' }}>No categories yet.</div>
              )}
            </div>
          </div>
        </section>

        {/* 5. Just Launched Marquee */}
        <section className={styles.section}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2>Just <span className="text-gradient">Launched</span></h2>
              <p>We are constantly building. Check out our newest additions.</p>
            </div>
          </div>
          <div className={styles.scrollingWrapper}>
            <div className={styles.scrollingContent}>
              {[...Array(10)].map((_, i) => (
                <div key={i} className={`glass-panel ${styles.miniCard}`}>
                  <Zap size={20} style={{ color: 'var(--neon-blue)', flexShrink: 0 }} />
                  <h4>New Tool #{(i % 5) + 1}</h4>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. Benefits */}
        <section className={`${styles.section} ${styles.altBg}`}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2>Why Choose <span className="text-gradient">ViteNest?</span></h2>
            </div>
            <div className={styles.benefitsGrid}>
              <div className={styles.benefitItem}>
                <div className={styles.benefitIconWrapper}>
                  <CheckCircle size={28} color="var(--neon-blue)" />
                </div>
                <h3>100% Free Forever</h3>
                <p>Supported by non-intrusive ads. No paywalls or hidden fees.</p>
              </div>
              <div className={styles.benefitItem}>
                <div className={styles.benefitIconWrapper} style={{ background: 'rgba(139,92,246,0.08)', borderColor: 'rgba(139,92,246,0.2)' }}>
                  <Zap size={28} color="var(--neon-purple)" />
                </div>
                <h3>No Sign-up Required</h3>
                <p>Click and use. Don't waste time creating accounts.</p>
              </div>
              <div className={styles.benefitItem}>
                <div className={styles.benefitIconWrapper} style={{ background: 'rgba(244,63,94,0.08)', borderColor: 'rgba(244,63,94,0.2)' }}>
                  <Heart size={28} color="var(--neon-pink)" />
                </div>
                <h3>Community Driven</h3>
                <p>We build the tools that you request the most.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Tool Request Section */}
        <section className={styles.section}>
          <div className="container">
            <div className={`glass-panel ${styles.ctaCard} ${styles.requestCard}`}>
              <h2>Can't find what you need?</h2>
              <p>Submit a request. If enough users want it, our engineers will build it for free.</p>
              <Link to="/request" className="btn-primary">
                Submit a Tool Request <MessageSquare size={18} className={styles.iconRight} />
              </Link>
            </div>
          </div>
        </section>

        {/* 8. Testimonials */}
        <section className={`${styles.section} ${styles.altBg}`}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2>Loved by <span className="text-gradient">Creators</span></h2>
            </div>
            <div className={styles.testimonialGrid}>
              {[
                { text: '"ViteNest has replaced 4 paid subscriptions for me. The tools are blazing fast and the ad placements are perfectly reasonable."', author: 'Sarah K.' },
                { text: '"I use their PDF tools and Android apps daily. The quality is outstanding considering everything is completely free."', author: 'Marcus T.' },
                { text: '"Finally a platform that doesn\'t require me to create an account for every single tool. This is the future."', author: 'Priya M.' },
              ].map((t, i) => (
                <div key={i} className={`glass-panel ${styles.testimonialCard}`}>
                  <div className={styles.stars}>
                    {[1,2,3,4,5].map(s => <Star key={s} size={16} fill="var(--neon-blue)" color="var(--neon-blue)" />)}
                  </div>
                  <p>{t.text}</p>
                  <div className={styles.author}>— {t.author}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 9. FAQs */}
        <section className={styles.section}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2>Frequently Asked <span className="text-gradient">Questions</span></h2>
            </div>
            <div className={styles.faqList}>
              {faqs.map((faq, i) => (
                <div key={i} className={`glass-panel ${styles.faqItem}`}>
                  <div className={styles.faqQ}>
                    <h3>{faq.q}</h3>
                    <ChevronDown size={20} />
                  </div>
                  <p className={styles.faqA}>{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 10. Newsletter & Final CTA */}
        <section className={`${styles.section} ${styles.altBg}`}>
          <div className="container">
            <div className={`glass-panel ${styles.ctaCard}`}>
              <h2>Start supercharging your workflow</h2>
              <p>Join millions of users utilizing our free tool ecosystem today.</p>
              <div className={styles.newsletterForm}>
                <input type="email" placeholder="Enter your email for updates..." />
                <button className="btn-primary">Subscribe</button>
              </div>
              <div style={{ marginTop: '28px' }}>
                <Link to="/tools" className="btn-secondary">Browse All Apps</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
