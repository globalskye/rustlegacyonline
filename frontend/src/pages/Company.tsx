import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { apiService } from '../services/api';
import * as Types from '../types';

const Company: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [info, setInfo] = useState<Types.CompanyInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiService.getCompanyInfo()
      .then(data => setInfo(data || null))
      .catch(() => setInfo(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Building2 size={80} color="var(--primary-blue)" />
        </div>
      </div>
    );
  }

  const labels = i18n.language === 'ru' ? {
    legalName: 'Наименование юридического лица / ИП',
    address: 'Юридический или фактический адрес',
    phone: 'Номер телефона',
    email: 'Email',
    inn: 'ИНН',
    ogrn: 'ОГРН',
    unp: 'УНП',
    registrationInfo: 'Сведения о гос. регистрации',
    tradeRegistryNum: 'Номер в Торговом реестре',
    tradeRegistryDate: 'Дата регистрации в Торговом реестре',
    workingHours: 'Режим работы',
    storeName: 'Наименование интернет-магазина',
    licenses: 'Лицензии',
    bankRequisites: 'Банковские реквизиты',
    deliveryInfo: 'Информация о доставке товаров и услуг',
    title: 'Реквизиты организации'
  } : {
    legalName: 'Legal entity / sole proprietor name',
    address: 'Legal or physical address',
    phone: 'Phone number',
    email: 'Email',
    inn: 'INN (Tax ID)',
    ogrn: 'OGRN',
    unp: 'UNP (Belarus)',
    registrationInfo: 'State registration details',
    tradeRegistryNum: 'Trade registry number',
    tradeRegistryDate: 'Trade registry date',
    workingHours: 'Working hours',
    storeName: 'Online store name',
    licenses: 'Licenses',
    bankRequisites: 'Bank requisites',
    deliveryInfo: 'Delivery information',
    title: 'Company Information'
  };

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="page-header">
          <Building2 size={48} color="var(--primary-blue)" style={{ filter: 'drop-shadow(0 0 20px var(--glow-blue))' }} />
          <h1 className="section-title" style={{ marginBottom: 0 }}>{labels.title}</h1>
        </div>

        <motion.div
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ maxWidth: 800, margin: '0 auto' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{labels.legalName}</div>
              <div style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{info?.legalName || '—'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{labels.address}</div>
              <div style={{ fontSize: '1.05rem', color: 'var(--text-secondary)' }}>{info?.address || '—'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{labels.phone}</div>
              <a href={info?.phone ? `tel:${info.phone}` : '#'} style={{ color: 'var(--primary-blue)', fontSize: '1.1rem', textDecoration: 'none' }}>
                {info?.phone || '—'}
              </a>
            </div>
            {info?.email && (
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{labels.email}</div>
                <a href={`mailto:${info.email}`} style={{ color: 'var(--primary-blue)', fontSize: '1.1rem', textDecoration: 'none' }}>
                  {info.email}
                </a>
              </div>
            )}
            <div className="company-grid-2">
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{labels.inn}</div>
                <div style={{ fontSize: '1.05rem', color: 'var(--text-secondary)' }}>{info?.inn || '—'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{labels.ogrn}</div>
                <div style={{ fontSize: '1.05rem', color: 'var(--text-secondary)' }}>{info?.ogrn || '—'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{labels.unp}</div>
                <div style={{ fontSize: '1.05rem', color: 'var(--text-secondary)' }}>{info?.unp || '—'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{labels.workingHours}</div>
                <div style={{ fontSize: '1.05rem', color: 'var(--text-secondary)' }}>{info?.workingHours || '—'}</div>
              </div>
            </div>
            {(info?.registrationInfo || info?.tradeRegistryNum || info?.storeName || info?.licenses) && (
              <>
                {info?.registrationInfo && (
                  <div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{labels.registrationInfo}</div>
                    <div style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>{info.registrationInfo}</div>
                  </div>
                )}
                {info?.tradeRegistryNum && (
                  <div className="company-grid-2">
                    <div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{labels.tradeRegistryNum}</div>
                      <div style={{ fontSize: '1.05rem', color: 'var(--text-secondary)' }}>{info.tradeRegistryNum}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{labels.tradeRegistryDate}</div>
                      <div style={{ fontSize: '1.05rem', color: 'var(--text-secondary)' }}>{info.tradeRegistryDate}</div>
                    </div>
                  </div>
                )}
                {info?.storeName && (
                  <div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{labels.storeName}</div>
                    <div style={{ fontSize: '1.05rem', color: 'var(--text-secondary)' }}>{info.storeName}</div>
                  </div>
                )}
                {info?.licenses && (
                  <div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{labels.licenses}</div>
                    <div style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>{info.licenses}</div>
                  </div>
                )}
              </>
            )}
            {info?.bankRequisites && (
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{labels.bankRequisites}</div>
                <div style={{ fontSize: '1rem', color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>{info.bankRequisites}</div>
              </div>
            )}
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{labels.deliveryInfo}</div>
              <div style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>{info?.deliveryInfo || '—'}</div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Company;
