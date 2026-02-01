import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import * as Types from '../../types';

const TYPES = ['terms', 'privacy', 'rules', 'company_info'] as const;
type LegalType = typeof TYPES[number];
const emptyForm: { language: 'en' | 'ru'; type: LegalType; title: string; content: string } = { language: 'en', type: 'terms', title: '', content: '' };

export default function AdminLegal({ onMessage }: { onMessage: (t: string, type: 'success' | 'error') => void }) {
  const [items, setItems] = useState<Types.LegalDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Types.LegalDocument | null>(null);
  const [form, setForm] = useState(emptyForm);

  const load = () => apiService.getLegalDocuments().then(d => setItems(d || [])).catch(() => onMessage('Failed', 'error'));

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await apiService.updateLegalDocument(editing.id, form);
        onMessage('Updated!', 'success');
      } else {
        await apiService.createLegalDocument(form as any);
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
      await apiService.deleteLegalDocument(id);
      setItems(items.filter(x => x.id !== id));
      onMessage('Deleted', 'success');
    } catch {
      onMessage('Failed', 'error');
    }
  };

  const edit = (i: Types.LegalDocument) => {
    setEditing(i);
    setForm({ language: i.language as 'en' | 'ru', type: i.type as LegalType, title: i.title, content: i.content });
  };

  if (loading) return <p>Loading...</p>;
  return (
    <div className="card">
      <h2>Legal Documents (CRUD)</h2>
      <form className="admin-form" onSubmit={save} style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-darker)', borderRadius: 8 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <label>Language <select value={form.language} onChange={e => setForm({ ...form, language: e.target.value as 'en' | 'ru' })}>
            <option value="en">EN</option>
            <option value="ru">RU</option>
          </select></label>
          <label>Type <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as typeof form.type })}>
            {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select></label>
        </div>
        <label>Title <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required /></label>
        <label>Content (HTML) <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={8} style={{ fontFamily: 'monospace' }} /></label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="submit" className="btn">{editing ? 'Update' : 'Create'}</button>
          {editing && <button type="button" className="btn btn-secondary" onClick={() => { setEditing(null); setForm(emptyForm); }}>Cancel</button>}
        </div>
      </form>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {items.map(i => (
          <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--bg-darker)', borderRadius: 8 }}>
            <span>{i.title} ({i.language}) - {i.type}</span>
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
