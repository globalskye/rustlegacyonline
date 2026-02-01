import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import * as Types from '../../types';

const emptyForm = { name: '', imageUrl: '', order: 1, enabled: true };

export default function AdminPayments({ onMessage }: { onMessage: (t: string, type: 'success' | 'error') => void }) {
  const [items, setItems] = useState<Types.PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Types.PaymentMethod | null>(null);
  const [form, setForm] = useState(emptyForm);

  const load = () => apiService.getPaymentMethods().then(p => setItems((p || []).sort((a, b) => a.order - b.order))).catch(() => onMessage('Failed', 'error'));

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await apiService.updatePaymentMethod(editing.id, form);
        onMessage('Updated!', 'success');
      } else {
        await apiService.createPaymentMethod(form);
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
      await apiService.deletePaymentMethod(id);
      setItems(items.filter(x => x.id !== id));
      onMessage('Deleted', 'success');
    } catch {
      onMessage('Failed', 'error');
    }
  };

  const edit = (i: Types.PaymentMethod) => {
    setEditing(i);
    setForm({ name: i.name, imageUrl: i.imageUrl, order: i.order, enabled: i.enabled });
  };

  if (loading) return <p>Loading...</p>;
  return (
    <div className="card">
      <h2>Payment Methods (CRUD)</h2>
      <form className="admin-form" onSubmit={save} style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-darker)', borderRadius: 8 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <label>Name <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></label>
          <label>Order <input type="number" value={form.order} onChange={e => setForm({ ...form, order: +e.target.value })} /></label>
        </div>
        <label>Image URL <input value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} /></label>
        <label><input type="checkbox" checked={form.enabled} onChange={e => setForm({ ...form, enabled: e.target.checked })} /> Enabled</label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="submit" className="btn">{editing ? 'Update' : 'Create'}</button>
          {editing && <button type="button" className="btn btn-secondary" onClick={() => { setEditing(null); setForm(emptyForm); }}>Cancel</button>}
        </div>
      </form>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {items.map(i => (
          <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--bg-darker)', borderRadius: 8 }}>
            <span>{i.name} - {i.enabled ? 'Enabled' : 'Disabled'}</span>
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
