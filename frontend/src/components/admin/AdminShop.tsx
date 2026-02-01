import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import * as Types from '../../types';

export default function AdminShop({ onMessage }: { onMessage: (t: string, type: 'success' | 'error') => void }) {
  const [categories, setCategories] = useState<Types.ShopCategory[]>([]);
  const [items, setItems] = useState<(Types.ShopItem & { features?: string[] })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiService.getShopCategories(),
      apiService.getShopItems(),
    ]).then(([c, i]) => {
      setCategories(c || []);
      setItems(i || []);
    }).catch(() => onMessage('Failed to load', 'error')).finally(() => setLoading(false));
  }, []);

  const deleteItem = async (id: number) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await apiService.deleteShopItem(id);
      setItems(items.filter(x => x.id !== id));
      onMessage('Deleted', 'success');
    } catch {
      onMessage('Delete failed', 'error');
    }
  };

  const deleteCategory = async (id: number) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await apiService.deleteShopCategory(id);
      setCategories(categories.filter(x => x.id !== id));
      onMessage('Deleted', 'success');
    } catch {
      onMessage('Delete failed', 'error');
    }
  };

  if (loading) return <p>Loading...</p>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="card">
        <h2>Categories</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {categories.map(c => (
            <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--bg-darker)', borderRadius: 8 }}>
              <span>{c.name} ({c.language})</span>
              <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }} onClick={() => deleteCategory(c.id)}>Delete</button>
            </div>
          ))}
        </div>
      </div>
      <div className="card">
        <h2>Shop Items</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {items.map(i => (
            <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--bg-darker)', borderRadius: 8 }}>
              <div>
                <strong>{i.name}</strong> — {i.price} {i.currency} {i.rconCommand && `[RCON: ${i.rconCommand}]`}
              </div>
              <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }} onClick={() => deleteItem(i.id)}>Delete</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
