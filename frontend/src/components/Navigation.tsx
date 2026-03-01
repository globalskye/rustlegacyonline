import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Download, Wallet, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { apiService } from '../services/api';
import { useApp } from '../context/AppContext';

const Navigation: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, authLoading, logout } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    apiService.getServerInfo().then((info) => {
      const url = info?.downloadLinks?.[0]?.url || info?.downloadUrl;
      if (url) setDownloadUrl(url);
    }).catch(() => {});
  }, []);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setMobileMenuOpen(false);
  };

  const navItems = [
    { path: '/', label: t('nav.home') },
    { path: '/news', label: t('nav.news') },
    { path: '/how-to-start', label: t('nav.howToStart') },
    { path: '/server-info', label: t('nav.serverInfo') },
    { path: '/rules', label: t('nav.rules') },
    { path: '/shop', label: t('nav.shop') },
    { path: '/statistics', label: t('nav.statistics') },
  ];

  const isActive = (path: string) => 
    path === '/' ? location.pathname === '/' : location.pathname === path || location.pathname.startsWith(path + '/');

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
            <img src="/favicon.svg" alt="" className="logo-icon-img" width={40} height={40} />
            <div className="logo-text-block">
              <span className="logo-text-main">Rust Legacy</span>
              <span className="logo-text-sub">Rust Legacy Online</span>
            </div>
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
            {!authLoading && (
              <>
                {user ? (
                  <>
                    <Link to="/balance" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Wallet size={18} />
                      {user.balance.toFixed(0)} ₽
                    </Link>
                    <button onClick={logout} className="lang-btn" style={{ display: 'flex', alignItems: 'center', gap: 6 }} title={i18n.language === 'ru' ? 'Выйти' : 'Logout'}>
                      <LogOut size={18} />
                    </button>
                  </>
                ) : null}
              </>
            )}
            {downloadUrl ? (
              <a href={downloadUrl} target="_blank" rel="noopener noreferrer" className="nav-download-btn">
                <Download size={18} />
                {t('hero.download')}
              </a>
            ) : (
              <Link to="/how-to-start" className="nav-download-btn">
                <Download size={18} />
                {t('hero.download')}
              </Link>
            )}
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
              {!authLoading && (
                <>
                  {user ? (
                    <>
                      <Link to="/balance" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                        <Wallet size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                        {i18n.language === 'ru' ? 'Баланс' : 'Balance'}: {user.balance.toFixed(0)} ₽
                      </Link>
                      <button className="mobile-nav-link" onClick={() => { logout(); setMobileMenuOpen(false); }} style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}>
                        <LogOut size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                        {i18n.language === 'ru' ? 'Выйти' : 'Logout'}
                      </button>
                    </>
                  ) : null}
                </>
              )}
              {downloadUrl ? (
                <a href={downloadUrl} target="_blank" rel="noopener noreferrer" className="mobile-nav-link nav-download-mobile" onClick={() => setMobileMenuOpen(false)}>
                  <Download size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                  {t('hero.download')}
                </a>
              ) : (
                <Link to="/how-to-start" className="mobile-nav-link nav-download-mobile" onClick={() => setMobileMenuOpen(false)}>
                  <Download size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                  {t('hero.download')}
                </Link>
              )}
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
