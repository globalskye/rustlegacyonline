import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import * as Types from '../../types';

const WEEKDAYS = [
  { v: 0, label: 'Sun' },
  { v: 1, label: 'Mon' },
  { v: 2, label: 'Tue' },
  { v: 3, label: 'Wed' },
  { v: 4, label: 'Thu' },
  { v: 5, label: 'Fri' },
  { v: 6, label: 'Sat' },
];

export default function AdminSiteConfig({ onMessage }: { onMessage: (t: string, type: 'success' | 'error') => void }) {
  const [data, setData] = useState<Partial<Types.SiteConfig>>({
    vkUrl: '',
    discordUrl: '',
    telegramUrl: '',
    fullWipe: { weekday: 5, hour: 16, minute: 0 },
    partialWipe: { weekday: 2, hour: 16, minute: 0 },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiService.getSiteConfig()
      .then(d => setData(d || {}))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.updateSiteConfig(data as Types.SiteConfig);
      onMessage('Saved!', 'success');
    } catch {
      onMessage('Failed', 'error');
    }
  };

  const updateWipe = (type: 'fullWipe' | 'partialWipe', field: keyof Types.WipeSchedule, value: number) => {
    const def = type === 'fullWipe' ? { weekday: 5, hour: 16, minute: 0 } : { weekday: 2, hour: 16, minute: 0 };
    const w = data[type] || def;
    setData({ ...data, [type]: { ...w, [field]: value } });
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="card" style={{ maxWidth: 600 }}>
      <h2>Site Config (Соцсети + Вайп)</h2>
      <form className="admin-form" onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <fieldset>
          <legend>Social Links (ссылки справа внизу)</legend>
          <label>VK URL <input value={data.vkUrl || ''} onChange={e => setData({ ...data, vkUrl: e.target.value })} placeholder="https://vk.com/username" /></label>
          <label>Discord URL <input value={data.discordUrl || ''} onChange={e => setData({ ...data, discordUrl: e.target.value })} placeholder="https://discordapp.com/users/ID" /></label>
          <label>Telegram URL <input value={data.telegramUrl || ''} onChange={e => setData({ ...data, telegramUrl: e.target.value })} placeholder="https://t.me/username" /></label>
        </fieldset>

        <fieldset>
          <legend>Full Wipe (полный вайп) — UTC</legend>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <label>Day <select value={data.fullWipe?.weekday ?? 5} onChange={e => updateWipe('fullWipe', 'weekday', +e.target.value)}>
              {WEEKDAYS.map(w => <option key={w.v} value={w.v}>{w.label}</option>)}
            </select></label>
            <label>Hour (0-23) <input type="number" min={0} max={23} value={data.fullWipe?.hour ?? 16} onChange={e => updateWipe('fullWipe', 'hour', +e.target.value)} /></label>
            <label>Min <input type="number" min={0} max={59} value={data.fullWipe?.minute ?? 0} onChange={e => updateWipe('fullWipe', 'minute', +e.target.value)} /></label>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Example: Fri 16:00 UTC = 19:00 MSK
          </p>
        </fieldset>

        <fieldset>
          <legend>Partial Wipe (частичный вайп) — UTC</legend>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <label>Day <select value={data.partialWipe?.weekday ?? 2} onChange={e => updateWipe('partialWipe', 'weekday', +e.target.value)}>
              {WEEKDAYS.map(w => <option key={w.v} value={w.v}>{w.label}</option>)}
            </select></label>
            <label>Hour (0-23) <input type="number" min={0} max={23} value={data.partialWipe?.hour ?? 16} onChange={e => updateWipe('partialWipe', 'hour', +e.target.value)} /></label>
            <label>Min <input type="number" min={0} max={59} value={data.partialWipe?.minute ?? 0} onChange={e => updateWipe('partialWipe', 'minute', +e.target.value)} /></label>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Example: Tue 16:00 UTC = 19:00 MSK
          </p>
        </fieldset>

        <button type="submit" className="btn">Save</button>
      </form>
    </div>
  );
}
