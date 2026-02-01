import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import * as Types from '../../types';

export default function AdminDownloadLinks({ onMessage }: { onMessage: (t: string, type: 'success' | 'error') => void }) {
  const [links, setLinks] = useState<Types.DownloadLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [newLabel, setNewLabel] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [editing, setEditing] = useState<Types.DownloadLink | null>(null);

  const load = () => apiService.getDownloadLinks().then(setLinks).catch(() => onMessage('Failed to load', 'error'));

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel || !newUrl) return;
    try {
      await apiService.createDownloadLink({
        serverInfoId: 1,
        label: newLabel,
        url: newUrl,
        order: links.length,
      });
      setNewLabel('');
      setNewUrl('');
      onMessage('Added', 'success');
      load();
    } catch {
      onMessage('Add failed', 'error');
    }
  };

  const update = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    try {
      await apiService.updateDownloadLink(editing.id, { label: newLabel, url: newUrl });
      setEditing(null);
      setNewLabel('');
      setNewUrl('');
      onMessage('Updated', 'success');
      load();
    } catch {
      onMessage('Update failed', 'error');
    }
  };

  const remove = async (id: number) => {
    if (!window.confirm('Delete?')) return;
    try {
      await apiService.deleteDownloadLink(id);
      setLinks(links.filter(x => x.id !== id));
      onMessage('Deleted', 'success');
    } catch {
      onMessage('Delete failed', 'error');
    }
  };

  const edit = (l: Types.DownloadLink) => {
    setEditing(l);
    setNewLabel(l.label);
    setNewUrl(l.url);
  };

  if (loading) return <p>Loading...</p>;
  return (
    <div className="card">
      <h2>Download Links (CRUD)</h2>
      <form className="admin-form" onSubmit={editing ? update : add} style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-darker)', borderRadius: 8 }}>
        <label>Label <input placeholder="e.g. Google Drive" value={newLabel} onChange={e => setNewLabel(e.target.value)} required /></label>
        <label>URL <input placeholder="https://..." type="url" value={newUrl} onChange={e => setNewUrl(e.target.value)} required /></label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="submit" className="btn">{editing ? 'Update' : 'Add'}</button>
          {editing && <button type="button" className="btn btn-secondary" onClick={() => { setEditing(null); setNewLabel(''); setNewUrl(''); }}>Cancel</button>}
        </div>
      </form>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {links.map(l => (
          <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--bg-darker)', borderRadius: 8 }}>
            <a href={l.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-blue)' }}>{l.label}</a>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }} onClick={() => edit(l)}>Edit</button>
              <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem', background: '#ef4444', borderColor: '#ef4444' }} onClick={() => remove(l.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
