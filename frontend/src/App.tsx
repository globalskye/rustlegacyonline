import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Download, Users, Shield, Zap, Globe, Menu, X, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { apiService, ServerInfo, Feature, News } from './services/api';
import './App.css';

const App: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [serverInfo, setServerInfo] = useState<ServerInfo | null>(null);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadLanguageData();
  }, [i18n.language]);

  const loadData = async () => {
    try {
      const [serverData, featuresData, newsData] = await Promise.all([
        apiService.getServerInfo(),
        apiService.getFeatures(i18n.language),
        apiService.getNews(i18n.language, true)
      ]);
      
      setServerInfo(serverData);
      setFeatures(featuresData);
      setNews(newsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadLanguageData = async () => {
    try {
      const [featuresData, newsData] = await Promise.all([
        apiService.getFeatures(i18n.language),
        apiService.getNews(i18n.language, true)
      ]);
      
      setFeatures(featuresData);
      setNews(newsData);
    } catch (error) {
      console.error('Error loading language data:', error);
    }
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setMobileMenuOpen(false);
  };

  const currentLang = i18n.language;
  const currentDescription = serverInfo?.descriptions.find(d => d.language === currentLang)?.content;

  const iconMap: { [key: string]: React.FC<any> } = {
    zap: Zap,
    users: Users,
    globe: Globe,
    shield: Shield,
  };

  return (
    <div className="app">
      <motion.div 
        className="background-layer"
        style={{ y: backgroundY }}
      />
      
      {/* Navigation */}
      <nav className="navbar">
        <motion.div 
          className="nav-container"
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="nav-logo">
            <span className="logo-text">RUST</span>
            <span className="logo-legacy">LEGACY</span>
          </div>
          
          <div className="nav-links">
            <button 
              onClick={() => changeLanguage('en')}
              className={`lang-btn ${currentLang === 'en' ? 'active' : ''}`}
            >
              EN
            </button>
            <button 
              onClick={() => changeLanguage('ru')}
              className={`lang-btn ${currentLang === 'ru' ? 'active' : ''}`}
            >
              RU
            </button>
          </div>

          <button 
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </motion.div>

        {mobileMenuOpen && (
          <motion.div 
            className="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <button onClick={() => changeLanguage('en')} className="mobile-lang-btn">
              English
            </button>
            <button onClick={() => changeLanguage('ru')} className="mobile-lang-btn">
              Русский
            </button>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <motion.div 
          className="hero-content"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="hero-title">
            <motion.span
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {serverInfo?.name || t('hero.title')}
            </motion.span>
          </h1>
          
          <motion.p 
            className="hero-subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            {currentDescription || t('hero.description')}
          </motion.p>

          <motion.div 
            className="hero-stats"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <div className="stat-item">
              <Users className="stat-icon" />
              <div className="stat-content">
                <div className="stat-number">{serverInfo?.maxPlayers || 100}</div>
                <div className="stat-label">{t('stats.maxPlayers')}</div>
              </div>
            </div>
            
            <div className="stat-divider" />
            
            <div className="stat-item">
              <Zap className="stat-icon" />
              <div className="stat-content">
                <div className="stat-number">{serverInfo?.gameVersion || 'Legacy'}</div>
                <div className="stat-label">{t('stats.version')}</div>
              </div>
            </div>
          </motion.div>

          <motion.a 
            href={serverInfo?.downloadUrl || '#'}
            className="download-btn"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Download className="btn-icon" />
            {t('hero.download')}
          </motion.a>
        </motion.div>

        <div className="hero-gradient" />
      </section>

      {/* News Section */}
      {news.length > 0 && (
        <section className="news-section">
          <motion.h2 
            className="section-title"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {t('news.title')}
          </motion.h2>

          <div className="news-grid">
            {news.map((item, index) => (
              <motion.div
                key={item.id}
                className="news-card"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
              >
                {item.imageUrl && (
                  <div className="news-image">
                    <img src={item.imageUrl} alt={item.title} />
                  </div>
                )}
                <div className="news-content">
                  <div className="news-date">
                    <Calendar size={16} />
                    {new Date(item.publishedAt).toLocaleDateString(currentLang)}
                  </div>
                  <h3 className="news-title">{item.title}</h3>
                  <p className="news-text">{item.content}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="features">
        <motion.h2 
          className="section-title"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {t('features.title')}
        </motion.h2>

        <div className="features-grid">
          {features.map((feature, index) => {
            const IconComponent = iconMap[feature.icon] || Zap;
            return (
              <motion.div
                key={feature.id}
                className="feature-card"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
              >
                <div className="feature-icon">
                  <IconComponent />
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                {feature.description && (
                  <p className="feature-description">{feature.description}</p>
                )}
                <div className="feature-glow" />
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <p className="footer-text">
            © 2025 {serverInfo?.name || 'Rust Legacy Server'}. {t('footer.rights')}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
