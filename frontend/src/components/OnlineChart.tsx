import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';
import { TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import { apiService } from '../services/api';

interface DataPoint {
  ts: number;
  time: string;
  players: number;
  fullTime: string;
}

export const OnlineChart: React.FC<{ serverType?: string; serverName?: string }> = ({ serverType, serverName }) => {
  const { t, i18n } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [data, setData] = useState<DataPoint[]>([]);
  const [hours, setHours] = useState(24);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (expanded) {
      setLoading(true);
      apiService.getServerStatusHistory(hours, serverType)
        .then(records => {
          const bucketMinutes = hours <= 24 ? 30 : 120;
          const bucketMs = bucketMinutes * 60 * 1000;
          const byBucket = new Map<number, number[]>();
          records.forEach(r => {
            const d = new Date(r.recordedAt).getTime();
            if (Number.isNaN(d)) return;
            const bucket = Math.floor(d / bucketMs) * bucketMs;
            if (!byBucket.has(bucket)) byBucket.set(bucket, []);
            byBucket.get(bucket)!.push(r.players ?? 0);
          });
          const points: DataPoint[] = Array.from(byBucket.entries())
            .map(([ts, vals]) => ({
              ts,
              time: new Date(ts).toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' }),
              players: vals.length > 0 ? Math.max(...vals) : 0,
              fullTime: new Date(ts).toLocaleString(i18n.language),
            }))
            .sort((a, b) => a.ts - b.ts);
          setData(points);
        })
        .catch(() => setData([]))
        .finally(() => setLoading(false));
    }
  }, [expanded, hours, serverType, i18n.language]);

  return (
    <div className="card monitoring-chart-card" style={{ marginTop: '1rem', overflow: 'hidden' }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'none',
          border: 'none',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          padding: '0.5rem 0',
          fontFamily: 'Poppins',
          fontSize: '1rem',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TrendingUp size={20} color="var(--primary-blue)" />
          {t('stats.onlineChart')}
        </span>
        {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <button
                onClick={() => setHours(24)}
                style={{
                  padding: '0.35rem 0.75rem',
                  background: hours === 24 ? 'var(--primary-blue)' : 'transparent',
                  border: '1px solid var(--border-color)',
                  color: hours === 24 ? 'white' : 'var(--text-secondary)',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                }}
              >
                {t('stats.last24h')}
              </button>
              <button
                onClick={() => setHours(168)}
                style={{
                  padding: '0.35rem 0.75rem',
                  background: hours === 168 ? 'var(--primary-blue)' : 'transparent',
                  border: '1px solid var(--border-color)',
                  color: hours === 168 ? 'white' : 'var(--text-secondary)',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                }}
              >
                {t('stats.last7d')}
              </button>
            </div>
            {loading ? (
              <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                Loading...
              </div>
            ) : data.length === 0 ? (
              <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                {i18n.language === 'ru' ? 'Нет данных' : 'No data yet'}
              </div>
            ) : (
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.5} />
                    <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={11} tickFormatter={(v) => v} />
                    <YAxis stroke="var(--text-muted)" fontSize={11} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ background: 'var(--bg-darker)', border: '1px solid var(--border-color)', borderRadius: 8 }}
                      labelStyle={{ color: 'var(--text-primary)' }}
                      formatter={(val: number | undefined) => [val ?? 0, i18n.language === 'ru' ? 'Игроков' : 'Players']}
                      labelFormatter={(label, payload) => payload[0]?.payload?.fullTime || label}
                    />
                    <Line type="monotone" dataKey="players" stroke="var(--primary-blue)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
