import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Building2, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { apiService } from '../services/api';
import * as Types from '../types';

const LegalDocument: React.FC = () => {
  const { type } = useParams<{ type: string }>();
  const { t, i18n } = useTranslation();
  const [document, setDocument] = useState<Types.LegalDocument | null>(null);

  useEffect(() => {
    loadDocument();
  }, [type, i18n.language]);

  const loadDocument = async () => {
    if (!type) return;
    
    try {
      // Backend uses company_info, frontend route is /legal/company
      const docType = type === 'company' ? 'company_info' : type;
      const docs = await apiService.getLegalDocuments(i18n.language, docType);
      if (docs.length > 0) {
        setDocument(docs[0]);
      } else {
        setDocument(null);
      }
    } catch (error) {
      console.error('Error loading legal document:', error);
      setDocument(null);
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'terms':
        return FileText;
      case 'privacy':
        return ShieldCheck;
      case 'company':
        return Building2;
      default:
        return FileText;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'terms':
        return t('legal.terms');
      case 'privacy':
        return t('legal.privacy');
      case 'company':
        return t('legal.companyInfo');
      default:
        return t('legal.title');
    }
  };

  const IconComponent = getIcon();

  return (
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="page-header" style={{ marginBottom: '3rem' }}>
          <IconComponent size={48} color="var(--primary-blue)" style={{ filter: 'drop-shadow(0 0 20px var(--glow-blue))' }} />
          <h1 className="section-title" style={{ marginBottom: 0 }}>{getTitle()}</h1>
        </div>

        {document ? (
          <motion.div
            className="card"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              maxWidth: '900px',
              margin: '0 auto'
            }}
          >
            <h2 style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: '1.8rem',
              color: 'var(--text-primary)',
              marginBottom: '1rem',
              letterSpacing: '1px'
            }}>
              {document.title}
            </h2>
            
            <div style={{
              color: 'var(--text-muted)',
              fontSize: '0.9rem',
              marginBottom: '2rem',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              {t('legal.lastUpdated')}: {new Date(document.updatedAt).toLocaleDateString(i18n.language)}
            </div>

            <div 
              style={{
                color: 'var(--text-secondary)',
                lineHeight: 1.8,
                fontSize: '1.05rem'
              }}
              dangerouslySetInnerHTML={{ __html: document.content }}
            />
          </motion.div>
        ) : (
          <motion.div
            className="card"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              textAlign: 'center',
              padding: '4rem 2rem'
            }}
          >
            <IconComponent size={64} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
            <p style={{
              color: 'var(--text-muted)',
              fontSize: '1.2rem'
            }}>
              Loading document...
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default LegalDocument;
