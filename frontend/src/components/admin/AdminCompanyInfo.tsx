import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import * as Types from '../../types';

export default function AdminCompanyInfo({ onMessage }: { onMessage: (t: string, type: 'success' | 'error') => void }) {
  const [data, setData] = useState<Partial<Types.CompanyInfo>>({
    legalName: '', address: '', phone: '', email: '', inn: '', ogrn: '', unp: '', registrationInfo: '',
    tradeRegistryNum: '', tradeRegistryDate: '', workingHours: '', storeName: '', licenses: '',
    bankRequisites: '', deliveryInfo: ''
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
        <label>Email (Почта) <input type="email" value={data.email || ''} onChange={e => setData({ ...data, email: e.target.value })} placeholder="support@example.com" /></label>
        <label>INN (ИНН) <input value={data.inn || ''} onChange={e => setData({ ...data, inn: e.target.value })} /></label>
        <label>OGRN (ОГРН) <input value={data.ogrn || ''} onChange={e => setData({ ...data, ogrn: e.target.value })} /></label>
        <label>УНП (Беларусь) <input value={data.unp || ''} onChange={e => setData({ ...data, unp: e.target.value })} placeholder="Учётный номер плательщика" /></label>
        <label>Сведения о гос. регистрации <textarea value={data.registrationInfo || ''} onChange={e => setData({ ...data, registrationInfo: e.target.value })} rows={2} placeholder="Орган, дата, номер свидетельства" /></label>
        <label>Торговый реестр (номер) <input value={data.tradeRegistryNum || ''} onChange={e => setData({ ...data, tradeRegistryNum: e.target.value })} /></label>
        <label>Торговый реестр (дата) <input value={data.tradeRegistryDate || ''} onChange={e => setData({ ...data, tradeRegistryDate: e.target.value })} placeholder="ДД.ММ.ГГГГ" /></label>
        <label>Режим работы <input value={data.workingHours || ''} onChange={e => setData({ ...data, workingHours: e.target.value })} placeholder="Пн–Пт 9:00–18:00" /></label>
        <label>Наименование интернет-магазина <input value={data.storeName || ''} onChange={e => setData({ ...data, storeName: e.target.value })} /></label>
        <label>Лицензии <textarea value={data.licenses || ''} onChange={e => setData({ ...data, licenses: e.target.value })} rows={2} placeholder="Если деятельность лицензируется" /></label>
        <label>Bank requisites (Реквизиты) <textarea value={data.bankRequisites || ''} onChange={e => setData({ ...data, bankRequisites: e.target.value })} rows={4} /></label>
        <label>Delivery info (Доставка) <textarea value={data.deliveryInfo || ''} onChange={e => setData({ ...data, deliveryInfo: e.target.value })} rows={4} required /></label>
        <button type="submit" className="btn">Save</button>
      </form>
    </div>
  );
}
