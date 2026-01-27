import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      hero: {
        title: 'Rust Legacy',
        description: 'Experience the classic survival gameplay. Build, survive, and dominate in the original Rust Legacy.',
        download: 'Download Game'
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
      footer: {
        rights: 'All rights reserved.'
      }
    }
  },
  ru: {
    translation: {
      hero: {
        title: 'Rust Legacy',
        description: 'Испытайте классический геймплей выживания. Стройте, выживайте и доминируйте в оригинальном Rust Legacy.',
        download: 'Скачать игру'
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
      footer: {
        rights: 'Все права защищены.'
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
