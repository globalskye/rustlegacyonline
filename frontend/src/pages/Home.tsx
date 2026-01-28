import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Download, Users, Zap, Calendar, Shield, Globe, Server } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { apiService } from '../services/api';
import * as Types from '../types';

const Home: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [serverInfo, setServerInfo] = useState<Types.ServerInfo | null>(null);
  const [features, setFeatures] = useState<Types.Feature[]>([]);
  const [news, setNews] = useState<Types.News[]>([]);
  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);

  useEffect(() => {
    loadData();
  }, [i18n.language]);

  const loadData = async () => {
    try {
      const [serverData, featuresData, newsData] = await Promise.all([
        apiService.getServerInfo(),
        apiService.getFeatures(i18n.language),
        apiService.getNews(i18n.language, true)
      ]);
      
      setServerInfo(serverData);
      setFeatures(featuresData.sort((a, b) => a.order - b.order));
      setNews(newsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const currentDescription = serverInfo?.descriptions.find(d => d.language === i18n.language)?.content;

  const iconMap: { [key: string]: React.FC<any> } = {
    zap: Zap,
    users: Users,
    globe: Globe,
    shield: Shield,
    server: Server,
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <motion.div 
        className="background-layer"
        style={{ y: backgroundY }}
      />
      
      {/* Hero Section */}
      <section style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        overflow: 'hidden'
      }}>
        <motion.div 
          style={{
            maxWidth: '1000px',
            textAlign: 'center',
            position: 'relative',
            zIndex: 10
          }}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.h1 
            style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: 'clamp(3rem, 10vw, 7rem)',
              fontWeight: 900,
              background: 'linear-gradient(135deg, var(--primary-blue), var(--accent-cyan))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textTransform: 'uppercase',
              letterSpacing: '8px',
              marginBottom: '1.5rem',
              textShadow: '0 0 60px var(--glow-blue)',
              animation: 'pulse-glow 3s ease-in-out infinite'
            }}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {serverInfo?.name || t('hero.title')}
          </motion.h1>
          
          <motion.p 
            style={{
              fontSize: 'clamp(1rem, 2.5vw, 1.3rem)',
              color: 'var(--text-secondary)',
              marginBottom: '3rem',
              fontWeight: 400,
              lineHeight: 1.8,
              maxWidth: '700px',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            {currentDescription || t('hero.description')}
          </motion.p>

          <motion.div 
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '3rem',
              marginBottom: '3rem',
              flexWrap: 'wrap'
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Users style={{ width: 40, height: 40, color: 'var(--primary-blue)', filter: 'drop-shadow(0 0 10px var(--glow-blue))' }} />
              <div style={{ textAlign: 'left' }}>
                <div style={{
                  fontFamily: 'Orbitron, sans-serif',
                  fontSize: '2.5rem',
                  color: 'var(--text-primary)',
                  lineHeight: 1
                }}>
                  {serverInfo?.maxPlayers || 100}
                </div>
                <div style={{
                  fontSize: '0.9rem',
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '2px'
                }}>
                  {t('stats.maxPlayers')}
                </div>
              </div>
            </div>
            
            <div style={{
              width: '2px',
              height: '60px',
              background: 'linear-gradient(to bottom, transparent, var(--primary-blue), transparent)'
            }} />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Zap style={{ width: 40, height: 40, color: 'var(--primary-blue)', filter: 'drop-shadow(0 0 10px var(--glow-blue))' }} />
              <div style={{ textAlign: 'left' }}>
                <div style={{
                  fontFamily: 'Orbitron, sans-serif',
                  fontSize: '2.5rem',
                  color: 'var(--text-primary)',
                  lineHeight: 1
                }}>
                  {serverInfo?.gameVersion || 'Legacy'}
                </div>
                <div style={{
                  fontSize: '0.9rem',
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '2px'
                }}>
                  {t('stats.version')}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
          >
            <motion.a 
              href={serverInfo?.downloadUrl || '#'}
              className="btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Download className="btn-icon" />
              {t('hero.download')}
            </motion.a>
            
            {serverInfo?.virusTotalUrl && (
              <motion.a 
                href={serverInfo.virusTotalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Shield className="btn-icon" />
                {t('hero.checkVirus')}
              </motion.a>
            )}
          </motion.div>
        </motion.div>

        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '200px',
          background: 'linear-gradient(to bottom, transparent, var(--bg-dark))',
          pointerEvents: 'none'
        }} />
      </section>

      {/* News Section */}
      {news.length > 0 && (
        <section style={{ padding: '8rem 2rem 4rem', maxWidth: '1400px', margin: '0 auto' }}>
          <motion.h2 
            className="section-title"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {t('news.title')}
          </motion.h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '2rem',
            marginTop: '3rem'
          }}>
            {news.map((item, index) => (
              <motion.div
                key={item.id}
                className="card"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                {item.imageUrl && (
                  <div style={{
                    width: '100%',
                    height: '200px',
                    overflow: 'hidden',
                    background: 'var(--bg-card)',
                    borderRadius: '8px',
                    marginBottom: '1.5rem'
                  }}>
                    <img 
                      src={item.imageUrl} 
                      alt={item.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    />
                  </div>
                )}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: 'var(--text-muted)',
                  fontSize: '0.9rem',
                  marginBottom: '1rem',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  <Calendar size={16} />
                  {new Date(item.publishedAt).toLocaleDateString(i18n.language)}
                </div>
                <h3 style={{
                  fontFamily: 'Orbitron, sans-serif',
                  fontSize: '1.5rem',
                  color: 'var(--primary-blue)',
                  marginBottom: '1rem',
                  letterSpacing: '1px'
                }}>
                  {item.title}
                </h3>
                <p style={{
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                  fontSize: '1rem'
                }}>
                  {item.content}
                </p>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Features Section */}
      <section style={{ padding: '4rem 2rem 8rem', maxWidth: '1400px', margin: '0 auto' }}>
        <motion.h2 
          className="section-title"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {t('features.title')}
        </motion.h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem',
          marginTop: '3rem'
        }}>
          {features.map((feature, index) => {
            const IconComponent = iconMap[feature.icon] || Zap;
            return (
              <motion.div
                key={feature.id}
                className="card"
                style={{ textAlign: 'center' }}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div style={{
                  width: 60,
                  height: 60,
                  margin: '0 auto 1.5rem',
                  color: 'var(--primary-blue)',
                  filter: 'drop-shadow(0 0 15px var(--glow-blue))'
                }}>
                  <IconComponent size={60} />
                </div>
                <h3 style={{
                  fontFamily: 'Orbitron, sans-serif',
                  fontSize: '1.3rem',
                  color: 'var(--text-primary)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: '1rem'
                }}>
                  {feature.title}
                </h3>
                {feature.description && (
                  <p style={{
                    color: 'var(--text-secondary)',
                    fontSize: '1rem',
                    lineHeight: 1.6
                  }}>
                    {feature.description}
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Home;
