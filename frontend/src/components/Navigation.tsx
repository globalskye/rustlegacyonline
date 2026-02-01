import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Zap, Sun, Moon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';

const Navigation: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { theme, setTheme, resolvedTheme } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setMobileMenuOpen(false);
  };

  const navItems = [
    { path: '/', label: t('nav.home') },
    { path: '/how-to-start', label: t('nav.howToStart') },
    { path: '/server-info', label: t('nav.serverInfo') },
    { path: '/rules', label: t('nav.rules') },
    { path: '/shop', label: t('nav.shop') },
    { path: '/statistics', label: t('nav.statistics') },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <nav className="navbar">
        <motion.div 
          className="nav-container"
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Link to="/" className="nav-logo">
            <div className="logo-icon">
              <Zap size={24} color="#ffffff" />
            </div>
            <span className="logo-text">RUST LEGACY</span>
          </Link>
          
          <div className="nav-menu">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="nav-actions">
            <button
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className="lang-btn"
              title={resolvedTheme === 'dark' ? 'Light mode' : 'Dark mode'}
            >
              {resolvedTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button 
              onClick={() => changeLanguage('en')}
              className={`lang-btn ${i18n.language === 'en' ? 'active' : ''}`}
            >
              EN
            </button>
            <button 
              onClick={() => changeLanguage('ru')}
              className={`lang-btn ${i18n.language === 'ru' ? 'active' : ''}`}
            >
              RU
            </button>
            <Link to="/admin" className="lang-btn" style={{ textDecoration: 'none', textAlign: 'center' }}>
              Admin
            </Link>
            
            <button 
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </motion.div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              className="mobile-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`mobile-nav-link ${isActive(item.path) ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button 
                  onClick={() => changeLanguage('en')} 
                  className="mobile-lang-btn"
                  style={{ flex: 1 }}
                >
                  English
                </button>
                <button 
                  onClick={() => changeLanguage('ru')} 
                  className="mobile-lang-btn"
                  style={{ flex: 1 }}
                >
                  Русский
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
      <div className="grid-overlay" />
    </>
  );
};

export default Navigation;
