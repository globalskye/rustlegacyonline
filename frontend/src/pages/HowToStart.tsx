import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Shield, CheckCircle, Play } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { apiService } from '../services/api';
import * as Types from '../types';

const HowToStart: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [steps, setSteps] = useState<Types.GettingStartedStep[]>([]);
  const [serverInfo, setServerInfo] = useState<Types.ServerInfo | null>(null);

  useEffect(() => {
    loadData();
  }, [i18n.language]);

  const loadData = async () => {
    try {
      const [stepsData, infoData] = await Promise.all([
        apiService.getGettingStartedSteps(i18n.language),
        apiService.getServerInfo()
      ]);
      setSteps(stepsData.sort((a, b) => a.stepNumber - b.stepNumber));
      setServerInfo(infoData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const stepIcons = [Download, Shield, CheckCircle, Play];

  return (
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="section-title">{t('howToStart.title')}</h1>
        <p className="section-subtitle">{t('howToStart.subtitle')}</p>

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
                className="card"
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                style={{
                  display: 'grid',
                  gridTemplateColumns: step.imageUrl ? '1fr 1fr' : '1fr',
                  gap: '2rem',
                  alignItems: 'center'
                }}
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
                      background: 'linear-gradient(135deg, var(--primary-blue), var(--accent-cyan))',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 0 20px var(--glow-blue)'
                    }}>
                      <IconComponent size={24} color="#ffffff" />
                    </div>
                    <div style={{
                      fontFamily: 'Orbitron, sans-serif',
                      fontSize: '1.2rem',
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '2px'
                    }}>
                      Step {step.stepNumber}
                    </div>
                  </div>

                  <h3 style={{
                    fontFamily: 'Orbitron, sans-serif',
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

                {step.imageUrl && (
                  <div style={{
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '1px solid var(--border-color)',
                    boxShadow: '0 10px 40px rgba(14, 165, 233, 0.2)'
                  }}>
                    <img 
                      src={step.imageUrl}
                      alt={step.title}
                      style={{
                        width: '100%',
                        height: 'auto',
                        display: 'block'
                      }}
                    />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{
            marginTop: '4rem',
            display: 'flex',
            gap: '1.5rem',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}
        >
          {serverInfo?.downloadUrl && (
            <motion.a
              href={serverInfo.downloadUrl}
              className="btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Download className="btn-icon" />
              {t('hero.download')}
            </motion.a>
          )}

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
    </div>
  );
};

export default HowToStart;