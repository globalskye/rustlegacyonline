import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Mail, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { apiService } from '../services/api';

const Contact: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRu = i18n.language === 'ru';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<'success' | 'error' | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);
    setLoading(true);
    try {
      const { ok, error } = await apiService.sendContact({ name, email, message });
      if (ok) {
        setResult('success');
        setName('');
        setEmail('');
        setMessage('');
      } else {
        setResult('error');
        setErrorMsg(error || (isRu ? 'Ошибка отправки' : 'Send failed'));
      }
    } catch {
      setResult('error');
      setErrorMsg(isRu ? 'Ошибка сети. Попробуйте позже.' : 'Network error. Try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: 64, height: 64, borderRadius: 16,
              background: 'linear-gradient(135deg, var(--primary), var(--primary-darker))',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '1rem',
            }}>
              <Mail size={28} color="#fff" />
            </div>
            <h1 className="section-title" style={{ marginBottom: '0.5rem' }}>
              {isRu ? 'Связаться с нами' : 'Contact Us'}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
              {isRu ? 'Спросите что угодно - мы ответим на почту.' : "Ask anything - we'll reply to your email."}
            </p>
          </div>

          <div className="card" style={{ padding: '2rem' }}>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  {isRu ? 'Имя' : 'Name'}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  maxLength={100}
                  placeholder={isRu ? 'Ваше имя' : 'Your name'}
                  style={{
                    width: '100%', padding: '0.75rem 1rem', borderRadius: 8,
                    border: '1px solid var(--border-color)', background: 'var(--bg-darker)',
                    color: 'var(--text-primary)', fontSize: '1rem',
                  }}
                />
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  style={{
                    width: '100%', padding: '0.75rem 1rem', borderRadius: 8,
                    border: '1px solid var(--border-color)', background: 'var(--bg-darker)',
                    color: 'var(--text-primary)', fontSize: '1rem',
                  }}
                />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  {isRu ? 'Сообщение' : 'Message'}
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={5}
                  maxLength={5000}
                  placeholder={isRu ? 'Ваше сообщение...' : 'Your message...'}
                  style={{
                    width: '100%', padding: '0.75rem 1rem', borderRadius: 8,
                    border: '1px solid var(--border-color)', background: 'var(--bg-darker)',
                    color: 'var(--text-primary)', fontSize: '1rem', resize: 'vertical',
                  }}
                />
              </div>

              {result === 'success' && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  color: 'var(--success)', marginBottom: '1rem', fontSize: '0.95rem',
                }}>
                  <CheckCircle size={20} />
                  {isRu ? 'Сообщение отправлено! Мы ответим на вашу почту.' : "Message sent! We'll reply to your email."}
                </div>
              )}
              {result === 'error' && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  color: 'var(--error)', marginBottom: '1rem', fontSize: '0.95rem',
                }}>
                  <AlertCircle size={20} />
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', padding: '0.9rem 1.5rem', borderRadius: 8,
                  background: 'linear-gradient(135deg, var(--primary), var(--primary-darker))',
                  color: '#fff', border: 'none', fontSize: '1rem', fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                }}
              >
                {loading ? (isRu ? 'Отправка...' : 'Sending...') : (
                  <>
                    <Send size={18} />
                    {isRu ? 'Отправить' : 'Send'}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Contact;
