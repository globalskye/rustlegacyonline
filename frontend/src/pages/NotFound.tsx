import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const NotFound: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ textAlign: 'center', padding: '4rem 2rem' }}
      >
        <AlertCircle size={80} color="var(--primary-blue)" style={{ marginBottom: '1.5rem', filter: 'drop-shadow(0 0 20px var(--glow-blue))' }} />
        <h1 className="section-title" style={{ marginBottom: '1rem' }}>404</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginBottom: '2rem' }}>
          {t('nav.home') === 'Главная' ? 'Страница не найдена' : 'Page not found'}
        </p>
        <Link to="/" className="btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <Home size={20} />
          {t('nav.home') === 'Главная' ? 'На главную' : 'Go to Home'}
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
