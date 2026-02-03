import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar } from 'lucide-react';
import { getWipeInfo } from '../utils/wipeSchedule';

export const WipeCountdown: React.FC = () => {
  const { t } = useTranslation();
  const [wipe, setWipe] = useState(getWipeInfo());

  useEffect(() => {
    const tick = () => setWipe(getWipeInfo());
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
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
        <Calendar size={24} color="var(--primary-blue)" style={{ marginBottom: '0.5rem' }} />
        <div style={{
          fontFamily: 'Orbitron, sans-serif',
          fontSize: '1.4rem',
          color: 'var(--text-primary)',
          marginBottom: '0.25rem'
        }}>
          {wipe.countdownFull}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
          {t('stats.nextFullWipe')}
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{wipe.fullLocal}</div>
      </div>
      <div style={{
        background: 'rgba(15, 23, 42, 0.6)',
        padding: '1rem',
        borderRadius: '8px',
        border: '1px solid var(--border-color)',
        textAlign: 'center'
      }}>
        <Calendar size={24} color="var(--accent-cyan)" style={{ marginBottom: '0.5rem' }} />
        <div style={{
          fontFamily: 'Orbitron, sans-serif',
          fontSize: '1.4rem',
          color: 'var(--text-primary)',
          marginBottom: '0.25rem'
        }}>
          {wipe.countdownPartial}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
          {t('stats.nextPartialWipe')}
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{wipe.partialLocal}</div>
      </div>
    </div>
  );
};
