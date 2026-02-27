import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';

const Login: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { login } = useApp();
  const navigate = useNavigate();
  const [loginVal, setLoginVal] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!loginVal.trim() || !password) {
      setError(i18n.language === 'ru' ? 'Введите логин и пароль' : 'Enter login and password');
      return;
    }
    setLoading(true);
    const ok = await login(loginVal.trim(), password);
    setLoading(false);
    if (ok) {
      navigate('/shop');
    } else {
      setError(i18n.language === 'ru' ? 'Неверный логин или пароль' : 'Invalid login or password');
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
          <LogIn size={40} color="var(--primary-blue)" />
          <h1 className="section-title" style={{ marginBottom: 0, fontSize: '1.75rem' }}>
            {isRu ? 'Вход' : 'Login'}
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
              placeholder={isRu ? 'Ваш логин' : 'Your login'}
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
              placeholder="••••••••"
              autoComplete="current-password"
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
            {loading ? (isRu ? 'Вход...' : 'Logging in...') : (isRu ? 'Войти' : 'Login')}
          </button>
        </form>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', textAlign: 'center' }}>
          {isRu ? 'Нет аккаунта?' : "Don't have an account?"}{' '}
          <Link to="/register" style={{ color: 'var(--primary-blue)', fontWeight: 600 }}>
            {isRu ? 'Регистрация' : 'Register'}
          </Link>
        </p>
        <p style={{ marginTop: '1rem', textAlign: 'center' }}>
          <Link to="/admin" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            <User size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            {isRu ? 'Вход для администратора' : 'Admin login'}
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
