import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import * as Types from '../../types';

export default function AdminServerDetails({ onMessage }: { onMessage: (t: string, type: 'success' | 'error') => void }) {
  const [items, setItems] = useState<Types.ServerDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiService.getServerDetails().then(d => setItems((d || []).sort((a, b) => a.order - b.order))).catch(() => onMessage('Failed', 'error')).finally(() => setLoading(false));
  }, []);

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

  if (loading) return <p>Loading...</p>;
  return (
    <div className="card">
      <h2>Server Details</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {items.map(i => (
          <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--bg-darker)', borderRadius: 8 }}>
            <span>{i.title} ({i.language}) - {i.section}</span>
            <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }} onClick={() => del(i.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
