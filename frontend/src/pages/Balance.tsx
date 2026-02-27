import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wallet, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';

const PRESET_AMOUNTS = [100, 300, 500, 1000, 2000, 5000];
const CURRENCIES = ['RUB', 'USD', 'EUR'] as const;

const Balance: React.FC = () => {
  const { user, authLoading } = useApp();
  const { i18n } = useTranslation();
  const [amount, setAmount] = useState<string>('');
  const [currency, setCurrency] = useState<string>('RUB');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (authLoading) {
    return (
      <div className="page-container">
        <div style={{ minHeight: '40vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Wallet size={80} color="var(--primary-blue)" style={{ animation: 'pulse 1.5s infinite' }} />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const num = parseFloat(amount.replace(',', '.'));
    if (isNaN(num) || num < 1) {
      setError(i18n.language === 'ru' ? 'Минимальная сумма — 1' : 'Minimum amount is 1');
      return;
    }
    setLoading(true);
    const result = await apiService.balanceTopup(num, currency);
    setLoading(false);
    if (result.ok && result.paymentUrl) {
      window.location.href = result.paymentUrl;
    } else {
      setError(result.error || (i18n.language === 'ru' ? 'Ошибка создания платежа' : 'Payment creation failed'));
    }
  };

  const isRu = i18n.language === 'ru';

  return (
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="card"
        style={{ maxWidth: 480, margin: '2rem auto', padding: '2rem' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <Wallet size={40} color="var(--primary-blue)" />
          <h1 className="section-title" style={{ marginBottom: 0, fontSize: '1.75rem' }}>
            {isRu ? 'Пополнение баланса' : 'Balance top-up'}
          </h1>
        </div>

        <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-darker)', borderRadius: 8 }}>
          <span style={{ color: 'var(--text-secondary)' }}>{isRu ? 'Текущий баланс' : 'Current balance'}: </span>
          <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-blue)' }}>
            {user.balance.toFixed(0)} ₽
          </span>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
              {isRu ? 'Сумма' : 'Amount'}
            </label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '0.5rem' }}>
              {PRESET_AMOUNTS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAmount(String(a))}
                  style={{
                    padding: '0.5rem 0.75rem',
                    background: amount === String(a) ? 'var(--primary-blue)' : 'var(--bg-darker)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 6,
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                  }}
                >
                  {a} ₽
                </button>
              ))}
            </div>
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^\d.,]/g, ''))}
              placeholder={isRu ? 'Введите сумму' : 'Enter amount'}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: 'var(--bg-darker)',
                border: '1px solid var(--border-color)',
                borderRadius: 8,
                color: 'var(--text-primary)',
                fontSize: '1.25rem',
              }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
              {isRu ? 'Валюта' : 'Currency'}
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              {CURRENCIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCurrency(c)}
                  style={{
                    padding: '0.5rem 1rem',
                    background: currency === c ? 'var(--primary-blue)' : 'var(--bg-darker)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 6,
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          {error && (
            <div style={{ color: 'var(--accent-red)', marginBottom: '1rem', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}
          <button
            type="submit"
            className="btn"
            disabled={loading}
            style={{ width: '100%', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            {loading ? (isRu ? 'Переход к оплате...' : 'Redirecting...') : (
              <>
                {isRu ? 'Оплатить через PayGate' : 'Pay via PayGate'}
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <p style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <Link to="/shop" style={{ color: 'var(--primary-blue)', fontSize: '0.95rem' }}>
            {isRu ? '← Вернуться в магазин' : '← Back to shop'}
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Balance;
