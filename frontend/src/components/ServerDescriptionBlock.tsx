import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Zap, DollarSign, Users, Command, Shield, Gift, Bell } from 'lucide-react';

const COMMANDS_FULL = {
  mustKnow: [
    { cmd: '/kit', usage: '/kit "Starter"', fullDesc: { ru: 'Получить бесплатный набор предметов. У каждого набора свой кулдаун. Название в кавычках. Первым делом берите Starter.', en: 'Get free item kit. Each has cooldown. Use quotes. Start with Starter.' } },
    { cmd: '/home', usage: '/home или /home list', fullDesc: { ru: 'Телепорт к сохранённой точке «дом». /home list — список, /home название — телепорт.', en: 'Teleport to saved home. /home list shows all, /home name teleports.' } },
    { cmd: '/help', usage: '/help', fullDesc: { ru: 'Все команды вашего ранга. Список китов.', en: 'All commands for your rank. Kit list.' } },
    { cmd: '/about', usage: '/about', fullDesc: { ru: 'Информация о сервере: правила, рейты.', en: 'Server info: rules, rates.' } },
    { cmd: '/suicide', usage: 'F1 → suicide', fullDesc: { ru: 'Мгновенная смерть. Если застряли или хотите респнуться.', en: 'Instant death. If stuck or want to respawn.' } },
  ],
  baseAndTeam: [
    { cmd: '/share', usage: '/share "NickName"', fullDesc: { ru: 'Дать доступ к дверям и шкафам. Для тиммейтов.', en: 'Give access to doors and storage. For teammates.' } },
    { cmd: '/unshare', usage: '/unshare "NickName"', fullDesc: { ru: 'Забрать доступ.', en: 'Remove access.' } },
    { cmd: '/transfer', usage: 'Смотрите на объект → /transfer "NickName"', fullDesc: { ru: 'Передать объект. Для всего дома — смотрите на фундамент.', en: 'Transfer object. For whole base — look at foundation.' } },
    { cmd: '/destroy', usage: '/destroy', fullDesc: { ru: 'Режим сноса своих построек. Ресурсы частично возвращаются.', en: 'Demolish mode for your structures. Some resources returned.' } },
    { cmd: '/who', usage: 'Смотрите на объект → /who', fullDesc: { ru: 'Узнать владельца объекта.', en: 'See object owner.' } },
    { cmd: '/tp', usage: '/tp "NickName"', fullDesc: { ru: 'Запрос телепорта к игроку.', en: 'Request teleport to player.' } },
  ],
  chatAndInfo: [
    { cmd: '/pm', usage: '/pm "NickName" текст', fullDesc: { ru: 'Личное сообщение.', en: 'Private message.' } },
    { cmd: '/r', usage: '/r текст', fullDesc: { ru: 'Ответ на последнее ЛС.', en: 'Reply to last PM.' } },
    { cmd: '/history', usage: '/history', fullDesc: { ru: 'История чата.', en: 'Chat history.' } },
    { cmd: '/online', usage: '/online', fullDesc: { ru: 'Количество игроков.', en: 'Player count.' } },
    { cmd: '/players', usage: '/players', fullDesc: { ru: 'Список ников.', en: 'Player list.' } },
    { cmd: '/time', usage: '/time', fullDesc: { ru: 'Игровое время.', en: 'Game time.' } },
    { cmd: '/pos', usage: '/pos', fullDesc: { ru: 'Координаты.', en: 'Coordinates.' } },
    { cmd: '/ping', usage: '/ping', fullDesc: { ru: 'Задержка.', en: 'Latency.' } },
    { cmd: '/language', usage: '/language', fullDesc: { ru: 'Смена языка.', en: 'Change language.' } },
    { cmd: '/set', usage: '/set fps или /set quality', fullDesc: { ru: 'Пресеты графики.', en: 'Graphics presets.' } },
  ],
  economy: [
    { cmd: '/balance', usage: '/balance', fullDesc: { ru: 'Баланс валюты ($).', en: 'Currency balance ($).' } },
    { cmd: '/shop', usage: '/shop или /shop "Resources"', fullDesc: { ru: 'Магазин. Категории: Resources, Food, Weapons, Kevlar и т.д.', en: 'Shop. Categories: Resources, Food, Weapons, Kevlar, etc.' } },
    { cmd: '/buy', usage: '/buy дерево 1000', fullDesc: { ru: 'Купить предмет.', en: 'Buy item.' } },
    { cmd: '/sell', usage: '/sell дерево 500', fullDesc: { ru: 'Продать предмет.', en: 'Sell item.' } },
    { cmd: '/send', usage: '/send NickName 500', fullDesc: { ru: 'Передать валюту. Комиссия 10%.', en: 'Send currency. 10% tax.' } },
  ],
  clan: [
    { cmd: '/clan', usage: '/clan', fullDesc: { ru: 'Команды клана: create, invite, dismiss, leave, deposit, withdraw, warp, ff.', en: 'Clan commands: create, invite, dismiss, leave, deposit, withdraw, warp, ff.' } },
    { cmd: '/clan create', usage: '/clan create "Название"', fullDesc: { ru: 'Создать клан. Бесплатно. Макс 6 человек.', en: 'Create clan. Free. Max 6 members.' } },
    { cmd: '/clan invite', usage: '/clan invite "NickName"', fullDesc: { ru: 'Пригласить в клан.', en: 'Invite to clan.' } },
    { cmd: '/clan warp', usage: '/clan warp', fullDesc: { ru: 'Телепорт к клановому дому. Кулдаун 30 мин.', en: 'Teleport to clan house. 30 min cooldown.' } },
    { cmd: '/clan ff', usage: '/clan ff on/off', fullDesc: { ru: 'Урон по своим и подсветка союзников.', en: 'Friendly fire and ally highlight.' } },
    { cmd: '/clans', usage: '/clans', fullDesc: { ru: 'Список всех кланов.', en: 'List all clans.' } },
  ],
  raidAlert: [
    { cmd: '/raidalert', usage: '/raidalert', fullDesc: { ru: 'Оповещения о рейде в Telegram, Discord, VK.', en: 'Raid notifications to Telegram, Discord, VK.' } },
    { cmd: '/raidalert telegram', usage: '/raidalert telegram <id>', fullDesc: { ru: 'Подключить Telegram. Затем verify с кодом.', en: 'Connect Telegram. Then verify with code.' } },
    { cmd: '/raidalert discord', usage: '/raidalert discord <id>', fullDesc: { ru: 'Подключить Discord.', en: 'Connect Discord.' } },
    { cmd: '/raidalert vk', usage: '/raidalert vk <id>', fullDesc: { ru: 'Подключить VK.', en: 'Connect VK.' } },
    { cmd: '/raidalert preferred', usage: '/raidalert preferred <telegram|discord|vk>', fullDesc: { ru: 'Основной канал уведомлений.', en: 'Primary notification channel.' } },
    { cmd: '/raidalert clan', usage: '/raidalert clan', fullDesc: { ru: 'Уведомления о рейдах баз союзников.', en: 'Clan ally raid notifications.' } },
    { cmd: '/raidalert status', usage: '/raidalert status', fullDesc: { ru: 'Текущие настройки.', en: 'Current settings.' } },
    { cmd: '/raidalert test', usage: '/raidalert test', fullDesc: { ru: 'Тестовое уведомление.', en: 'Test notification.' } },
    { cmd: '/raidalert clear', usage: '/raidalert clear', fullDesc: { ru: 'Очистить настройки.', en: 'Clear settings.' } },
  ],
};

const KITS = [
  { name: 'Starter', cd: '30 мин', items: { ru: 'Еда, медикаменты, топор, лук, стрелы, тканевая броня', en: 'Food, meds, hatchet, bow, arrows, cloth armor' } },
  { name: 'wipe', cd: '1 раз', items: { ru: 'Сера, металл, кожа, ткань, дерево — после вайпа', en: 'Sulfur, metal, leather, cloth, wood — after wipe' } },
  { name: 'help', cd: '30 мин', items: { ru: 'Медикаменты и еда', en: 'Meds and food' } },
  { name: 'Home', cd: '1 раз', items: { ru: 'Фундамент, стены, дверь, печка, сундук, кровать', en: 'Foundation, walls, door, furnace, storage, bed' } },
  { name: 'Pipe', cd: '4 ч', items: { ru: 'Дробовик, патроны, медикаменты', en: 'Pipe shotgun, shells, meds' } },
};

type SectionId = 'about' | 'kits' | 'mustKnow' | 'baseAndTeam' | 'economy' | 'clan' | 'raidAlert' | 'chatAndInfo';

interface AccordionSectionProps {
  id: SectionId;
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const AccordionSection: React.FC<AccordionSectionProps> = ({ id, title, icon, isOpen, onToggle, children }) => (
  <div className="card" style={{ marginBottom: '0.75rem', overflow: 'hidden' }}>
    <button
      onClick={onToggle}
      style={{
        width: '100%',
        padding: '1.25rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        color: 'var(--text-primary)',
        fontFamily: 'Poppins',
        fontSize: '1.1rem',
        fontWeight: 600,
        textAlign: 'left',
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {icon}
        {title}
      </span>
      <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
        <ChevronDown size={22} color="var(--primary)" />
      </motion.div>
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{ overflow: 'hidden' }}
        >
          <div style={{ padding: '0 1.5rem 1.5rem', borderTop: '1px solid var(--border-color)' }}>
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

interface ServerDescriptionBlockProps {
  serverId: number;
}

const ServerDescriptionBlock: React.FC<ServerDescriptionBlockProps> = ({ serverId }) => {
  const { i18n } = useTranslation();
  const isRu = i18n.language === 'ru';
  const t = (ru: string, en: string) => (isRu ? ru : en);

  const [openSections, setOpenSections] = useState<Set<SectionId>>(new Set(['about']));

  const toggle = (id: SectionId) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const CommandCard = ({ c }: { c: { cmd: string; usage: string; fullDesc: { ru: string; en: string } } }) => (
    <div style={{ padding: '1rem', background: 'rgba(230,126,34,0.05)', borderRadius: 8, marginBottom: '0.75rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <code style={{ fontFamily: 'monospace', color: 'var(--primary)', fontWeight: 600 }}>{c.cmd}</code>
        <code style={{ fontFamily: 'monospace', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{c.usage}</code>
      </div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>
        {c.fullDesc[isRu ? 'ru' : 'en']}
      </p>
    </div>
  );

  if (serverId !== 1) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ marginTop: '2rem', marginBottom: '2rem' }}
    >
      <h2 style={{
        fontFamily: 'Poppins',
        fontSize: '1.5rem',
        color: 'var(--primary)',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}>
        <Zap size={28} />
        {t('Описание сервера Classic', 'Classic Server Description')}
      </h2>

      <AccordionSection
        id="about"
        title={t('О сервере', 'About Server')}
        icon={<Shield size={22} color="var(--primary)" />}
        isOpen={openSections.has('about')}
        onToggle={() => toggle('about')}
      >
        <div style={{ paddingTop: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>{t('Рейты', 'Rates')}</div>
              <div style={{ fontWeight: 600, color: 'var(--primary)' }}>x1</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>{t('Лимит дома', 'House limit')}</div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>6×6×10</div>
            </div>
          </div>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
            {t(
              'Классический Rust Legacy x1 с частичным вайпом. Система рангов, кланов, экономики и магазина. Лимит дома 6×6×10. Аирдропы по расписанию.',
              'Classic Rust Legacy x1 with partial wipe. Rank system, clans, economy and shop. House limit 6×6×10. Scheduled airdrops.'
            )}
          </p>
        </div>
      </AccordionSection>

      <AccordionSection
        id="kits"
        title={t('Основные наборы', 'Main Kits')}
        icon={<Gift size={22} color="var(--primary)" />}
        isOpen={openSections.has('kits')}
        onToggle={() => toggle('kits')}
      >
        <div style={{ paddingTop: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.75rem' }}>
            {KITS.map((kit) => (
              <div key={kit.name} style={{ padding: '1rem', background: 'rgba(230,126,34,0.06)', borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <code style={{ fontFamily: 'monospace', color: 'var(--primary)', fontWeight: 600 }}>/kit "{kit.name}"</code>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'rgba(230,126,34,0.15)', padding: '0.15rem 0.4rem', borderRadius: 4 }}>{kit.cd}</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>{kit.items[isRu ? 'ru' : 'en']}</p>
              </div>
            ))}
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.75rem' }}>
            {t('Спецкиты для VIP и рангов — /help в игре.', 'Special kits for VIP and ranks — /help in-game.')}
          </p>
        </div>
      </AccordionSection>

      <AccordionSection
        id="mustKnow"
        title={t('Обязательно знать', 'Must know')}
        icon={<Command size={22} color="var(--primary)" />}
        isOpen={openSections.has('mustKnow')}
        onToggle={() => toggle('mustKnow')}
      >
        <div style={{ paddingTop: '1rem', display: 'grid', gap: '0.75rem' }}>
          {COMMANDS_FULL.mustKnow.map((c) => (
            <CommandCard key={c.cmd} c={c} />
          ))}
        </div>
      </AccordionSection>

      <AccordionSection
        id="baseAndTeam"
        title={t('База и тиммейты', 'Base & teammates')}
        icon={<Command size={22} color="var(--primary)" />}
        isOpen={openSections.has('baseAndTeam')}
        onToggle={() => toggle('baseAndTeam')}
      >
        <div style={{ paddingTop: '1rem', display: 'grid', gap: '0.75rem' }}>
          {COMMANDS_FULL.baseAndTeam.map((c) => (
            <CommandCard key={c.cmd} c={c} />
          ))}
        </div>
      </AccordionSection>

      <AccordionSection
        id="economy"
        title={t('Экономика', 'Economy')}
        icon={<DollarSign size={22} color="var(--primary)" />}
        isOpen={openSections.has('economy')}
        onToggle={() => toggle('economy')}
      >
        <div style={{ paddingTop: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{t('Старт', 'Start')}</div>
              <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1.3rem' }}>100 $</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{t('Заработок', 'Earn')}</div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                {t('Убийства, PvP, продажа', 'Kills, PvP, selling')}
              </div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{t('Потери', 'Losses')}</div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                {t('Смерть −10–15%, перевод −10%', 'Death −10–15%, transfer −10%')}
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {COMMANDS_FULL.economy.map((c) => (
              <CommandCard key={c.cmd} c={c} />
            ))}
          </div>
        </div>
      </AccordionSection>

      <AccordionSection
        id="clan"
        title={t('Система кланов', 'Clan System')}
        icon={<Users size={22} color="var(--primary)" />}
        isOpen={openSections.has('clan')}
        onToggle={() => toggle('clan')}
      >
        <div style={{ paddingTop: '1rem' }}>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
            {t(
              'Кланы до 6 человек. 12 уровней. Бонусы к фарму до +180%. Warp — телепорт к клановому дому (30 мин). С 9 уровня — клановые войны.',
              'Clans up to 6 members. 12 levels. Gathering bonuses up to +180%. Warp — teleport to clan house (30 min). Level 9+ — clan wars.'
            )}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
            {[0, 1, 3, 5, 9, 12].map((lvl) => (
              <span key={lvl} style={{ padding: '0.4rem 0.6rem', background: 'rgba(230,126,34,0.1)', borderRadius: 6, fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)' }}>
                Lvl {lvl}: {lvl === 0 ? '+0%' : lvl === 1 ? '+10%' : lvl === 3 ? '+30%' : lvl === 5 ? '+50%' : lvl === 9 ? '+90%' : '+180%'}
              </span>
            ))}
          </div>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {COMMANDS_FULL.clan.map((c) => (
              <CommandCard key={c.cmd} c={c} />
            ))}
          </div>
        </div>
      </AccordionSection>

      <AccordionSection
        id="raidAlert"
        title="RaidAlert"
        icon={<Bell size={22} color="var(--primary)" />}
        isOpen={openSections.has('raidAlert')}
        onToggle={() => toggle('raidAlert')}
      >
        <div style={{ paddingTop: '1rem' }}>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
            {t(
              'Пуш в Telegram, Discord или VK при рейде вашей базы. Уведомления о рейдах союзников по клану.',
              'Push to Telegram, Discord or VK when your base is raided. Clan ally raid notifications.'
            )}
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            {['Telegram', 'Discord', 'VK'].map((s) => (
              <span key={s} style={{ padding: '0.3rem 0.6rem', background: 'rgba(230,126,34,0.12)', borderRadius: 6, fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)' }}>{s}</span>
            ))}
          </div>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {COMMANDS_FULL.raidAlert.map((c) => (
              <CommandCard key={c.cmd} c={c} />
            ))}
          </div>
        </div>
      </AccordionSection>

      <AccordionSection
        id="chatAndInfo"
        title={t('Чат, информация, графика', 'Chat, info, graphics')}
        icon={<Command size={22} color="var(--primary)" />}
        isOpen={openSections.has('chatAndInfo')}
        onToggle={() => toggle('chatAndInfo')}
      >
        <div style={{ paddingTop: '1rem', display: 'grid', gap: '0.75rem' }}>
          {COMMANDS_FULL.chatAndInfo.map((c) => (
            <CommandCard key={c.cmd} c={c} />
          ))}
        </div>
      </AccordionSection>
    </motion.div>
  );
};

export default ServerDescriptionBlock;
