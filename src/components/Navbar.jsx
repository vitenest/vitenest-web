import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Hexagon } from 'lucide-react';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Explore Tools', path: '/tools' },
    { name: 'Categories', path: '/categories' },
    { name: 'Request a Tool', path: '/request' },
  ];

  return (
    <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
      <div className={`container ${styles.navContainer}`}>
        <Link to="/" className={styles.logo}>
          <Hexagon className={styles.logoIcon} />
          <span className="text-gradient">ViteNest</span>
        </Link>

        {/* Desktop Nav */}
        <nav className={styles.desktopNav}>
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path} 
              className={`${styles.navLink} ${location.pathname === link.path ? styles.active : ''}`}
            >
              {link.name}
            </Link>
          ))}
          <Link to="/tools" className="btn-primary">Browse All Tools</Link>
        </nav>

        {/* Mobile Toggle */}
        <button 
          className={styles.mobileToggle} 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Nav */}
      <div className={`${styles.mobileNav} ${isMenuOpen ? styles.mobileNavOpen : ''}`}>
        {navLinks.map((link) => (
          <Link 
            key={link.name} 
            to={link.path} 
            className={`${styles.mobileNavLink} ${location.pathname === link.path ? styles.active : ''}`}
          >
            {link.name}
          </Link>
        ))}
        <div className={styles.mobileNavAction}>
          <Link to="/tools" className="btn-primary">Browse All Tools</Link>
        </div>
      </div>
    </header>
  );
}
