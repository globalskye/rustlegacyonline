import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { apiService } from '../services/api';
import * as Types from '../types';

const News: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [items, setItems] = useState<Types.News[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiService.getNews(i18n.language, true)
      .then(n => setItems((n || []).sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [i18n.language]);

  if (loading) {
    return (
      <div className="page-container">
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <FileText size={80} color="var(--primary-blue)" style={{ filter: 'drop-shadow(0 0 20px var(--glow-blue))' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="page-header">
          <FileText size={48} color="var(--primary-blue)" style={{ filter: 'drop-shadow(0 0 20px var(--glow-blue))' }} />
          <h1 className="section-title" style={{ marginBottom: 0 }}>{t('news.title')}</h1>
        </div>

        {items.length === 0 ? (
          <motion.div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>No news yet.</p>
          </motion.div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 900, margin: '0 auto' }}>
            {items.map((item, index) => (
              <motion.article
                key={item.id}
                className="card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <h2 style={{ fontFamily: 'Orbitron', fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  {item.title}
                </h2>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                  {new Date(item.publishedAt).toLocaleDateString(i18n.language, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                <div
                  style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}
                  dangerouslySetInnerHTML={{ __html: item.content || '' }}
                />
              </motion.article>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default News;
