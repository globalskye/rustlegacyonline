import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Download, Users, Zap, Shield, Info, ChevronRight, Play, CheckCircle, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import * as Types from '../types';

const Home: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [serverInfo, setServerInfo] = useState<Types.ServerInfo | null>(null);
  const [features, setFeatures] = useState<Types.Feature[]>([]);
  const [howToStartSteps, setHowToStartSteps] = useState<Types.HowToStartStep[]>([]);
  const [serverDetails, setServerDetails] = useState<Types.ServerDetail[]>([]);
  const [rules, setRules] = useState<Types.Rule[]>([]);
  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);

  useEffect(() => {
    loadData();
  }, [i18n.language]);

  const loadData = async () => {
    try {
      const [serverData, featuresData, stepsData, detailsData, rulesData] = await Promise.all([
        apiService.getServerInfo(),
        apiService.getFeatures(i18n.language),
        apiService.getHowToStartSteps(i18n.language),
        apiService.getServerDetails(i18n.language, 'description'),
        apiService.getRules(i18n.language)
      ]);
      
      setServerInfo(serverData);
      setFeatures(featuresData.sort((a, b) => a.order - b.order));
      setHowToStartSteps(stepsData.sort((a, b) => a.stepNumber - b.stepNumber));
      setServerDetails(detailsData.sort((a, b) => a.order - b.order));
      setRules(rulesData.sort((a, b) => a.order - b.order));
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const currentDescription = serverInfo?.descriptions.find(d => d.language === i18n.language)?.content;

  const iconMap: { [key: string]: React.FC<any> } = {
    zap: Zap,
    users: Users,
    shield: Shield,
    info: Info,
  };

  const stepIcons = [Download, Shield, CheckCircle, Play];

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <motion.div 
        className="background-layer"
        style={{ y: backgroundY }}
      />
      
      {/* Hero Section */}
      <section style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        overflow: 'hidden'
      }}>
        <motion.div 
          style={{
            maxWidth: '1000px',
            textAlign: 'center',
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
              fontSize: 'clamp(3rem, 10vw, 7rem)',
              fontWeight: 900,
              background: 'linear-gradient(135deg, var(--primary-blue), var(--accent-cyan))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textTransform: 'uppercase',
              letterSpacing: '8px',
              marginBottom: '1.5rem',
              textShadow: '0 0 60px var(--glow-blue)',
              animation: 'pulse-glow 3s ease-in-out infinite'
            }}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {serverInfo?.name || t('hero.title')}
          </motion.h1>
          
          <motion.p 
            style={{
              fontSize: 'clamp(1rem, 2.5vw, 1.3rem)',
              color: 'var(--text-secondary)',
              marginBottom: '3rem',
              fontWeight: 400,
              lineHeight: 1.8,
              maxWidth: '700px',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            {currentDescription || t('hero.description')}
          </motion.p>

          <motion.div 
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '3rem',
              marginBottom: '3rem',
              flexWrap: 'wrap'
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Users style={{ width: 40, height: 40, color: 'var(--primary-blue)', filter: 'drop-shadow(0 0 10px var(--glow-blue))' }} />
              <div style={{ textAlign: 'left' }}>
                <div style={{
                  fontFamily: 'Orbitron, sans-serif',
                  fontSize: '2.5rem',
                  color: 'var(--text-primary)',
                  lineHeight: 1
                }}>
                  {serverInfo?.maxPlayers || 100}
                </div>
                <div style={{
                  fontSize: '0.9rem',
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '2px'
                }}>
                  {t('stats.maxPlayers')}
                </div>
              </div>
            </div>
            
            <div style={{
              width: '2px',
              height: '60px',
              background: 'linear-gradient(to bottom, transparent, var(--primary-blue), transparent)'
            }} />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Zap style={{ width: 40, height: 40, color: 'var(--primary-blue)', filter: 'drop-shadow(0 0 10px var(--glow-blue))' }} />
              <div style={{ textAlign: 'left' }}>
                <div style={{
                  fontFamily: 'Orbitron, sans-serif',
                  fontSize: '2.5rem',
                  color: 'var(--text-primary)',
                  lineHeight: 1
                }}>
                  {serverInfo?.gameVersion || 'Legacy'}
                </div>
                <div style={{
                  fontSize: '0.9rem',
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '2px'
                }}>
                  {t('stats.version')}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
          >
            <motion.a 
              href={serverInfo?.downloadUrl || '#'}
              className="btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Download className="btn-icon" />
              {t('hero.download')}
            </motion.a>
            
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

        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '200px',
          background: 'linear-gradient(to bottom, transparent, var(--bg-dark))',
          pointerEvents: 'none'
        }} />
      </section>

      {/* How To Start Section */}
      {howToStartSteps.length > 0 && (
        <section style={{ padding: '8rem 2rem 4rem', maxWidth: '1400px', margin: '0 auto' }}>
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

          {/* Important Notice */}
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
