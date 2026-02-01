import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import * as Types from '../../types';

const catEmpty: { name: string; language: 'en' | 'ru'; order: number; enabled: boolean } = { name: '', language: 'en', order: 1, enabled: true };
const itemEmpty: { categoryId: number; language: 'en' | 'ru'; name: string; description: string; price: number; currency: string; imageUrl: string; features: string; enabled: boolean; order: number; rconCommand: string; warranty: string; specs: string; packageContents: string } = { categoryId: 1, language: 'en', name: '', description: '', price: 0, currency: 'USD', imageUrl: '', features: '[]', enabled: true, order: 1, rconCommand: '', warranty: '', specs: '', packageContents: '' };

export default function AdminShop({ onMessage }: { onMessage: (t: string, type: 'success' | 'error') => void }) {
  const [categories, setCategories] = useState<Types.ShopCategory[]>([]);
  const [items, setItems] = useState<Types.ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCat, setEditingCat] = useState<Types.ShopCategory | null>(null);
  const [editingItem, setEditingItem] = useState<Types.ShopItem | null>(null);
  const [catForm, setCatForm] = useState(catEmpty);
  const [itemForm, setItemForm] = useState(itemEmpty);

  const load = () =>
    Promise.all([apiService.getShopCategories(), apiService.getShopItems()])
      .then(([c, i]) => {
        setCategories(c || []);
        setItems(i || []);
      })
      .catch(() => onMessage('Failed to load', 'error'))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const saveCat = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCat) {
        await apiService.updateShopCategory(editingCat.id, catForm);
        onMessage('Category updated!', 'success');
      } else {
        await apiService.createShopCategory(catForm);
        onMessage('Category created!', 'success');
      }
      setEditingCat(null);
      setCatForm(catEmpty);
      load();
    } catch {
      onMessage('Failed', 'error');
    }
  };

  const saveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (categories.length === 0) {
      onMessage('Create a category first', 'error');
      return;
    }
    const categoryId = itemForm.categoryId || categories[0]?.id;
    if (!categoryId) {
      onMessage('Select a category', 'error');
      return;
    }
    const payload = {
      ...itemForm,
      categoryId,
      features: typeof itemForm.features === 'string' ? (() => { try { return JSON.parse(itemForm.features); } catch { return []; } })() : (itemForm.features || [])
    };
    try {
      if (editingItem) {
        await apiService.updateShopItem(editingItem.id, payload as any);
        onMessage('Item updated!', 'success');
      } else {
        await apiService.createShopItem(payload as any);
        onMessage('Item created!', 'success');
      }
      setEditingItem(null);
      setItemForm({ ...itemEmpty, categoryId: categories[0]?.id || 1 });
      load();
    } catch {
      onMessage('Failed', 'error');
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

  if (loading) return <p>Loading...</p>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="card">
        <h2>Categories (CRUD)</h2>
        <form className="admin-form" onSubmit={saveCat} style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-darker)', borderRadius: 8 }}>
          <div className="admin-form-grid-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <label>Name <input value={catForm.name} onChange={e => setCatForm({ ...catForm, name: e.target.value })} required /></label>
            <label>Language <select value={catForm.language} onChange={e => setCatForm({ ...catForm, language: e.target.value as 'en' | 'ru' })}>
              <option value="en">EN</option>
              <option value="ru">RU</option>
            </select></label>
            <label>Order <input type="number" value={catForm.order} onChange={e => setCatForm({ ...catForm, order: +e.target.value })} /></label>
          </div>
          <label><input type="checkbox" checked={catForm.enabled} onChange={e => setCatForm({ ...catForm, enabled: e.target.checked })} /> Enabled</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" className="btn">{editingCat ? 'Update' : 'Create'}</button>
            {editingCat && <button type="button" className="btn btn-secondary" onClick={() => { setEditingCat(null); setCatForm(catEmpty); }}>Cancel</button>}
          </div>
        </form>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {categories.map(c => (
            <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--bg-darker)', borderRadius: 8 }}>
              <span>{c.name} ({c.language})</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }} onClick={() => { setEditingCat(c); setCatForm({ name: c.name, language: c.language as 'en' | 'ru', order: c.order, enabled: c.enabled }); }}>Edit</button>
                <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem', background: '#ef4444', borderColor: '#ef4444' }} onClick={() => deleteCategory(c.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h2>Shop Items (CRUD)</h2>
        <form className="admin-form" onSubmit={saveItem} style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-darker)', borderRadius: 8 }}>
          <div className="admin-form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <label>Name <input value={itemForm.name} onChange={e => setItemForm({ ...itemForm, name: e.target.value })} required /></label>
            <label>Category <select value={itemForm.categoryId} onChange={e => setItemForm({ ...itemForm, categoryId: +e.target.value })}>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select></label>
          </div>
          <label>Description <textarea value={itemForm.description} onChange={e => setItemForm({ ...itemForm, description: e.target.value })} rows={2} /></label>
          <div className="admin-form-grid-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <label>Price <input type="number" step="0.01" value={itemForm.price} onChange={e => setItemForm({ ...itemForm, price: +e.target.value })} /></label>
            <label>Currency <select value={itemForm.currency} onChange={e => setItemForm({ ...itemForm, currency: e.target.value })}>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="CZK">CZK</option>
              <option value="RUB">RUB</option>
              <option value="BYN">BYN</option>
            </select></label>
            <label>Order <input type="number" value={itemForm.order} onChange={e => setItemForm({ ...itemForm, order: +e.target.value })} /></label>
          </div>
          <label>Image URL <input value={itemForm.imageUrl} onChange={e => setItemForm({ ...itemForm, imageUrl: e.target.value })} /></label>
          <label>RCON Command (use * for SteamID) <input placeholder="give * wood 1000" value={itemForm.rconCommand} onChange={e => setItemForm({ ...itemForm, rconCommand: e.target.value })} /></label>
          <label>Warranty (Гарантия) <textarea value={itemForm.warranty} onChange={e => setItemForm({ ...itemForm, warranty: e.target.value })} rows={2} placeholder="e.g. Instant delivery, no refund for digital goods" /></label>
          <label>Specs (Характеристики) <textarea value={itemForm.specs} onChange={e => setItemForm({ ...itemForm, specs: e.target.value })} rows={2} /></label>
          <label>Package contents (Комплектация) <textarea value={itemForm.packageContents} onChange={e => setItemForm({ ...itemForm, packageContents: e.target.value })} rows={2} /></label>
          <label><input type="checkbox" checked={itemForm.enabled} onChange={e => setItemForm({ ...itemForm, enabled: e.target.checked })} /> Enabled</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" className="btn">{editingItem ? 'Update' : 'Create'}</button>
            {editingItem && <button type="button" className="btn btn-secondary" onClick={() => { setEditingItem(null); setItemForm({ ...itemEmpty, categoryId: categories[0]?.id || 1 }); }}>Cancel</button>}
          </div>
        </form>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {items.map(i => (
            <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--bg-darker)', borderRadius: 8 }}>
              <div><strong>{i.name}</strong> — {i.price} {i.currency} {i.rconCommand && `[RCON]`}</div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }} onClick={() => { setEditingItem(i); setItemForm({ ...itemEmpty, categoryId: i.categoryId, language: i.language as 'en' | 'ru', name: i.name, description: i.description || '', price: i.price, currency: i.currency, imageUrl: i.imageUrl || '', features: typeof i.features === 'string' ? i.features : JSON.stringify(i.features || []), enabled: i.enabled, order: i.order, rconCommand: i.rconCommand || '', warranty: i.warranty || '', specs: i.specs || '', packageContents: i.packageContents || '' }); }}>Edit</button>
                <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem', background: '#ef4444', borderColor: '#ef4444' }} onClick={() => deleteItem(i.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
