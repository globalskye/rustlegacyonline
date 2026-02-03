import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Download, Users, Zap, Shield, Info, ChevronRight, Play, CheckCircle, AlertCircle, Server, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import * as Types from '../types';
import { OnlineChart } from '../components/OnlineChart';
import { WipeCountdown } from '../components/WipeCountdown';

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
    const interval = setInterval(loadServerStatuses, 10000); // обновление раз в 10 сек
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
          <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
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
      <section className="monitoring-section">
        <motion.div 
          className="monitoring-inner"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.h1 
            className="monitoring-title"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Server Monitoring
          </motion.h1>

          {/* Server Status Cards */}
          <div className="monitoring-cards">
            {serverStatuses.map((server, index) => (
              <motion.div
                key={server.serverId}
                className={`card monitoring-card ${server.isOnline ? 'monitoring-online' : 'monitoring-offline'}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
              >
                {/* Server Header */}
                <div className="monitoring-header">
                  <div className="monitoring-header-left">
                    <div className={`monitoring-icon ${server.isOnline ? 'online' : 'offline'}`}>
                      <Server size={26} color="#ffffff" />
                    </div>
                    <div>
                      <h2 className="monitoring-server-name">{server.serverName}</h2>
                      <div className="monitoring-server-type">
                        {server.serverType === 'classic' ? 'Classic Mode' : 'Deathmatch'}
                      </div>
                    </div>
                  </div>
                  <div className={`monitoring-status-badge ${server.isOnline ? 'online' : 'offline'}`}>
                    <div className="monitoring-status-dot" />
                    <span>{server.isOnline ? 'Online' : 'Offline'}</span>
                  </div>
                </div>

                {server.isOnline && (
                  <>
                    {/* Server Stats + Wipe Schedule */}
                    <WipeCountdown />
                    <div className="monitoring-stats-grid">
                      <div className="monitoring-stat-box">
                        <Users size={24} color="var(--primary-blue)" style={{ marginBottom: '0.5rem' }} />
                        <div className="monitoring-stat-value">{server.currentPlayers}/{server.maxPlayers}</div>
                        <div className="monitoring-stat-label">Players</div>
                      </div>
                      <div className="monitoring-stat-box">
                        <Clock size={24} color="var(--primary-blue)" style={{ marginBottom: '0.5rem' }} />
                        <div className="monitoring-stat-value">{formatUptime(server.uptime)}</div>
                        <div className="monitoring-stat-label">Uptime</div>
                      </div>
                    </div>

                    {/* Online Chart */}
                    <OnlineChart serverType={server.serverType} serverName={server.serverName} />

                    {/* Active Players */}
                    {server.activePlayers && server.activePlayers.length > 0 && (
                      <div className="monitoring-players">
                        <h3 className="monitoring-players-title">
                          Active Players ({server.activePlayers.length})
                        </h3>
                        <div className="monitoring-players-list">
                          {server.activePlayers.slice(0, 10).map((player) => (
                            <motion.button
                              key={player.steamId}
                              className="monitoring-player-btn"
                              onClick={() => handlePlayerClick(player.steamId)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {player.username}
                            </motion.button>
                          ))}
                          {server.activePlayers.length > 10 && (
                            <div className="monitoring-more-players">
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
                    background: 'var(--primary-blue)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px var(--glow-blue)'
                  }}>
                    <IconComponent size={30} color="#ffffff" />
                  </div>

                  <div style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '0.9rem',
                    color: 'var(--text-muted)',
                    marginBottom: '1rem',
                    textTransform: 'uppercase',
                    letterSpacing: '2px'
                  }}>
                    Step {step.stepNumber}
                  </div>

                  <h3 style={{
                    fontFamily: 'Poppins, sans-serif',
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
                    fontFamily: 'Poppins, sans-serif',
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
              background: 'rgba(56, 189, 248, 0.08)',
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
                  fontFamily: 'Poppins, sans-serif',
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

      {/* FAQ Section */}
      <section style={{ padding: '4rem 2rem', maxWidth: '900px', margin: '0 auto' }}>
        <motion.h2 
          className="section-title"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {t('faq.title')}
        </motion.h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
          {[
            { q: t('faq.q1'), a: t('faq.a1') },
            { q: t('faq.q2'), a: t('faq.a2') },
            { q: t('faq.q3'), a: t('faq.a3') },
            { q: t('faq.q4'), a: t('faq.a4') },
          ].map((item, i) => (
            <motion.div
              key={i}
              className="card"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <h4 style={{ fontFamily: 'Poppins', fontSize: '1rem', color: 'var(--primary-blue)', marginBottom: '0.5rem' }}>{item.q}</h4>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{item.a}</p>
            </motion.div>
          ))}
        </div>
      </section>

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
                  fontFamily: 'Poppins, sans-serif',
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
