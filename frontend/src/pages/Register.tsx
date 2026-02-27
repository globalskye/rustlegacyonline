import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';

const Register: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { register } = useApp();
  const navigate = useNavigate();
  const [loginVal, setLoginVal] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!loginVal.trim() || loginVal.trim().length < 3) {
      setError(i18n.language === 'ru' ? 'Логин не менее 3 символов' : 'Login must be at least 3 characters');
      return;
    }
    if (password.length < 6) {
      setError(i18n.language === 'ru' ? 'Пароль не менее 6 символов' : 'Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError(i18n.language === 'ru' ? 'Пароли не совпадают' : 'Passwords do not match');
      return;
    }
    setLoading(true);
    const result = await register(loginVal.trim(), password);
    setLoading(false);
    if (result.ok) {
      navigate('/shop');
    } else {
      setError(result.error || (i18n.language === 'ru' ? 'Ошибка регистрации' : 'Registration failed'));
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
        style={{ maxWidth: 420, margin: '2rem auto', padding: '2rem' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <UserPlus size={40} color="var(--primary-blue)" />
          <h1 className="section-title" style={{ marginBottom: 0, fontSize: '1.75rem' }}>
            {isRu ? 'Регистрация' : 'Register'}
          </h1>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
              {isRu ? 'Логин' : 'Login'}
            </label>
            <input
              type="text"
              value={loginVal}
              onChange={(e) => setLoginVal(e.target.value)}
              placeholder={isRu ? 'Произвольный логин' : 'Choose a login'}
              autoComplete="username"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: 'var(--bg-darker)',
                border: '1px solid var(--border-color)',
                borderRadius: 8,
                color: 'var(--text-primary)',
                fontSize: '1rem',
              }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
              {isRu ? 'Пароль' : 'Password'}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isRu ? 'Минимум 6 символов' : 'At least 6 characters'}
              autoComplete="new-password"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: 'var(--bg-darker)',
                border: '1px solid var(--border-color)',
                borderRadius: 8,
                color: 'var(--text-primary)',
                fontSize: '1rem',
              }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
              {isRu ? 'Повторите пароль' : 'Confirm password'}
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: 'var(--bg-darker)',
                border: '1px solid var(--border-color)',
                borderRadius: 8,
                color: 'var(--text-primary)',
                fontSize: '1rem',
              }}
            />
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
            style={{ width: '100%', padding: '1rem', marginBottom: '1rem' }}
          >
            {loading ? (isRu ? 'Регистрация...' : 'Registering...') : (isRu ? 'Зарегистрироваться' : 'Register')}
          </button>
        </form>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', textAlign: 'center' }}>
          {isRu ? 'Уже есть аккаунт?' : 'Already have an account?'}{' '}
          <Link to="/login" style={{ color: 'var(--primary-blue)', fontWeight: 600 }}>
            {isRu ? 'Войти' : 'Login'}
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
