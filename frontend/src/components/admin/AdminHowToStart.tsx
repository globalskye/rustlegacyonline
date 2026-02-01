import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import * as Types from '../../types';

const emptyForm: { language: 'en' | 'ru'; stepNumber: number; title: string; content: string; imageUrl: string; videoUrl: string } = { language: 'en', stepNumber: 1, title: '', content: '', imageUrl: '', videoUrl: '' };

export default function AdminHowToStart({ onMessage }: { onMessage: (t: string, type: 'success' | 'error') => void }) {
  const [items, setItems] = useState<Types.HowToStartStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Types.HowToStartStep | null>(null);
  const [form, setForm] = useState(emptyForm);

  const load = () => apiService.getHowToStartSteps().then(s => setItems((s || []).sort((a, b) => a.stepNumber - b.stepNumber))).catch(() => onMessage('Failed', 'error'));

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await apiService.updateHowToStartStep(editing.id, form);
        onMessage('Updated!', 'success');
      } else {
        await apiService.createHowToStartStep(form);
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
      await apiService.deleteHowToStartStep(id);
      setItems(items.filter(x => x.id !== id));
      onMessage('Deleted', 'success');
    } catch {
      onMessage('Failed', 'error');
    }
  };

  const edit = (i: Types.HowToStartStep) => {
    setEditing(i);
    setForm({ language: i.language as 'en' | 'ru', stepNumber: i.stepNumber, title: i.title, content: i.content || '', imageUrl: i.imageUrl || '', videoUrl: i.videoUrl || '' });
  };

  if (loading) return <p>Loading...</p>;
  return (
    <div className="card">
      <h2>How To Start (CRUD)</h2>
      <form className="admin-form" onSubmit={save} style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-darker)', borderRadius: 8 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <label>Language <select value={form.language} onChange={e => setForm({ ...form, language: e.target.value as 'en' | 'ru' })}>
            <option value="en">EN</option>
            <option value="ru">RU</option>
          </select></label>
          <label>Step # <input type="number" value={form.stepNumber} onChange={e => setForm({ ...form, stepNumber: +e.target.value })} required /></label>
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
            <span>Step {i.stepNumber}: {i.title} ({i.language})</span>
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
