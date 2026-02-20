import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, Terminal, Info, Server, ChevronRight } from 'lucide-react';
import ServerDescriptionBlock from '../components/ServerDescriptionBlock';
import { useTranslation } from 'react-i18next';
import { apiService } from '../services/api';
import * as Types from '../types';

const ServerInfo: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { serverId: urlServerId } = useParams<{ serverId: string }>();
  const navigate = useNavigate();
  const [serverStatuses, setServerStatuses] = useState<Types.ServerStatus[]>([]);
  const [selectedServerId, setSelectedServerId] = useState<number | null>(null);
  const [descriptionDetails, setDescriptionDetails] = useState<Types.ServerDetail[]>([]);
  const [plugins, setPlugins] = useState<Types.Plugin[]>([]);
  const [expandedPlugins, setExpandedPlugins] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiService.getServerStatus().then(data => {
      setServerStatuses(data || []);
      const sid = urlServerId ? parseInt(urlServerId, 10) : null;
      if (sid && (data || []).some((s: Types.ServerStatus) => s.serverId === sid)) {
        setSelectedServerId(sid);
      } else if ((data || []).length > 0 && !sid) {
        setSelectedServerId((data || [])[0].serverId);
      } else {
        setSelectedServerId(null);
      }
    }).finally(() => setLoading(false));
  }, [urlServerId]);

  useEffect(() => {
    if (selectedServerId == null) return;
    setLoading(true);
    Promise.all([
      apiService.getServerDetails(i18n.language, 'description', selectedServerId),
      apiService.getPlugins(i18n.language, selectedServerId)
    ])
      .then(([descData, pluginsData]) => {
        setDescriptionDetails((descData || []).sort((a, b) => a.order - b.order));
        setPlugins((pluginsData || []).sort((a, b) => a.order - b.order));
      })
      .catch(() => {
        setDescriptionDetails([]);
        setPlugins([]);
      })
      .finally(() => setLoading(false));
  }, [selectedServerId, i18n.language]);

  const selectServer = (id: number) => {
    setSelectedServerId(id);
    navigate(`/server-info/${id}`, { replace: true });
  };

  const togglePlugin = (id: number) => {
    setExpandedPlugins(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const selectedServer = serverStatuses.find(s => s.serverId === selectedServerId);

  return (
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="page-header" style={{ marginBottom: '2rem' }}>
          <Info size={48} color="var(--primary-blue)" style={{ filter: 'drop-shadow(0 0 20px var(--glow-blue))' }} />
          <h1 className="section-title" style={{ marginBottom: 0 }}>{t('serverInfo.title')}</h1>
        </div>

        {/* Server selector */}
        {serverStatuses.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: '1.2rem',
              color: 'var(--text-secondary)',
              marginBottom: '1rem',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              {i18n.language === 'ru' ? 'Выберите сервер' : 'Select server'}
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              {serverStatuses.map((server) => (
                <button
                  key={server.serverId}
                  onClick={() => selectServer(server.serverId)}
                  className={`card ${selectedServerId === server.serverId ? 'monitoring-online' : ''}`}
                  style={{
                    padding: '1rem 1.5rem',
                    cursor: 'pointer',
                    border: selectedServerId === server.serverId ? '2px solid rgba(74, 222, 128, 0.5)' : undefined,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    textAlign: 'left',
                    minWidth: 200
                  }}
                >
                  <Server size={24} color="var(--primary-blue)" />
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{server.serverName}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {server.serverType === 'classic' ? 'Classic' : 'Deathmatch'} · {server.currentPlayers}/{server.maxPlayers}
                    </div>
                  </div>
                  <ChevronRight size={20} color="var(--text-muted)" style={{ marginLeft: 'auto' }} />
                </button>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
        ) : selectedServer && (
          <>
            <div style={{
              marginBottom: '2rem',
              padding: '1.25rem 1.5rem',
              background: 'rgba(230, 126, 34, 0.08)',
              border: '1px solid var(--border-color)',
              borderRadius: 12
            }}>
              <h3 style={{ fontFamily: 'Poppins', fontSize: '1.5rem', color: 'var(--primary)', marginBottom: '0.5rem', textAlign: 'center' }}>
                {selectedServer.serverName}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', textAlign: 'center' }}>
                {selectedServer.serverType === 'classic' ? 'Classic' : 'Deathmatch'} · {selectedServer.ip}:{selectedServer.port}
              </p>
            </div>

            {/* Server Description Block (Classic server only) */}
            <ServerDescriptionBlock serverId={selectedServerId ?? 0} />

            {/* Server Description Section (from API) */}
            {descriptionDetails.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                style={{ marginBottom: '4rem' }}
              >
                <h2 style={{
                  fontFamily: 'Poppins', fontSize: '2.25rem', color: 'var(--primary-blue)',
                  marginBottom: '2rem', textTransform: 'uppercase', letterSpacing: '2px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem',
                  textAlign: 'center'
                }}>
                  <Info size={36} />
                  {t('serverInfo.aboutTitle')}
                </h2>

                <div style={{ display: 'grid', gap: '2rem' }}>
                  {descriptionDetails.map((detail, index) => (
                    <motion.div
                      key={detail.id}
                      className="card"
                      initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                      <h3 style={{
                        fontFamily: 'Poppins', fontSize: '1.75rem', color: 'var(--text-primary)',
                        marginBottom: '1rem', letterSpacing: '1px', textAlign: 'center'
                      }}>
                        {detail.title}
                      </h3>
                      <div
                        style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1.15rem' }}
                        dangerouslySetInnerHTML={{ __html: detail.content }}
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Plugins Section */}
            {plugins.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                style={{ marginTop: '4rem' }}
              >
                <h2 style={{
                  fontFamily: 'Poppins', fontSize: '2.25rem', color: 'var(--primary-blue)',
                  marginBottom: '2rem', textTransform: 'uppercase', letterSpacing: '2px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem',
                  textAlign: 'center'
                }}>
                  <Terminal size={36} />
                  {t('serverInfo.pluginsTitle')}
                </h2>

                <div style={{ display: 'grid', gap: '1rem' }}>
                  {plugins.map((plugin, index) => (
                    <motion.div
                      key={plugin.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                    >
                      <div
                        className="card"
                        style={{ cursor: 'pointer', padding: '1.5rem' }}
                        onClick={() => togglePlugin(plugin.id)}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <h3 style={{
                              fontFamily: 'Poppins', fontSize: '1.5rem', color: 'var(--text-primary)',
                              marginBottom: '0.5rem', letterSpacing: '1px'
                            }}>
                              {plugin.name}
                            </h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
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
                                marginTop: '1.5rem', paddingTop: '1.5rem',
                                borderTop: '1px solid var(--border-color)'
                              }}>
                                <h4 style={{
                                  fontFamily: 'Poppins', fontSize: '1.35rem', color: 'var(--primary-blue)',
                                  marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px',
                                  textAlign: 'center'
                                }}>
                                  {t('serverInfo.commandsTitle')}
                                </h4>
                                <div style={{ display: 'grid', gap: '1rem' }}>
                                  {plugin.commands.map((cmd) => (
                                    <div
                                      key={cmd.id}
                                      style={{
                                        background: 'rgba(230, 126, 34, 0.05)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '6px',
                                        padding: '1.25rem'
                                      }}
                                    >
                                      <div style={{
                                        fontFamily: 'monospace', fontSize: '1.1rem',
                                        color: 'var(--accent-cyan)', marginBottom: '0.5rem', fontWeight: 600
                                      }}>
                                        {cmd.command}
                                      </div>
                                      <div style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginBottom: cmd.usage ? '0.5rem' : 0 }}>
                                        {cmd.description}
                                      </div>
                                      {cmd.usage && (
                                        <div style={{ fontFamily: 'monospace', fontSize: '1rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
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

            {descriptionDetails.length === 0 && plugins.length === 0 && (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
                {i18n.language === 'ru' ? 'Нет информации для этого сервера.' : 'No info for this server yet.'}
              </p>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
};

export default ServerInfo;
