import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar } from 'lucide-react';
import { getWipeInfo } from '../utils/wipeSchedule';

export const WipeCountdown: React.FC = () => {
  const { t, i18n } = useTranslation();
  const lang = (i18n.language || 'en').startsWith('ru') ? 'ru' : 'en';
  const [wipe, setWipe] = useState(getWipeInfo(lang));

  useEffect(() => {
    const tick = () => setWipe(getWipeInfo(lang));
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [lang]);

  return (
    <div className="monitoring-wipe-grid">
      <div className="monitoring-wipe-box">
        <Calendar size={22} color="var(--primary-blue)" style={{ marginBottom: '0.4rem' }} />
        <div className="monitoring-wipe-value">{wipe.countdownFull}</div>
        <div className="monitoring-wipe-label">{t('stats.nextFullWipe')}</div>
        <div className="monitoring-wipe-date">{wipe.fullLocal}</div>
      </div>
      <div className="monitoring-wipe-box">
        <Calendar size={22} color="var(--accent-cyan)" style={{ marginBottom: '0.4rem' }} />
        <div className="monitoring-wipe-value">{wipe.countdownPartial}</div>
        <div className="monitoring-wipe-label">{t('stats.nextPartialWipe')}</div>
        <div className="monitoring-wipe-date">{wipe.partialLocal}</div>
      </div>
    </div>
  );
};
