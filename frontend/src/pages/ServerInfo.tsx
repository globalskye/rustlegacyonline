import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Terminal, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { apiService } from '../services/api';
import * as Types from '../types';

const ServerInfo: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [serverDetails, setServerDetails] = useState<Types.ServerDetail[]>([]);
  const [plugins, setPlugins] = useState<Types.Plugin[]>([]);
  const [expandedPlugins, setExpandedPlugins] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadData();
  }, [i18n.language]);

  const loadData = async () => {
    try {
      const [detailsData, pluginsData] = await Promise.all([
        apiService.getServerDetails(i18n.language),
        apiService.getPlugins(i18n.language)
      ]);
      setServerDetails(detailsData.sort((a, b) => a.order - b.order));
      setPlugins(pluginsData.sort((a, b) => a.order - b.order));
    } catch (error) {
      console.error('Error loading server info:', error);
    }
  };

  const togglePlugin = (id: number) => {
    setExpandedPlugins(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const groupedDetails = serverDetails.reduce((acc, detail) => {
    if (!acc[detail.section]) {
      acc[detail.section] = [];
    }
    acc[detail.section].push(detail);
    return acc;
  }, {} as Record<string, Types.ServerDetail[]>);

  return (
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="section-title">{t('serverInfo.title')}</h1>

        {/* Server Details Sections */}
        {Object.entries(groupedDetails).map(([section, details], sectionIndex) => (
          <motion.div
            key={section}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: sectionIndex * 0.1 }}
            style={{ marginBottom: '4rem' }}
          >
            <h2 style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '2rem',
              color: 'var(--primary-blue)',
              marginBottom: '2rem',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <Info size={32} />
              {section === 'about' ? t('serverInfo.aboutTitle') : section}
            </h2>

            <div style={{
              display: 'grid',
              gap: '1.5rem'
            }}>
              {details.map((detail, index) => (
                <motion.div
                  key={detail.id}
                  className="card"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <h3 style={{
                    fontFamily: 'Orbitron, sans-serif',
                    fontSize: '1.4rem',
                    color: 'var(--text-primary)',
                    marginBottom: '1rem',
                    letterSpacing: '1px'
                  }}>
                    {detail.title}
                  </h3>
                  <div 
                    style={{
                      color: 'var(--text-secondary)',
                      lineHeight: 1.8,
                      fontSize: '1.05rem'
                    }}
                    dangerouslySetInnerHTML={{ __html: detail.content }}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}

        {/* Plugins Section */}
        {plugins.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ marginTop: '4rem' }}
          >
            <h2 style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '2rem',
              color: 'var(--primary-blue)',
              marginBottom: '2rem',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <Terminal size={32} />
              {t('serverInfo.pluginsTitle')}
            </h2>

            <div style={{ display: 'grid', gap: '1rem' }}>
              {plugins.map((plugin, index) => (
                <motion.div
                  key={plugin.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <div
                    className="card"
                    style={{ cursor: 'pointer', padding: '1.5rem' }}
                    onClick={() => togglePlugin(plugin.id)}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <h3 style={{
                          fontFamily: 'Orbitron, sans-serif',
                          fontSize: '1.3rem',
                          color: 'var(--text-primary)',
                          marginBottom: '0.5rem',
                          letterSpacing: '1px'
                        }}>
                          {plugin.name}
                        </h3>
                        <p style={{
                          color: 'var(--text-secondary)',
                          fontSize: '1rem'
                        }}>
                          {plugin.description}
                        </p>
                      </div>
                      <motion.div
                        animate={{ rotate: expandedPlugins.has(plugin.id) ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {expandedPlugins.has(plugin.id) ? (
                          <ChevronUp size={24} color="var(--primary-blue)" />
                        ) : (
                          <ChevronDown size={24} color="var(--primary-blue)" />
                        )}
                      </motion.div>
                    </div>

                    <AnimatePresence>
                      {expandedPlugins.has(plugin.id) && plugin.commands.length > 0 && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          style={{ overflow: 'hidden' }}
                        >
                          <div style={{
                            marginTop: '1.5rem',
                            paddingTop: '1.5rem',
                            borderTop: '1px solid var(--border-color)'
                          }}>
                            <h4 style={{
                              fontFamily: 'Orbitron, sans-serif',
                              fontSize: '1.1rem',
                              color: 'var(--primary-blue)',
                              marginBottom: '1rem',
                              textTransform: 'uppercase',
                              letterSpacing: '1px'
                            }}>
                              {t('serverInfo.commandsTitle')}
                            </h4>
                            <div style={{
                              display: 'grid',
                              gap: '1rem'
                            }}>
                              {plugin.commands.map((cmd) => (
                                <div
                                  key={cmd.id}
                                  style={{
                                    background: 'rgba(14, 165, 233, 0.05)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '6px',
                                    padding: '1rem'
                                  }}
                                >
                                  <div style={{
                                    fontFamily: 'monospace',
                                    fontSize: '1rem',
                                    color: 'var(--accent-cyan)',
                                    marginBottom: '0.5rem',
                                    fontWeight: 600
                                  }}>
                                    {cmd.command}
                                  </div>
                                  <div style={{
                                    color: 'var(--text-secondary)',
                                    fontSize: '0.95rem',
                                    marginBottom: cmd.usage ? '0.5rem' : 0
                                  }}>
                                    {cmd.description}
                                  </div>
                                  {cmd.usage && (
                                    <div style={{
                                      fontFamily: 'monospace',
                                      fontSize: '0.9rem',
                                      color: 'var(--text-muted)',
                                      fontStyle: 'italic'
                                    }}>
                                      Usage: {cmd.usage}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default ServerInfo;
