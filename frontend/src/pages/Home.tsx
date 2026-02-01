import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Download, Users, Zap, Shield, Info, ChevronRight, Play, CheckCircle, AlertCircle, Server, Activity, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import * as Types from '../types';

const Home: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [serverStatuses, setServerStatuses] = useState<Types.ServerStatus[]>([]);
  const [features, setFeatures] = useState<Types.Feature[]>([]);
  const [howToStartSteps, setHowToStartSteps] = useState<Types.HowToStartStep[]>([]);
  const [serverDetails, setServerDetails] = useState<Types.ServerDetail[]>([]);
  const [rules, setRules] = useState<Types.Rule[]>([]);
  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadServerStatuses, 30000);
    return () => clearInterval(interval);
  }, [i18n.language]);

  const loadData = async () => {
    setLoading(true);
    setApiError(null);
    try {
      const [statusData, featuresData, stepsData, detailsData, rulesData] = await Promise.all([
        apiService.getServerStatus(),
        apiService.getFeatures(i18n.language),
        apiService.getHowToStartSteps(i18n.language),
        apiService.getServerDetails(i18n.language, 'description'),
        apiService.getRules(i18n.language)
      ]);
      
      setServerStatuses(statusData || []);
      setFeatures((featuresData || []).sort((a, b) => a.order - b.order));
      setHowToStartSteps((stepsData || []).sort((a, b) => a.stepNumber - b.stepNumber));
      setServerDetails((detailsData || []).sort((a, b) => a.order - b.order));
      setRules((rulesData || []).sort((a, b) => a.order - b.order));
    } catch (error) {
      console.error('Error loading data:', error);
      setApiError(error instanceof Error ? error.message : 'Failed to load data. Is the API running?');
    } finally {
      setLoading(false);
    }
  };

  const loadServerStatuses = async () => {
    try {
      const statusData = await apiService.getServerStatus();
      setServerStatuses(statusData || []);
    } catch (error) {
      console.error('Error loading server statuses:', error);
    }
  };

  const handlePlayerClick = (steamId: string) => {
    navigate(`/statistics?player=${steamId}`);
  };

  const iconMap: { [key: string]: React.FC<any> } = {
    zap: Zap,
    users: Users,
    shield: Shield,
    info: Info,
  };

  const stepIcons = [Download, Shield, CheckCircle, Play];

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} style={{ textAlign: 'center' }}>
          <Server size={80} color="var(--primary-blue)" style={{ marginBottom: '1rem', filter: 'drop-shadow(0 0 20px var(--glow-blue))' }} />
          <p style={{ color: 'var(--text-secondary)', fontFamily: 'Orbitron' }}>Loading...</p>
        </motion.div>
      </div>
    );
  }

  if (apiError) {
    return (
      <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <motion.div className="card" style={{ maxWidth: 500, textAlign: 'center' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <AlertCircle size={64} color="#ef4444" style={{ marginBottom: '1rem' }} />
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>API Connection Error</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{apiError}</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Ensure backend is running: docker-compose up -d</p>
          <button onClick={loadData} className="btn" style={{ marginTop: '1rem' }}>Retry</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <motion.div 
        className="background-layer"
        style={{ y: backgroundY }}
      />
      
      {/* Server Monitoring Section */}
      <section style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '6rem 2rem 2rem',
        overflow: 'hidden'
      }}>
        <motion.div 
          style={{
            maxWidth: '1400px',
            width: '100%',
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
              fontSize: 'clamp(2rem, 6vw, 3.5rem)',
              fontWeight: 900,
              background: 'linear-gradient(135deg, var(--primary-blue), var(--accent-cyan))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textTransform: 'uppercase',
              letterSpacing: '6px',
              marginBottom: '3rem',
              textAlign: 'center',
              textShadow: '0 0 60px var(--glow-blue)'
            }}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Server Monitoring
          </motion.h1>

          {/* Server Status Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
            gap: '2rem',
            marginBottom: '3rem'
          }}>
            {serverStatuses.map((server, index) => (
              <motion.div
                key={server.serverId}
                className="card"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                style={{
                  background: server.isOnline 
                    ? 'linear-gradient(135deg, rgba(14, 165, 233, 0.1), rgba(6, 182, 212, 0.05))'
                    : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05))',
                  border: server.isOnline 
                    ? '2px solid var(--border-bright)'
                    : '2px solid rgba(239, 68, 68, 0.5)'
                }}
              >
                {/* Server Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      width: 50,
                      height: 50,
                      background: server.isOnline 
                        ? 'linear-gradient(135deg, var(--primary-blue), var(--accent-cyan))'
                        : 'linear-gradient(135deg, #ef4444, #dc2626)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: server.isOnline 
                        ? '0 0 20px var(--glow-blue)'
                        : '0 0 20px rgba(239, 68, 68, 0.5)'
                    }}>
                      <Server size={26} color="#ffffff" />
                    </div>
                    <div>
                      <h2 style={{
                        fontFamily: 'Orbitron, sans-serif',
                        fontSize: '1.5rem',
                        color: 'var(--text-primary)',
                        marginBottom: '0.25rem',
                        letterSpacing: '1px'
                      }}>
                        {server.serverName}
                      </h2>
                      <div style={{
                        fontSize: '0.9rem',
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                      }}>
                        {server.serverType === 'classic' ? 'Classic Mode' : 'Deathmatch'}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    background: server.isOnline 
                      ? 'rgba(34, 197, 94, 0.2)'
                      : 'rgba(239, 68, 68, 0.2)',
                    borderRadius: '6px',
                    border: server.isOnline 
                      ? '1px solid rgba(34, 197, 94, 0.5)'
                      : '1px solid rgba(239, 68, 68, 0.5)'
                  }}>
                    <div style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: server.isOnline ? '#22c55e' : '#ef4444',
                      boxShadow: server.isOnline 
                        ? '0 0 10px #22c55e'
                        : '0 0 10px #ef4444'
                    }} />
                    <span style={{
                      color: server.isOnline ? '#22c55e' : '#ef4444',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      fontSize: '0.85rem',
                      letterSpacing: '1px'
                    }}>
                      {server.isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>

                {server.isOnline && (
                  <>
                    {/* Server Stats */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '1rem',
                      marginBottom: '1.5rem'
                    }}>
                      <div style={{
                        background: 'rgba(15, 23, 42, 0.6)',
                        padding: '1rem',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        textAlign: 'center'
                      }}>
                        <Users size={24} color="var(--primary-blue)" style={{ marginBottom: '0.5rem' }} />
                        <div style={{
                          fontFamily: 'Orbitron, sans-serif',
                          fontSize: '1.8rem',
                          color: 'var(--text-primary)',
                          marginBottom: '0.25rem'
                        }}>
                          {server.currentPlayers}/{server.maxPlayers}
                        </div>
                        <div style={{
                          fontSize: '0.8rem',
                          color: 'var(--text-muted)',
                          textTransform: 'uppercase'
                        }}>
                          Players
                        </div>
                      </div>

                      <div style={{
                        background: 'rgba(15, 23, 42, 0.6)',
                        padding: '1rem',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        textAlign: 'center'
                      }}>
                        <Activity size={24} color="var(--primary-blue)" style={{ marginBottom: '0.5rem' }} />
                        <div style={{
                          fontFamily: 'Orbitron, sans-serif',
                          fontSize: '1.8rem',
                          color: 'var(--text-primary)',
                          marginBottom: '0.25rem'
                        }}>
                          {server.map}
                        </div>
                        <div style={{
                          fontSize: '0.8rem',
                          color: 'var(--text-muted)',
                          textTransform: 'uppercase'
                        }}>
                          Map
                        </div>
                      </div>

                      <div style={{
                        background: 'rgba(15, 23, 42, 0.6)',
                        padding: '1rem',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        textAlign: 'center'
                      }}>
                        <Clock size={24} color="var(--primary-blue)" style={{ marginBottom: '0.5rem' }} />
                        <div style={{
                          fontFamily: 'Orbitron, sans-serif',
                          fontSize: '1.8rem',
                          color: 'var(--text-primary)',
                          marginBottom: '0.25rem'
                        }}>
                          {formatUptime(server.uptime)}
                        </div>
                        <div style={{
                          fontSize: '0.8rem',
                          color: 'var(--text-muted)',
                          textTransform: 'uppercase'
                        }}>
                          Uptime
                        </div>
                      </div>
                    </div>

                    {/* Connection Info */}
                    <div style={{
                      background: 'rgba(15, 23, 42, 0.6)',
                      padding: '1rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      marginBottom: '1.5rem'
                    }}>
                      <div style={{
                        fontFamily: 'monospace',
                        color: 'var(--primary-blue)',
                        fontSize: '1.1rem',
                        textAlign: 'center',
                        letterSpacing: '1px'
                      }}>
                        {server.ip}:{server.port}
                      </div>
                    </div>

                    {/* Active Players */}
                    {server.activePlayers && server.activePlayers.length > 0 && (
                      <div>
                        <h3 style={{
                          fontFamily: 'Orbitron, sans-serif',
                          fontSize: '1.1rem',
                          color: 'var(--text-primary)',
                          marginBottom: '1rem',
                          textTransform: 'uppercase',
                          letterSpacing: '1px'
                        }}>
                          Active Players ({server.activePlayers.length})
                        </h3>
                        <div style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '0.5rem'
                        }}>
                          {server.activePlayers.slice(0, 10).map((player) => (
                            <motion.button
                              key={player.steamId}
                              onClick={() => handlePlayerClick(player.steamId)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              style={{
                                padding: '0.5rem 1rem',
                                background: 'rgba(14, 165, 233, 0.1)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '6px',
                                color: 'var(--text-secondary)',
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                fontFamily: 'Exo 2, sans-serif',
                                fontWeight: 600
                              }}
                            >
                              {player.username}
                            </motion.button>
                          ))}
                          {server.activePlayers.length > 10 && (
                            <div style={{
                              padding: '0.5rem 1rem',
                              color: 'var(--text-muted)',
                              fontSize: '0.9rem',
                              display: 'flex',
                              alignItems: 'center'
                            }}>
                              +{server.activePlayers.length - 10} more
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {!server.isOnline && (
                  <div style={{
                    textAlign: 'center',
                    padding: '2rem',
                    color: 'var(--text-muted)'
                  }}>
                    <AlertCircle size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <p>Server is currently offline</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* How To Start Section */}
      {howToStartSteps.length > 0 && (
        <section style={{ padding: '4rem 2rem', maxWidth: '1400px', margin: '0 auto' }}>
          <motion.h2 
            className="section-title"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {t('howToStart.title')}
          </motion.h2>
          <p className="section-subtitle">{t('howToStart.subtitle')}</p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
            marginTop: '3rem'
          }}>
            {howToStartSteps.slice(0, 4).map((step, index) => {
              const IconComponent = stepIcons[index % stepIcons.length];
              return (
                <motion.div
                  key={step.id}
                  className="card"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  style={{ textAlign: 'center' }}
                >
                  <div style={{
                    width: 60,
                    height: 60,
                    margin: '0 auto 1.5rem',
                    background: 'linear-gradient(135deg, var(--primary-blue), var(--accent-cyan))',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 20px var(--glow-blue)'
                  }}>
                    <IconComponent size={30} color="#ffffff" />
                  </div>

                  <div style={{
                    fontFamily: 'Orbitron, sans-serif',
                    fontSize: '0.9rem',
                    color: 'var(--text-muted)',
                    marginBottom: '1rem',
                    textTransform: 'uppercase',
                    letterSpacing: '2px'
                  }}>
                    Step {step.stepNumber}
                  </div>

                  <h3 style={{
                    fontFamily: 'Orbitron, sans-serif',
                    fontSize: '1.3rem',
                    color: 'var(--primary-blue)',
                    marginBottom: '1rem',
                    letterSpacing: '1px'
                  }}>
                    {step.title}
                  </h3>

                  <div 
                    style={{
                      color: 'var(--text-secondary)',
                      lineHeight: 1.6,
                      fontSize: '0.95rem',
                      textAlign: 'left'
                    }}
                    dangerouslySetInnerHTML={{ __html: step.content }}
                  />
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            style={{ textAlign: 'center', marginTop: '3rem' }}
          >
            <Link to="/how-to-start" className="btn btn-secondary">
              View Full Guide
              <ChevronRight className="btn-icon" />
            </Link>
          </motion.div>
        </section>
      )}

      {/* Server Info Section */}
      {serverDetails.length > 0 && (
        <section style={{ padding: '4rem 2rem', maxWidth: '1400px', margin: '0 auto' }}>
          <motion.h2 
            className="section-title"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {t('serverInfo.title')}
          </motion.h2>

          <div style={{
            display: 'grid',
            gap: '2rem',
            marginTop: '3rem'
          }}>
            {serverDetails.map((detail, index) => (
              <motion.div
                key={detail.id}
                className="card"
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                style={{
                  display: 'grid',
                  gridTemplateColumns: (detail.imageUrl || detail.videoUrl) ? '1fr 1fr' : '1fr',
                  gap: '2rem',
                  alignItems: 'center'
                }}
              >
                <div>
                  <h3 style={{
                    fontFamily: 'Orbitron, sans-serif',
                    fontSize: '1.5rem',
                    color: 'var(--primary-blue)',
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
                    aspectRatio: '16/9'
                  }}>
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
                    border: '1px solid var(--border-color)'
                  }}>
                    <img 
                      src={detail.imageUrl}
                      alt={detail.title}
                      style={{ width: '100%', display: 'block' }}
                    />
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            style={{ textAlign: 'center', marginTop: '3rem' }}
          >
            <Link to="/server-info" className="btn btn-secondary">
              View More Details
              <ChevronRight className="btn-icon" />
            </Link>
          </motion.div>
        </section>
      )}

      {/* Rules Section */}
      {rules.length > 0 && (
        <section style={{ padding: '4rem 2rem', maxWidth: '1400px', margin: '0 auto' }}>
          <motion.h2 
            className="section-title"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {t('rules.title')}
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="card"
            style={{
              background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.1), rgba(6, 182, 212, 0.05))',
              border: '2px solid var(--border-bright)',
              marginBottom: '2rem',
              marginTop: '3rem'
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
                  fontFamily: 'Orbitron, sans-serif',
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
                  {t('rules.subtitle')}
                </p>
              </div>
            </div>
          </motion.div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            {rules.slice(0, 6).map((rule, index) => (
              <motion.div
                key={rule.id}
                className="card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
              >
                <h3 style={{
                  fontFamily: 'Orbitron, sans-serif',
                  fontSize: '1.2rem',
                  color: 'var(--text-primary)',
                  marginBottom: '1rem',
                  letterSpacing: '0.5px'
                }}>
                  {rule.title}
                </h3>
                <div 
                  style={{
                    color: 'var(--text-secondary)',
                    lineHeight: 1.6,
                    fontSize: '0.95rem'
                  }}
                  dangerouslySetInnerHTML={{ __html: rule.content }}
                />
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            style={{ textAlign: 'center', marginTop: '3rem' }}
          >
            <Link to="/rules" className="btn btn-secondary">
              View All Rules
              <ChevronRight className="btn-icon" />
            </Link>
          </motion.div>
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
