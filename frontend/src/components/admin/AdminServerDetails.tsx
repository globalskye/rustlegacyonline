import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import * as Types from '../../types';

const emptyForm: { serverId: number; language: 'en' | 'ru'; section: string; title: string; content: string; imageUrl: string; videoUrl: string; order: number } = { serverId: 0, language: 'en', section: 'description', title: '', content: '', imageUrl: '', videoUrl: '', order: 1 };

export default function AdminServerDetails({ onMessage }: { onMessage: (t: string, type: 'success' | 'error') => void }) {
  const [items, setItems] = useState<Types.ServerDetail[]>([]);
  const [servers, setServers] = useState<Types.ServerStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Types.ServerDetail | null>(null);
  const [form, setForm] = useState(emptyForm);

  const load = () => apiService.getServerDetails().then(d => setItems((d || []).sort((a, b) => a.order - b.order))).catch(() => onMessage('Failed', 'error'));

  useEffect(() => {
    Promise.all([apiService.getServerStatus(), load()])
      .then(([s]) => setServers(s || []))
      .catch(() => onMessage('Failed', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await apiService.updateServerDetail(editing.id, form);
        onMessage('Updated!', 'success');
      } else {
        await apiService.createServerDetail(form);
        onMessage('Created!', 'success');
      }
      setEditing(null);
      setForm(emptyForm);
      load();
    } catch {
      onMessage('Failed', 'error');
    }
  };

  const del = async (id: number) => {
    if (!window.confirm('Delete?')) return;
    try {
      await apiService.deleteServerDetail(id);
      setItems(items.filter(x => x.id !== id));
      onMessage('Deleted', 'success');
    } catch {
      onMessage('Failed', 'error');
    }
  };

  const edit = (i: Types.ServerDetail) => {
    setEditing(i);
    setForm({ serverId: i.serverId ?? 0, language: i.language as 'en' | 'ru', section: i.section, title: i.title, content: i.content || '', imageUrl: i.imageUrl || '', videoUrl: i.videoUrl || '', order: i.order });
  };

  if (loading) return <p>Loading...</p>;
  return (
    <div className="card">
      <h2>Server Details (CRUD)</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>Server = 0 — общие для всех. Выберите сервер — только для него.</p>
      <form className="admin-form" onSubmit={save} style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-darker)', borderRadius: 8 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          <label>Server <select value={form.serverId} onChange={e => setForm({ ...form, serverId: +e.target.value })}>
            <option value={0}>All servers (0)</option>
            {servers.map(s => (
              <option key={s.serverId} value={s.serverId}>{s.serverName} (ID {s.serverId})</option>
            ))}
          </select></label>
          <label>Language <select value={form.language} onChange={e => setForm({ ...form, language: e.target.value as 'en' | 'ru' })}>
            <option value="en">EN</option>
            <option value="ru">RU</option>
          </select></label>
          <label>Section <input value={form.section} onChange={e => setForm({ ...form, section: e.target.value })} /></label>
          <label>Order <input type="number" value={form.order} onChange={e => setForm({ ...form, order: +e.target.value })} /></label>
        </div>
        <label>Title <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required /></label>
        <label>Content <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={4} /></label>
        <label>Image URL <input value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} /></label>
        <label>Video URL <input value={form.videoUrl} onChange={e => setForm({ ...form, videoUrl: e.target.value })} /></label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="submit" className="btn">{editing ? 'Update' : 'Create'}</button>
          {editing && <button type="button" className="btn btn-secondary" onClick={() => { setEditing(null); setForm(emptyForm); }}>Cancel</button>}
        </div>
      </form>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {items.map(i => (
          <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--bg-darker)', borderRadius: 8 }}>
            <span>{i.title} ({i.language}) - {i.section} {i.serverId ? `[Server ${i.serverId}]` : '[All]'}</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }} onClick={() => edit(i)}>Edit</button>
              <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem', background: '#ef4444', borderColor: '#ef4444' }} onClick={() => del(i.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
