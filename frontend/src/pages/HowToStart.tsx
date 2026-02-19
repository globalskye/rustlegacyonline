import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Archive, RefreshCw, Play, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { apiService } from '../services/api';
import * as Types from '../types';

const HowToStart: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [steps, setSteps] = useState<Types.HowToStartStep[]>([]);
  const [serverInfo, setServerInfo] = useState<Types.ServerInfo | null>(null);

  useEffect(() => {
    loadData();
  }, [i18n.language]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [stepsData, infoData] = await Promise.all([
        apiService.getHowToStartSteps(i18n.language),
        apiService.getServerInfo()
      ]);
      setSteps((stepsData || []).sort((a, b) => a.stepNumber - b.stepNumber));
      setServerInfo(infoData || null);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const stepIcons = [Download, Archive, RefreshCw, Play];

  if (loading) {
    return (
      <div className="page-container" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="page-header" style={{ marginBottom: '0.5rem' }}>
          <h1 className="section-title" style={{ marginBottom: 0 }}>{t('howToStart.title')}</h1>
        </div>
        <p className="section-subtitle">{t('howToStart.subtitle')}</p>

        {/* Download — компактная строка */}
        {(serverInfo?.downloadLinks?.length || serverInfo?.downloadUrl || serverInfo?.virusTotalUrl) ? (
          <div className="howto-download-row">
            {serverInfo?.downloadLinks && serverInfo.downloadLinks.length > 0 ? (
              serverInfo.downloadLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="howto-download-btn"
                >
                  <Download size={16} />
                  <span>{link.label || t('hero.download')}</span>
                </a>
              ))
            ) : serverInfo?.downloadUrl ? (
              <a
                href={serverInfo.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="howto-download-btn"
              >
                <Download size={16} />
                <span>{t('hero.download')}</span>
              </a>
            ) : null}
            {serverInfo?.virusTotalUrl && (
              <a
                href={serverInfo.virusTotalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="howto-download-btn howto-download-btn-secondary"
              >
                <Shield size={16} />
                <span>{t('hero.checkVirus')}</span>
              </a>
            )}
          </div>
        ) : null}

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '3rem',
          maxWidth: '900px',
          margin: '0 auto'
        }}>
          {steps.map((step, index) => {
            const IconComponent = stepIcons[index % stepIcons.length];
            return (
              <motion.div
                key={step.id}
                className="card howto-step-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    marginBottom: '1.5rem'
                  }}>
                    <div style={{
                      width: 50,
                      height: 50,
                      background: 'var(--primary-blue)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 0 20px var(--glow-blue)'
                    }}>
                      <IconComponent size={24} color="#ffffff" />
                    </div>
                    <div style={{
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '1.2rem',
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '2px'
                    }}>
                      Step {step.stepNumber}
                    </div>
                  </div>

                  <h3 style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '1.8rem',
                    color: 'var(--primary-blue)',
                    marginBottom: '1rem',
                    letterSpacing: '1px'
                  }}>
                    {step.title}
                  </h3>

                  <div 
                    style={{
                      color: 'var(--text-secondary)',
                      lineHeight: 1.8,
                      fontSize: '1.05rem'
                    }}
                    dangerouslySetInnerHTML={{ __html: step.content }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default HowToStart;
