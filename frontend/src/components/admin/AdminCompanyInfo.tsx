import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import * as Types from '../../types';

export default function AdminCompanyInfo({ onMessage }: { onMessage: (t: string, type: 'success' | 'error') => void }) {
  const [data, setData] = useState<Partial<Types.CompanyInfo>>({
    legalName: '', address: '', phone: '', inn: '', ogrn: '', bankRequisites: '', deliveryInfo: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiService.getCompanyInfo()
      .then(d => setData(d || {}))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.updateCompanyInfo(data);
      onMessage('Saved!', 'success');
    } catch {
      onMessage('Failed', 'error');
    }
  };

  if (loading) return <p>Loading...</p>;
  return (
    <div className="card" style={{ maxWidth: 600 }}>
      <h2>Company Info (Реквизиты)</h2>
      <form className="admin-form" onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <label>Legal name (Наименование юр. лица/ИП) <input value={data.legalName || ''} onChange={e => setData({ ...data, legalName: e.target.value })} required /></label>
        <label>Address (Адрес) <textarea value={data.address || ''} onChange={e => setData({ ...data, address: e.target.value })} rows={2} required /></label>
        <label>Phone (Телефон) <input value={data.phone || ''} onChange={e => setData({ ...data, phone: e.target.value })} /></label>
        <label>INN (ИНН) <input value={data.inn || ''} onChange={e => setData({ ...data, inn: e.target.value })} /></label>
        <label>OGRN (ОГРН) <input value={data.ogrn || ''} onChange={e => setData({ ...data, ogrn: e.target.value })} /></label>
        <label>Bank requisites (Реквизиты) <textarea value={data.bankRequisites || ''} onChange={e => setData({ ...data, bankRequisites: e.target.value })} rows={4} /></label>
        <label>Delivery info (Доставка) <textarea value={data.deliveryInfo || ''} onChange={e => setData({ ...data, deliveryInfo: e.target.value })} rows={4} required /></label>
        <button type="submit" className="btn">Save</button>
      </form>
    </div>
  );
}
