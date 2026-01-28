import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Construction } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Statistics: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center'
        }}
      >
        <motion.div
          animate={{
            y: [0, -20, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            marginBottom: '2rem'
          }}
        >
          <BarChart3 size={120} color="var(--primary-blue)" style={{ filter: 'drop-shadow(0 0 30px var(--glow-blue))' }} />
        </motion.div>

        <h1 style={{
          fontFamily: 'Orbitron, sans-serif',
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          background: 'linear-gradient(135deg, var(--primary-blue), var(--accent-cyan))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: '1rem',
          textTransform: 'uppercase',
          letterSpacing: '4px',
          fontWeight: 900
        }}>
          {t('nav.statistics')}
        </h1>

        <div className="card" style={{
          maxWidth: '600px',
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.1), rgba(6, 182, 212, 0.05))',
          border: '2px solid var(--border-bright)'
        }}>
          <Construction size={48} color="var(--primary-blue)" style={{ marginBottom: '1rem' }} />
          <h2 style={{
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '1.5rem',
            color: 'var(--text-primary)',
            marginBottom: '1rem',
            letterSpacing: '1px'
          }}>
            Coming Soon
          </h2>
          <p style={{
            color: 'var(--text-secondary)',
            lineHeight: 1.8,
            fontSize: '1.05rem'
          }}>
            Player statistics and leaderboards are currently under development. Soon you'll be able to view 
            detailed player stats, rankings, playtime, and much more.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Statistics;
