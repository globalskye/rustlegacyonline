import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import * as Types from '../../types';

const serverEmpty: Partial<Types.ServerInfo> = {
  name: '', maxPlayers: 100, gameVersion: 'Legacy', type: 'classic',
  ip: '', port: 28015, queryPort: 28016, downloadUrl: '', virusTotalUrl: ''
};

export default function AdminServers({ onMessage }: { onMessage: (t: string, type: 'success' | 'error') => void }) {
  const [servers, setServers] = useState<Types.ServerInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Types.ServerInfo | null>(null);
  const [form, setForm] = useState<Partial<Types.ServerInfo>>(serverEmpty);

  const load = () =>
    apiService.getAllServers()
      .then(s => setServers(s || []))
      .catch(() => onMessage('Failed to load', 'error'))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.ip || !form.port) {
      onMessage('Name, IP, Port required', 'error');
      return;
    }
    try {
      if (editing) {
        await apiService.updateServer(editing.id, form);
        onMessage('Server updated!', 'success');
      } else {
        await apiService.createServer(form as any);
        onMessage('Server created!', 'success');
      }
      setEditing(null);
      setForm(serverEmpty);
      load();
    } catch {
      onMessage('Failed', 'error');
    }
  };

  const remove = async (id: number) => {
    if (!window.confirm('Delete this server?')) return;
    try {
      await apiService.deleteServer(id);
      onMessage('Deleted', 'success');
      load();
    } catch {
      onMessage('Delete failed', 'error');
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="card">
        <h2>Servers (CRUD)</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
          Servers for monitoring. Type: classic or deathmatch. Used for status and online chart.
        </p>
        <form className="admin-form" onSubmit={save} style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-darker)', borderRadius: 8 }}>
          <div className="admin-form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <label>Name <input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} required /></label>
            <label>Type <select value={form.type || 'classic'} onChange={e => setForm({ ...form, type: e.target.value as 'classic' | 'deathmatch' })}>
              <option value="classic">Classic</option>
              <option value="deathmatch">Deathmatch</option>
            </select></label>
          </div>
          <div className="admin-form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <label>IP <input value={form.ip || ''} onChange={e => setForm({ ...form, ip: e.target.value })} required placeholder="159.195.66.69" /></label>
            <label>Game Port <input type="number" value={form.port ?? ''} onChange={e => setForm({ ...form, port: +e.target.value })} required placeholder="28015" title="Port for connect" /></label>
            <label>Query Port <input type="number" value={form.queryPort ?? ''} onChange={e => setForm({ ...form, queryPort: +e.target.value })} placeholder="28016" title="A2S_INFO port (usually game port + 1)" /></label>
          </div>
          <label>Max Players <input type="number" value={form.maxPlayers ?? ''} onChange={e => setForm({ ...form, maxPlayers: +e.target.value })} /></label>
          <label>Game Version <input value={form.gameVersion || ''} onChange={e => setForm({ ...form, gameVersion: e.target.value })} /></label>
          <label>Download URL <input type="url" value={form.downloadUrl || ''} onChange={e => setForm({ ...form, downloadUrl: e.target.value })} /></label>
          <label>VirusTotal URL <input type="url" value={form.virusTotalUrl || ''} onChange={e => setForm({ ...form, virusTotalUrl: e.target.value })} /></label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" className="btn">{editing ? 'Update' : 'Create'}</button>
            {editing && <button type="button" className="btn btn-secondary" onClick={() => { setEditing(null); setForm(serverEmpty); }}>Cancel</button>}
          </div>
        </form>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {servers.map(s => (
            <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--bg-darker)', borderRadius: 8 }}>
              <div>
                <strong>{s.name}</strong> — {s.type} — {s.ip}:{s.port} (query: {s.queryPort || (s.port || 0) + 1})
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }} onClick={() => { setEditing(s); setForm({ name: s.name, type: s.type, ip: s.ip, port: s.port, queryPort: s.queryPort, maxPlayers: s.maxPlayers, gameVersion: s.gameVersion, downloadUrl: s.downloadUrl, virusTotalUrl: s.virusTotalUrl }); }}>Edit</button>
                <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem', background: '#ef4444', borderColor: '#ef4444' }} onClick={() => remove(s.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
