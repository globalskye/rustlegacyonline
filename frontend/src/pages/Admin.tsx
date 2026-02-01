import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Settings, Package, ShoppingCart, Download, BarChart3, FileText, CreditCard,
  Shield, Plug, List, Sun, Moon, Monitor, LogOut, Zap, Building2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';
import * as Types from '../types';
import AdminServerInfo from '../components/admin/AdminServerInfo';
import AdminShop from '../components/admin/AdminShop';
import AdminDownloadLinks from '../components/admin/AdminDownloadLinks';
import AdminFeatures from '../components/admin/AdminFeatures';
import AdminHowToStart from '../components/admin/AdminHowToStart';
import AdminServerDetails from '../components/admin/AdminServerDetails';
import AdminPlugins from '../components/admin/AdminPlugins';
import AdminRules from '../components/admin/AdminRules';
import AdminPayments from '../components/admin/AdminPayments';
import AdminLegal from '../components/admin/AdminLegal';
import AdminNews from '../components/admin/AdminNews';
import AdminCompanyInfo from '../components/admin/AdminCompanyInfo';

const Admin: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { isAdmin, login, logout, theme, setTheme } = useApp();
  const [checking, setChecking] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (!isAdmin) {
      const tryAuth = async () => {
        const user = window.prompt('Admin username:');
        const pass = user ? window.prompt('Admin password:') : null;
        if (user && pass) {
          const ok = await login(user, pass);
          if (ok) setChecking(false);
          else {
            setMessage({ text: 'Invalid credentials', type: 'error' });
            setTimeout(() => navigate('/'), 1500);
          }
        } else {
          navigate('/');
        }
      };
      tryAuth();
    } else {
      setChecking(false);
    }
  }, [isAdmin]);

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  const navSections = [
    { path: 'server', label: 'Server Info', icon: Settings },
    { path: 'shop', label: 'Shop', icon: ShoppingCart },
    { path: 'downloads', label: 'Download Links', icon: Download },
    { path: 'features', label: 'Features', icon: Zap },
    { path: 'news', label: 'News', icon: FileText },
    { path: 'how-to-start', label: 'How To Start', icon: List },
    { path: 'server-details', label: 'Server Details', icon: FileText },
    { path: 'plugins', label: 'Plugins', icon: Plug },
    { path: 'rules', label: 'Rules', icon: Shield },
    { path: 'payments', label: 'Payment Methods', icon: CreditCard },
    { path: 'legal', label: 'Legal Docs', icon: FileText },
    { path: 'company', label: 'Company Info', icon: Building2 },
  ];

  if (checking && !isAdmin) {
    return (
      <div className="page-container" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Checking auth...</p>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h1 className="section-title" style={{ marginBottom: 0, fontSize: '1.8rem' }}>
            Admin Panel
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              {(['light', 'dark', 'auto'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className="btn btn-secondary"
                  style={{
                    padding: '0.5rem',
                    background: theme === t ? 'var(--primary-blue)' : undefined,
                    borderColor: theme === t ? 'var(--primary-blue)' : undefined,
                  }}
                >
                  {t === 'light' && <Sun size={18} />}
                  {t === 'dark' && <Moon size={18} />}
                  {t === 'auto' && <Monitor size={18} />}
                </button>
              ))}
            </div>
            <button
              onClick={async () => {
                if (window.confirm('Delete ALL clans and players? Data will be replaced by TopSystem sync.')) {
                  try {
                    await apiService.clearClansAndPlayers();
                    showMessage('Cleared. TopSystem will sync real data.', 'success');
                  } catch {
                    showMessage('Failed', 'error');
                  }
                }
              }}
              className="btn btn-secondary"
              style={{ padding: '0.5rem 1rem', background: '#ef4444', borderColor: '#ef4444' }}
            >
              Clear clans & players
            </button>
            <button onClick={() => { logout(); navigate('/'); }} className="btn btn-secondary">
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>

        {message && (
          <div
            style={{
              padding: '1rem',
              marginBottom: '1rem',
              borderRadius: '8px',
              background: message.type === 'success' ? '#10b981' : '#ef4444',
              color: 'white',
            }}
          >
            {message.text}
          </div>
        )}

        <nav style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          {navSections.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={`/admin/${path}`}
              style={({ isActive }) => ({
                padding: '0.75rem 1rem',
                background: isActive ? 'var(--primary-blue)' : 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: isActive ? 'white' : 'var(--text-secondary)',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: 600,
              })}
            >
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>

        <Routes>
          <Route index element={<Navigate to="server" replace />} />
          <Route path="server" element={<AdminServerInfo onMessage={showMessage} />} />
          <Route path="shop" element={<AdminShop onMessage={showMessage} />} />
          <Route path="downloads" element={<AdminDownloadLinks onMessage={showMessage} />} />
          <Route path="features" element={<AdminFeatures onMessage={showMessage} />} />
          <Route path="news" element={<AdminNews onMessage={showMessage} />} />
          <Route path="how-to-start" element={<AdminHowToStart onMessage={showMessage} />} />
          <Route path="server-details" element={<AdminServerDetails onMessage={showMessage} />} />
          <Route path="plugins" element={<AdminPlugins onMessage={showMessage} />} />
          <Route path="rules" element={<AdminRules onMessage={showMessage} />} />
          <Route path="payments" element={<AdminPayments onMessage={showMessage} />} />
          <Route path="legal" element={<AdminLegal onMessage={showMessage} />} />
          <Route path="company" element={<AdminCompanyInfo onMessage={showMessage} />} />
        </Routes>
      </motion.div>
    </div>
  );
};

export default Admin;
