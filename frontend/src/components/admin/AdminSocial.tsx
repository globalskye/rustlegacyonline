import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Send, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { apiService } from '../../services/api';
import * as Types from '../../types';

const defaultConfig: Types.SocialConfig = {
  discord: { botToken: '', channels: [] },
  vk: { accessToken: '', groupId: '', targets: [] },
  autoMessages: [],
};

const EVENT_TYPES = [
  { value: 'wipe', label: 'Wipe сервера' },
  { value: 'server_online', label: 'Сервер онлайн' },
  { value: 'announcement', label: 'Объявление' },
  { value: 'custom', label: 'Своё событие' },
];

export default function AdminSocial({ onMessage }: { onMessage: (t: string, type: 'success' | 'error') => void }) {
  const [config, setConfig] = useState<Types.SocialConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = () =>
    apiService
      .getSocialConfig()
      .then((c) => {
        setConfig({
          discord: {
            botToken: c.discord?.botToken ?? '',
            channels: Array.isArray(c.discord?.channels) ? c.discord.channels : [],
          },
          vk: {
            accessToken: c.vk?.accessToken ?? '',
            groupId: c.vk?.groupId ?? '',
            targets: Array.isArray(c.vk?.targets) ? c.vk.targets : [],
          },
          autoMessages: Array.isArray(c.autoMessages) ? c.autoMessages : [],
        });
      })
      .catch(() => onMessage('Не удалось загрузить настройки', 'error'));

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await apiService.updateSocialConfig(config);
      onMessage('Настройки сохранены', 'success');
      load();
    } catch {
      onMessage('Ошибка сохранения', 'error');
    } finally {
      setSaving(false);
    }
  };

  const addDiscordChannel = () => {
    setConfig((prev) => ({
      ...prev,
      discord: {
        ...prev.discord,
        channels: [...prev.discord.channels, { id: '', name: '', purpose: '' }],
      },
    }));
  };
  const removeDiscordChannel = (i: number) => {
    setConfig((prev) => ({
      ...prev,
      discord: {
        ...prev.discord,
        channels: prev.discord.channels.filter((_, idx) => idx !== i),
      },
    }));
  };
  const updateDiscordChannel = (i: number, field: keyof Types.SocialChannel, value: string) => {
    setConfig((prev) => {
      const ch = [...prev.discord.channels];
      ch[i] = { ...ch[i], [field]: value };
      return { ...prev, discord: { ...prev.discord, channels: ch } };
    });
  };

  const addVKTarget = () => {
    setConfig((prev) => ({
      ...prev,
      vk: {
        ...prev.vk,
        targets: [...prev.vk.targets, { id: '', name: '', purpose: '' }],
      },
    }));
  };
  const removeVKTarget = (i: number) => {
    setConfig((prev) => ({
      ...prev,
      vk: { ...prev.vk, targets: prev.vk.targets.filter((_, idx) => idx !== i) },
    }));
  };
  const updateVKTarget = (i: number, field: keyof Types.SocialChannel, value: string) => {
    setConfig((prev) => {
      const t = [...prev.vk.targets];
      t[i] = { ...t[i], [field]: value };
      return { ...prev, vk: { ...prev.vk, targets: t } };
    });
  };

  const addAutoMessage = () => {
    setConfig((prev) => ({
      ...prev,
      autoMessages: [
        ...prev.autoMessages,
        { eventType: 'announcement', discordChannelId: '', vkPeerId: '', template: '', enabled: true },
      ],
    }));
  };
  const removeAutoMessage = (i: number) => {
    setConfig((prev) => ({
      ...prev,
      autoMessages: prev.autoMessages.filter((_, idx) => idx !== i),
    }));
  };
  const updateAutoMessage = (i: number, field: keyof Types.AutoMessageRule, value: string | boolean) => {
    setConfig((prev) => {
      const a = [...prev.autoMessages];
      a[i] = { ...a[i], [field]: value };
      return { ...prev, autoMessages: a };
    });
  };

  if (loading) {
    return (
      <div className="card">
        <p style={{ color: 'var(--text-secondary)' }}>Загрузка...</p>
      </div>
    );
  }

  const cardStyle = { marginBottom: '1.5rem' };
  const inputStyle = {
    width: '100%',
    padding: '0.5rem 0.75rem',
    background: 'var(--bg-darker)',
    border: '1px solid var(--border-color)',
    borderRadius: 8,
    color: 'var(--text-primary)',
  };
  const labelStyle = { display: 'block', marginBottom: '0.25rem', color: 'var(--text-secondary)', fontSize: '0.9rem' };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <Link
          to="/admin"
          className="btn btn-secondary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}
        >
          <ArrowLeft size={18} /> Назад в админку
        </Link>
        <h1 className="section-title" style={{ marginBottom: 0, fontSize: '1.5rem' }}>
          Discord и VK — боты и рассылки
        </h1>
      </div>

      {/* Discord */}
      <div className="card" style={cardStyle}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <MessageCircle size={24} color="var(--primary-blue)" /> Discord
        </h2>
        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Токен бота (Bot Token)</label>
          <input
            type="password"
            placeholder="Оставьте пустым или ****xxxx чтобы не менять"
            value={config.discord.botToken}
            onChange={(e) => setConfig((c) => ({ ...c, discord: { ...c.discord, botToken: e.target.value } }))}
            style={inputStyle}
          />
        </div>
        <div style={{ marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Каналы (куда писать)</div>
        {config.discord.channels.map((ch, i) => (
          <div
            key={i}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr auto 40px',
              gap: '0.5rem',
              alignItems: 'center',
              marginBottom: '0.5rem',
            }}
          >
            <input
              placeholder="ID канала (число)"
              value={ch.id}
              onChange={(e) => updateDiscordChannel(i, 'id', e.target.value)}
              style={inputStyle}
            />
            <input
              placeholder="Название"
              value={ch.name}
              onChange={(e) => updateDiscordChannel(i, 'name', e.target.value)}
              style={inputStyle}
            />
            <input
              placeholder="Назначение (например: анонсы)"
              value={ch.purpose}
              onChange={(e) => updateDiscordChannel(i, 'purpose', e.target.value)}
              style={inputStyle}
            />
            <button
              type="button"
              className="btn btn-secondary"
              style={{ padding: '0.5rem' }}
              onClick={() => removeDiscordChannel(i)}
              title="Удалить"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
        <button type="button" className="btn btn-secondary" style={{ marginTop: '0.5rem' }} onClick={addDiscordChannel}>
          <Plus size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Добавить канал
        </button>
      </div>

      {/* VK */}
      <div className="card" style={cardStyle}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <MessageCircle size={24} color="#2787F5" /> VK
        </h2>
        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Токен доступа (Access Token)</label>
          <input
            type="password"
            placeholder="Оставьте пустым или ****xxxx чтобы не менять"
            value={config.vk.accessToken}
            onChange={(e) => setConfig((c) => ({ ...c, vk: { ...c.vk, accessToken: e.target.value } }))}
            style={inputStyle}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>ID группы (число, без минуса)</label>
          <input
            placeholder="123456789"
            value={config.vk.groupId}
            onChange={(e) => setConfig((c) => ({ ...c, vk: { ...c.vk, groupId: e.target.value } }))}
            style={inputStyle}
          />
        </div>
        <div style={{ marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Куда писать (стена, беседы)</div>
        {config.vk.targets.map((t, i) => (
          <div
            key={i}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr auto 40px',
              gap: '0.5rem',
              alignItems: 'center',
              marginBottom: '0.5rem',
            }}
          >
            <input
              placeholder="Peer ID (например -123456789 для стены)"
              value={t.id}
              onChange={(e) => updateVKTarget(i, 'id', e.target.value)}
              style={inputStyle}
            />
            <input
              placeholder="Название"
              value={t.name}
              onChange={(e) => updateVKTarget(i, 'name', e.target.value)}
              style={inputStyle}
            />
            <input
              placeholder="Назначение"
              value={t.purpose}
              onChange={(e) => updateVKTarget(i, 'purpose', e.target.value)}
              style={inputStyle}
            />
            <button
              type="button"
              className="btn btn-secondary"
              style={{ padding: '0.5rem' }}
              onClick={() => removeVKTarget(i)}
              title="Удалить"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
        <button type="button" className="btn btn-secondary" style={{ marginTop: '0.5rem' }} onClick={addVKTarget}>
          <Plus size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Добавить получателя
        </button>
      </div>

      {/* Auto messages */}
      <div className="card" style={cardStyle}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Send size={24} color="var(--primary-blue)" /> Автосообщения
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
          Правила: при каком событии куда отправлять сообщение. Шаблон может содержать переменные (в будущем).
        </p>
        {config.autoMessages.map((rule, i) => (
          <div
            key={i}
            style={{
              padding: '1rem',
              background: 'var(--bg-darker)',
              borderRadius: 8,
              marginBottom: '0.75rem',
              border: '1px solid var(--border-color)',
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 1fr 1fr auto', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <select
                value={rule.eventType}
                onChange={(e) => updateAutoMessage(i, 'eventType', e.target.value)}
                style={inputStyle}
              >
                {EVENT_TYPES.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <input
                placeholder="Discord Channel ID"
                value={rule.discordChannelId}
                onChange={(e) => updateAutoMessage(i, 'discordChannelId', e.target.value)}
                style={inputStyle}
              />
              <input
                placeholder="VK Peer ID"
                value={rule.vkPeerId}
                onChange={(e) => updateAutoMessage(i, 'vkPeerId', e.target.value)}
                style={inputStyle}
              />
              <input
                placeholder="Текст сообщения"
                value={rule.template}
                onChange={(e) => updateAutoMessage(i, 'template', e.target.value)}
                style={inputStyle}
              />
              <label style={{ display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
                <input
                  type="checkbox"
                  checked={rule.enabled}
                  onChange={(e) => updateAutoMessage(i, 'enabled', e.target.checked)}
                />
                вкл
              </label>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '0.5rem' }}
                onClick={() => removeAutoMessage(i)}
                title="Удалить"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
        <button type="button" className="btn btn-secondary" style={{ marginTop: '0.5rem' }} onClick={addAutoMessage}>
          <Plus size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Добавить правило
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <button className="btn" onClick={save} disabled={saving} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <Send size={18} /> {saving ? 'Сохранение...' : 'Сохранить настройки'}
        </button>
        <Link to="/admin" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Вернуться на главную админки
        </Link>
      </div>
    </div>
  );
}
