import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      nav: {
        home: 'Home',
        news: 'News',
        howToStart: 'How to Start',
        serverInfo: 'Server Info',
        rules: 'Rules',
        contact: 'Contact',
        shop: 'Shop',
        statistics: 'Statistics',
        admin: 'Admin'
      },
      hero: {
        title: 'Rust Legacy',
        description: 'Experience the classic survival gameplay. Build, survive, and dominate in the original Rust Legacy.',
        download: 'Download Game',
        checkVirus: 'Check on VirusTotal'
      },
      stats: {
        clan: 'Clan',
        maxPlayers: 'Max Players',
        version: 'Version',
        nextFullWipe: 'Next full wipe',
        nextPartialWipe: 'Next partial wipe',
        onlineChart: 'Online chart',
        showChart: 'Show chart',
        hideChart: 'Hide chart',
        last24h: 'Last 24h',
        last7d: 'Last 7 days'
      },
      news: {
        title: 'Latest News'
      },
      features: {
        title: 'Server Features'
      },
      howToStart: {
        title: 'How to Get Started',
        subtitle: 'Follow these simple steps to join our server'
      },
      serverInfo: {
        title: 'Server Information',
        aboutTitle: 'About Server',
        pluginsTitle: 'Server Plugins',
        commandsTitle: 'Commands'
      },
      rules: {
        title: 'Server Rules',
        subtitle: 'Please read and follow these rules to ensure a fair gaming experience for everyone'
      },
      payment: {
        title: 'Payment Methods',
        subtitle: 'We accept the following payment methods'
      },
      legal: {
        title: 'Legal Information',
        terms: 'Terms of Service',
        privacy: 'Privacy Policy',
        companyInfo: 'Company Information',
        lastUpdated: 'Last updated'
      },
      faq: {
        title: 'FAQ',
        q1: 'How do I download and play?',
        a1: 'Download the client from the link above, verify on VirusTotal, then install and connect to our server.',
        q2: 'Is it free to play?',
        a2: 'Yes, the server is free. Optional VIP packages are available in the shop.',
        q3: 'How does the shop work?',
        a3: 'Digital items (VIP, resources) are delivered instantly in-game via RCON after payment.',
        q4: 'Where can I see server rules?',
        a4: 'Check the Rules page. Violations may result in a ban.',
      },
      serverDesc: {
        classicTitle: 'Classic Server Description',
        aboutServer: 'About Server',
        mainKits: 'Main Kits',
        specialKitsText: 'Special kits for VIP and ranks available in the shop.',
        specialKitsLink: 'Go to Shop',
        mustKnow: 'Must know',
        baseAndTeam: 'Base & teammates',
        economy: 'Economy',
        clanSystem: 'Clan System',
        chatInfoGraphics: 'Chat, info, graphics',
        rates: 'Rates',
        houseLimit: 'House limit',
        start: 'Start',
        earn: 'Kills, PvP, selling',
        losses: 'Death −10–15%, transfer −10%',
        aboutText: 'Classic Rust Legacy x1 with partial wipe. Rank system, clans, economy and shop. House limit 6×6×10. Scheduled airdrops.',
        clanText: 'Clans up to 6 members. 12 levels. Gathering bonuses up to +180%. Warp - teleport to clan house (30 min). Level 9+ - clan wars.',
        raidAlertText: 'Push to Telegram, Discord or VK when your base is raided. Clan ally raid notifications.',
      },
      footer: {
        contactForm: 'Contact form',
        socialLinks: 'Social links — bottom right',
        rights: 'All rights reserved.',
        paymentMethods: 'Payment Methods',
        legal: 'Legal',
        support: 'Support'
      }
    }
  },
  ru: {
    translation: {
      nav: {
        home: 'Главная',
        news: 'Новости',
        howToStart: 'Как начать',
        serverInfo: 'Инфо о сервере',
        rules: 'Правила',
        contact: 'Связаться',
        shop: 'Магазин',
        statistics: 'Статистика',
        admin: 'Админка'
      },
      hero: {
        title: 'Rust Legacy',
        description: 'Испытайте классический геймплей выживания. Стройте, выживайте и доминируйте в оригинальном Rust Legacy.',
        download: 'Скачать игру',
        checkVirus: 'Проверить на VirusTotal'
      },
      stats: {
        clan: 'Клан',
        maxPlayers: 'Макс. игроков',
        version: 'Версия',
        nextFullWipe: 'До полного вайпа',
        nextPartialWipe: 'До частичного вайпа',
        onlineChart: 'График онлайна',
        showChart: 'Показать график',
        hideChart: 'Скрыть график',
        last24h: 'За 24ч',
        last7d: 'За 7 дней'
      },
      news: {
        title: 'Последние новости'
      },
      features: {
        title: 'Особенности сервера'
      },
      howToStart: {
        title: 'Как начать играть',
        subtitle: 'Следуйте этим простым шагам, чтобы присоединиться к нашему серверу'
      },
      serverInfo: {
        title: 'Информация о сервере',
        aboutTitle: 'О сервере',
        pluginsTitle: 'Плагины сервера',
        commandsTitle: 'Команды'
      },
      rules: {
        title: 'Правила сервера',
        subtitle: 'Пожалуйста, прочтите и следуйте этим правилам для честной игры'
      },
      payment: {
        title: 'Способы оплаты',
        subtitle: 'Мы принимаем следующие способы оплаты'
      },
      legal: {
        title: 'Юридическая информация',
        terms: 'Пользовательское соглашение',
        privacy: 'Политика конфиденциальности',
        companyInfo: 'Информация о компании',
        lastUpdated: 'Последнее обновление'
      },
      faq: {
        title: 'Частые вопросы',
        q1: 'Как скачать и начать играть?',
        a1: 'Скачайте клиент по ссылке выше, проверьте на VirusTotal, установите и подключайтесь к серверу.',
        q2: 'Игра бесплатная?',
        a2: 'Да, сервер бесплатный. Опционально доступны VIP-пакеты в магазине.',
        q3: 'Как работает магазин?',
        a3: 'Цифровые товары (VIP, ресурсы) доставляются мгновенно в игру через RCON после оплаты.',
        q4: 'Где посмотреть правила сервера?',
        a4: 'На странице Правила. Нарушения могут привести к бану.',
      },
      serverDesc: {
        classicTitle: 'Описание сервера Classic',
        aboutServer: 'О сервере',
        mainKits: 'Основные наборы',
        specialKitsText: 'Спецкиты для VIP и рангов доступны в магазине.',
        specialKitsLink: 'Перейти в магазин',
        mustKnow: 'Обязательно знать',
        baseAndTeam: 'База и тиммейты',
        economy: 'Экономика',
        clanSystem: 'Система кланов',
        chatInfoGraphics: 'Чат, информация, графика',
        rates: 'Рейты',
        houseLimit: 'Лимит дома',
        start: 'Старт',
        earn: 'Убийства, PvP, продажа',
        losses: 'Смерть −10–15%, перевод −10%',
        aboutText: 'Классический Rust Legacy x1 с частичным вайпом. Система рангов, кланов, экономики и магазина. Лимит дома 6×6×10. Аирдропы по расписанию.',
        clanText: 'Кланы до 6 человек. 12 уровней. Бонусы к фарму до +180%. Warp - телепорт к клановому дому (30 мин). С 9 уровня - клановые войны.',
        raidAlertText: 'Пуш в Telegram, Discord или VK при рейде вашей базы. Уведомления о рейдах союзников по клану.',
      },
      footer: {
        contactForm: 'Форма обратной связи',
        socialLinks: 'Ссылки на соцсети — справа внизу',
        rights: 'Все права защищены.',
        paymentMethods: 'Способы оплаты',
        legal: 'Юридическая информация',
        support: 'Поддержка'
      }
    }
  }
};

const getInitialLanguage = () => {
  const stored = localStorage.getItem('rustlegacy-lang');
  if (stored) return stored;
  const browser = navigator.language?.toLowerCase() || '';
  return browser.startsWith('ru') ? 'ru' : 'en';
};

const initialLng = getInitialLanguage();
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLng,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });
if (typeof document !== 'undefined') document.documentElement.lang = initialLng;

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('rustlegacy-lang', lng);
  if (typeof document !== 'undefined') document.documentElement.lang = lng;
});

export default i18n;
