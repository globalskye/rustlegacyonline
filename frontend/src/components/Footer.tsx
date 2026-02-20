import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';
import { apiService } from '../services/api';
import * as Types from '../types';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const [paymentMethods, setPaymentMethods] = useState<Types.PaymentMethod[]>([]);
  const [serverInfo, setServerInfo] = useState<Types.ServerInfo | null>(null);
  const [companyInfo, setCompanyInfo] = useState<Types.CompanyInfo | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [payments, info, company] = await Promise.all([
        apiService.getPaymentMethods(),
        apiService.getServerInfo(),
        apiService.getCompanyInfo().catch(() => null)
      ]);
      setPaymentMethods((payments || []).filter(p => p.enabled).sort((a, b) => a.order - b.order));
      setServerInfo(info || null);
      setCompanyInfo(company || null);
    } catch (error) {
      console.error('Error loading footer data:', error);
      setPaymentMethods([]);
    }
  };

  return (
    <footer style={{
      background: 'var(--bg-darker)',
      borderTop: '1px solid var(--border-color)',
      padding: '4rem 2rem 2rem',
      marginTop: '4rem'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Payment Methods Section */}
        {paymentMethods.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ marginBottom: '3rem', textAlign: 'center' }}
          >
            <h3 style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: '1.5rem',
              color: 'var(--primary-blue)',
              marginBottom: '1.5rem',
              textTransform: 'uppercase',
              letterSpacing: '2px'
            }}>
              {t('payment.title')}
            </h3>
            <p style={{
              color: 'var(--text-secondary)',
              marginBottom: '2rem',
              fontSize: '1rem'
            }}>
              {t('payment.subtitle')}
            </p>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '2rem',
              flexWrap: 'wrap'
            }}>
              {paymentMethods.map((method) => (
                <motion.div
                  key={method.id}
                  whileHover={{ scale: 1.1, y: -5 }}
                  style={{
                    width: '80px',
                    height: '50px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    overflow: 'hidden'
                  }}
                >
                  {method.imageUrl ? (
                    <img 
                      src={method.imageUrl.startsWith('/') ? method.imageUrl : method.imageUrl} 
                      alt={method.name}
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="60" height="30"><rect fill="%23374151" width="60" height="30" rx="4"/><text x="30" y="20" font-size="10" fill="white" text-anchor="middle">${method.name}</text></svg>`);
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textAlign: 'center' }}>{method.name}</span>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Divider */}
        <div style={{
          height: '1px',
          background: 'var(--border-color)',
          margin: '3rem 0'
        }} />

        {/* Footer Content */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          {/* About */}
          <div>
            <h4 style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: '1.2rem',
              color: 'var(--primary-blue)',
              marginBottom: '1rem',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              {serverInfo?.name || 'Rust Legacy'}
            </h4>
            <p style={{
              color: 'var(--text-muted)',
              fontSize: '0.95rem',
              lineHeight: '1.6'
            }}>
              Experience classic Rust Legacy gameplay with modern features and active community support.
            </p>
          </div>

          {/* Legal Links */}
          <div>
            <h4 style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: '1.2rem',
              color: 'var(--primary-blue)',
              marginBottom: '1rem',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              {t('footer.legal')}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link 
                to="/legal/terms"
                style={{
                  color: 'var(--text-muted)',
                  textDecoration: 'none',
                  fontSize: '0.95rem',
                  transition: 'color 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-blue)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                {t('legal.terms')}
              </Link>
              <Link 
                to="/legal/privacy"
                style={{
                  color: 'var(--text-muted)',
                  textDecoration: 'none',
                  fontSize: '0.95rem',
                  transition: 'color 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-blue)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                {t('legal.privacy')}
              </Link>
              <Link 
                to="/company"
                style={{
                  color: 'var(--text-muted)',
                  textDecoration: 'none',
                  fontSize: '0.95rem',
                  transition: 'color 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-blue)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                {t('legal.companyInfo')}
              </Link>
              <Link 
                to="/legal/payment_rules"
                style={{
                  color: 'var(--text-muted)',
                  textDecoration: 'none',
                  fontSize: '0.95rem',
                  transition: 'color 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-blue)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                {t('legal.paymentRules')}
              </Link>
              <Link 
                to="/legal/refund_policy"
                style={{
                  color: 'var(--text-muted)',
                  textDecoration: 'none',
                  fontSize: '0.95rem',
                  transition: 'color 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-blue)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                {t('legal.refundPolicy')}
              </Link>
            </div>
          </div>

          {/* Support */}
          <div>
            <h4 style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: '1.2rem',
              color: 'var(--primary-blue)',
              marginBottom: '1rem',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              {t('footer.support')}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {companyInfo?.email ? (
                <a 
                  href={`mailto:${companyInfo.email}`}
                  style={{
                    color: 'var(--text-muted)',
                    textDecoration: 'none',
                    fontSize: '0.95rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'color 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-blue)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  <Mail size={18} />
                  {companyInfo.email}
                </a>
              ) : (
                <span style={{ color: 'var(--text-muted)', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Mail size={18} />
                  —
                </span>
              )}
              <span style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                {t('footer.socialLinks')}
              </span>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div style={{
          textAlign: 'center',
          paddingTop: '2rem',
          borderTop: '1px solid var(--border-color)',
          color: 'var(--text-muted)',
          fontSize: '0.9rem'
        }}>
          © 2026 {serverInfo?.name || 'Rust Legacy Server'}. {t('footer.rights')}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
