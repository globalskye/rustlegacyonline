import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      nav: {
        home: 'Home',
        howToStart: 'How to Start',
        serverInfo: 'Server Info',
        rules: 'Rules',
        shop: 'Shop',
        statistics: 'Statistics'
      },
      hero: {
        title: 'Rust Legacy',
        description: 'Experience the classic survival gameplay. Build, survive, and dominate in the original Rust Legacy.',
        download: 'Download Game',
        checkVirus: 'Check on VirusTotal'
      },
      stats: {
        maxPlayers: 'Max Players',
        version: 'Version'
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
      footer: {
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
        howToStart: 'Как начать',
        serverInfo: 'Инфо о сервере',
        rules: 'Правила',
        shop: 'Магазин',
        statistics: 'Статистика'
      },
      hero: {
        title: 'Rust Legacy',
        description: 'Испытайте классический геймплей выживания. Стройте, выживайте и доминируйте в оригинальном Rust Legacy.',
        download: 'Скачать игру',
        checkVirus: 'Проверить на VirusTotal'
      },
      stats: {
        maxPlayers: 'Макс. игроков',
        version: 'Версия'
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
      footer: {
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
