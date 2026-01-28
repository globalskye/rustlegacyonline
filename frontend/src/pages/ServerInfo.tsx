import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Terminal, Info, Image as ImageIcon, Video } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { apiService } from '../services/api';
import * as Types from '../types';

const ServerInfo: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [descriptionDetails, setDescriptionDetails] = useState<Types.ServerDetail[]>([]);
  const [plugins, setPlugins] = useState<Types.Plugin[]>([]);
  const [expandedPlugins, setExpandedPlugins] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadData();
  }, [i18n.language]);

  const loadData = async () => {
    try {
      const [descData, pluginsData] = await Promise.all([
        apiService.getServerDetails(i18n.language, 'description'),
        apiService.getPlugins(i18n.language)
      ]);
      setDescriptionDetails(descData.sort((a, b) => a.order - b.order));
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

  return (
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="section-title">{t('serverInfo.title')}</h1>

        {/* Server Description Section */}
        {descriptionDetails.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
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
              {t('serverInfo.aboutTitle')}
            </h2>

            <div style={{
              display: 'grid',
              gap: '2rem'
            }}>
              {descriptionDetails.map((detail, index) => (
                <motion.div
                  key={detail.id}
                  className="card"
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: (detail.imageUrl || detail.videoUrl) ? 'repeat(auto-fit, minmax(300px, 1fr))' : '1fr',
                    gap: '2rem',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <h3 style={{
                      fontFamily: 'Orbitron, sans-serif',
                      fontSize: '1.5rem',
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
                  </div>

                  {detail.videoUrl && (
                    <div style={{
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: '1px solid var(--border-color)',
                      boxShadow: '0 10px 40px rgba(14, 165, 233, 0.2)',
                      position: 'relative',
                      aspectRatio: '16/9'
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: '0.5rem',
                        right: '0.5rem',
                        background: 'rgba(14, 165, 233, 0.2)',
                        padding: '0.3rem 0.6rem',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        backdropFilter: 'blur(10px)'
                      }}>
                        <Video size={14} color="var(--primary-blue)" />
                        <span style={{
                          color: 'var(--primary-blue)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          textTransform: 'uppercase'
                        }}>
                          Video
                        </span>
                      </div>
                      <iframe
                        width="100%"
                        height="100%"
                        src={detail.videoUrl.replace('watch?v=', 'embed/')}
                        title={detail.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}

                  {detail.imageUrl && !detail.videoUrl && (
                    <div style={{
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: '1px solid var(--border-color)',
                      boxShadow: '0 10px 40px rgba(14, 165, 233, 0.2)',
                      position: 'relative'
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: '0.5rem',
                        right: '0.5rem',
                        background: 'rgba(14, 165, 233, 0.2)',
                        padding: '0.3rem 0.6rem',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        backdropFilter: 'blur(10px)'
                      }}>
                        <ImageIcon size={14} color="var(--primary-blue)" />
                        <span style={{
                          color: 'var(--primary-blue)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          textTransform: 'uppercase'
                        }}>
                          Image
                        </span>
                      </div>
                      <img 
                        src={detail.imageUrl}
                        alt={detail.title}
                        style={{
                          width: '100%',
                          display: 'block',
                          transition: 'transform 0.3s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

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
