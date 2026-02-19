import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { apiService } from '../services/api';
import * as Types from '../types';

const Rules: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [rules, setRules] = useState<Types.Rule[]>([]);

  useEffect(() => {
    loadRules();
  }, [i18n.language]);

  const loadRules = async () => {
    try {
      const rulesData = await apiService.getRules(i18n.language);
      setRules((rulesData || []).sort((a, b) => a.order - b.order));
    } catch (error) {
      console.error('Error loading rules:', error);
      setRules([]);
    }
  };

  return (
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="page-header" style={{ marginBottom: '1rem' }}>
          <Shield size={48} color="var(--primary-blue)" style={{ filter: 'drop-shadow(0 0 20px var(--glow-blue))' }} />
          <h1 className="section-title" style={{ marginBottom: 0 }}>{t('rules.title')}</h1>
        </div>
        <p className="section-subtitle">{t('rules.subtitle')}</p>

        {/* Important Notice */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="card"
          style={{
            background: 'rgba(230, 126, 34, 0.1)',
            border: '2px solid var(--border-bright)',
            marginBottom: '3rem'
          }}
        >
          <div style={{
            display: 'flex',
            gap: '1rem',
            alignItems: 'flex-start'
          }}>
            <AlertCircle size={32} color="var(--primary-blue)" style={{ flexShrink: 0, marginTop: '0.2rem' }} />
            <div>
              <h3 style={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: '1.3rem',
                color: 'var(--primary-blue)',
                marginBottom: '0.5rem',
                letterSpacing: '1px'
              }}>
                Important
              </h3>
              <p style={{
                color: 'var(--text-secondary)',
                lineHeight: 1.8,
                fontSize: '1.05rem'
              }}>
                Violation of these rules may result in warnings, temporary bans, or permanent bans depending on the severity. 
                All players are expected to follow these rules to maintain a fair and enjoyable gaming environment.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Rules Content */}
        {rules.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '2rem',
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            {rules.map((rule, index) => (
              <motion.div
                key={rule.id}
                className="card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
              >
                <h2 style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '1.3rem',
                  color: 'var(--text-primary)',
                  marginBottom: '1rem',
                  letterSpacing: '0.5px'
                }}>
                  {rule.title}
                </h2>
                
                <div 
                  style={{
                    color: 'var(--text-secondary)',
                    lineHeight: 1.8,
                    fontSize: '1rem'
                  }}
                  dangerouslySetInnerHTML={{ __html: rule.content }}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            className="card"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            style={{
              textAlign: 'center',
              padding: '4rem 2rem'
            }}
          >
            <Shield size={64} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
            <p style={{
              color: 'var(--text-muted)',
              fontSize: '1.2rem'
            }}>
              Rules are being loaded...
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Rules;
