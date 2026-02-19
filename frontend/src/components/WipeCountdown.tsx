import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar } from 'lucide-react';
import { getWipeInfo } from '../utils/wipeSchedule';
import { apiService } from '../services/api';
import * as Types from '../types';

export const WipeCountdown: React.FC = () => {
  const { t, i18n } = useTranslation();
  const lang = (i18n.language || 'en').startsWith('ru') ? 'ru' : 'en';
  const [siteConfig, setSiteConfig] = useState<Types.SiteConfig | null>(null);
  const [wipe, setWipe] = useState(() => getWipeInfo(lang));

  useEffect(() => {
    apiService.getSiteConfig().then(setSiteConfig).catch(() => {});
  }, []);

  useEffect(() => {
    const tick = () => setWipe(getWipeInfo(lang, siteConfig || undefined));
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [lang, siteConfig]);

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
