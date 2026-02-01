import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import * as Types from '../../types';

const emptyForm: { language: 'en' | 'ru'; name: string; description: string; order: number } = { language: 'en', name: '', description: '', order: 1 };

export default function AdminPlugins({ onMessage }: { onMessage: (t: string, type: 'success' | 'error') => void }) {
  const [items, setItems] = useState<Types.Plugin[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Types.Plugin | null>(null);
  const [form, setForm] = useState(emptyForm);

  const load = () => apiService.getPlugins().then(p => setItems((p || []).sort((a, b) => a.order - b.order))).catch(() => onMessage('Failed', 'error'));

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await apiService.updatePlugin(editing.id, form);
        onMessage('Updated!', 'success');
      } else {
        await apiService.createPlugin({ ...form, commands: [] } as any);
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
      await apiService.deletePlugin(id);
      setItems(items.filter(x => x.id !== id));
      onMessage('Deleted', 'success');
    } catch {
      onMessage('Failed', 'error');
    }
  };

  const edit = (i: Types.Plugin) => {
    setEditing(i);
    setForm({ language: i.language as 'en' | 'ru', name: i.name, description: i.description || '', order: i.order });
  };

  if (loading) return <p>Loading...</p>;
  return (
    <div className="card">
      <h2>Plugins (CRUD)</h2>
      <form className="admin-form" onSubmit={save} style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-darker)', borderRadius: 8 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <label>Language <select value={form.language} onChange={e => setForm({ ...form, language: e.target.value as 'en' | 'ru' })}>
            <option value="en">EN</option>
            <option value="ru">RU</option>
          </select></label>
          <label>Order <input type="number" value={form.order} onChange={e => setForm({ ...form, order: +e.target.value })} /></label>
        </div>
        <label>Name <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></label>
        <label>Description <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} /></label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="submit" className="btn">{editing ? 'Update' : 'Create'}</button>
          {editing && <button type="button" className="btn btn-secondary" onClick={() => { setEditing(null); setForm(emptyForm); }}>Cancel</button>}
        </div>
      </form>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {items.map(i => (
          <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--bg-darker)', borderRadius: 8 }}>
            <span>{i.name} ({i.language}) - {i.commands?.length || 0} commands</span>
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
