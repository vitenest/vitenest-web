import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Search, Users, Grid, Zap, MessageSquare, ArrowRight, Star, Heart, FileText, Code, CheckCircle, ChevronDown, Mail } from 'lucide-react';
import styles from './Home.module.css';

export default function Home() {
  const featuredTools = [
    { name: 'VitePDF', desc: 'Compress, merge, and split PDFs entirely in your browser.', icon: <FileText size={24}/>, users: '12k' },
    { name: 'JsonFormatter', desc: 'Beautify and validate JSON data instantly.', icon: <Code size={24}/>, users: '45k' },
    { name: 'AI Resume Builder', desc: 'Generate professional resumes tailored to job descriptions.', icon: <Zap size={24}/>, users: '8k' },
  ];

  const categories = [
    { name: 'Productivity', count: 12 },
    { name: 'Developer Tools', count: 24 },
    { name: 'AI Utilities', count: 8 },
    { name: 'Media Editors', count: 15 },
  ];

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
                ViteNest Ecosystem
              </div>
              <h1 className={styles.title}>
                The Ultimate Hub for <br />
                <span className="text-gradient">Free Digital Tools</span>
              </h1>
              <p className={styles.subtitle}>
                Supercharge your workflow with our massive collection of high-performance web apps, utilities, and mobile applications. 100% Free. No sign-up required.
              </p>
              
              <div className={styles.searchBar}>
                <Search className={styles.searchIcon} />
                <input type="text" placeholder="Search for PDF tools, JSON formatters..." />
                <button className="btn-primary">Find Tool</button>
              </div>
              
              <div className={styles.heroActions}>
                <Link to="/tools" className="btn-secondary">
                  Browse All 150+ Tools
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
              <h2>Top Rated Tools</h2>
              <p>Discover the most popular utilities currently used by our community.</p>
            </div>
            <div className={styles.productGrid}>
              {featuredTools.map((tool, i) => (
                <div key={i} className={`glass-panel ${styles.toolCard}`}>
                  <div className={styles.toolIconWrapper}>{tool.icon}</div>
                  <h3>{tool.name}</h3>
                  <p>{tool.desc}</p>
                  <div className={styles.toolFooter}>
                    <span className={styles.toolUsers}><Users size={14}/> {tool.users} users</span>
                    <button className={styles.launchBtn}>Launch</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Product Categories */}
        <section className={`${styles.section} ${styles.altBg}`}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2>Explore by Category</h2>
              <p>Find exactly what you need from our categorized ecosystem.</p>
            </div>
            <div className={styles.categoryGrid}>
              {categories.map((cat, i) => (
                <Link to="/categories" key={i} className={`glass-panel ${styles.categoryCard}`}>
                  <Grid className={styles.catIcon} />
                  <div>
                    <h3>{cat.name}</h3>
                    <p>{cat.count} tools</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Recently Launched */}
        <section className={styles.section}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2>Just Launched</h2>
              <p>We are constantly building. Check out our newest additions.</p>
            </div>
            <div className={styles.scrollingWrapper}>
               <div className={styles.scrollingContent}>
                 {[1,2,3,4,5].map((i) => (
                    <div key={i} className={`glass-panel ${styles.miniCard}`}>
                      <Zap size={20} className="text-gradient" />
                      <h4>New Tool #{i}</h4>
                    </div>
                 ))}
               </div>
            </div>
          </div>
        </section>

        {/* 6. Benefits */}
        <section className={`${styles.section} ${styles.altBg}`}>
          <div className="container">
            <div className={styles.benefitsGrid}>
              <div className={styles.benefitItem}>
                <CheckCircle size={32} color="var(--neon-blue)"/>
                <h3>100% Free Forever</h3>
                <p>Supported by non-intrusive ads. No paywalls or hidden fees.</p>
              </div>
              <div className={styles.benefitItem}>
                <Zap size={32} color="var(--neon-purple)"/>
                <h3>No Sign-up Required</h3>
                <p>Click and use. Don't waste time creating accounts.</p>
              </div>
              <div className={styles.benefitItem}>
                <Heart size={32} color="var(--neon-pink)"/>
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
                Submit a Tool Request <MessageSquare size={18} className={styles.iconRight}/>
              </Link>
            </div>
          </div>
        </section>

        {/* 8. Testimonials */}
        <section className={`${styles.section} ${styles.altBg}`}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2>Loved by Creators</h2>
            </div>
            <div className={styles.testimonialGrid}>
              {[1,2,3].map(i => (
                <div key={i} className={`glass-panel ${styles.testimonialCard}`}>
                  <div className={styles.stars}>
                    {[1,2,3,4,5].map(s => <Star key={s} size={16} fill="var(--neon-blue)" color="var(--neon-blue)"/>)}
                  </div>
                  <p>"ViteNest has replaced 4 paid subscriptions for me. The tools are blazing fast and ad placements are perfectly reasonable."</p>
                  <div className={styles.author}>- User {i}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 9. FAQs */}
        <section className={styles.section}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2>Frequently Asked Questions</h2>
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

        {/* 10. Newsletter & 11. Final CTA */}
        <section className={styles.section}>
          <div className="container">
            <div className={`glass-panel ${styles.ctaCard}`}>
              <h2>Start supercharging your workflow</h2>
              <p>Join millions of users utilizing our free tool ecosystem today.</p>
              <div className={styles.newsletterForm}>
                <input type="email" placeholder="Join our newsletter for updates" />
                <button className="btn-primary">Subscribe</button>
              </div>
              <div style={{marginTop: '32px'}}>
                <Link to="/tools" className="btn-secondary">Browse All Apps</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
