import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import * as Types from '../../types';

export default function AdminServerInfo({ onMessage }: { onMessage: (t: string, type: 'success' | 'error') => void }) {
  const [data, setData] = useState<Partial<Types.ServerInfo>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiService.getServerInfo().then(setData).catch(() => onMessage('Failed to load', 'error')).finally(() => setLoading(false));
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.updateServerInfo(data);
      onMessage('Saved!', 'success');
    } catch {
      onMessage('Save failed', 'error');
    }
  };

  if (loading) return <p>Loading...</p>;
  return (
    <div className="card" style={{ maxWidth: 600 }}>
      <h2>Server Information</h2>
      <form className="admin-form" onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <label>Name <input value={data.name || ''} onChange={e => setData({ ...data, name: e.target.value })} required /></label>
        <label>Max Players <input type="number" value={data.maxPlayers ?? ''} onChange={e => setData({ ...data, maxPlayers: +e.target.value })} required /></label>
        <label>Game Version <input value={data.gameVersion || ''} onChange={e => setData({ ...data, gameVersion: e.target.value })} required /></label>
        <label>Download URL <input type="url" value={data.downloadUrl || ''} onChange={e => setData({ ...data, downloadUrl: e.target.value })} /></label>
        <label>VirusTotal URL <input type="url" value={data.virusTotalUrl || ''} onChange={e => setData({ ...data, virusTotalUrl: e.target.value })} /></label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <label>IP <input value={data.ip || ''} onChange={e => setData({ ...data, ip: e.target.value })} /></label>
          <label>Game Port <input type="number" value={data.port ?? ''} onChange={e => setData({ ...data, port: +e.target.value })} /></label>
          <label>Query Port <input type="number" value={data.queryPort ?? ''} onChange={e => setData({ ...data, queryPort: +e.target.value })} placeholder="game port + 1" title="A2S_INFO port" /></label>
        </div>
        <button type="submit" className="btn">Save</button>
      </form>
    </div>
  );
}
