import { useEffect } from 'react';

const GA_ID = process.env.REACT_APP_GOOGLE_ANALYTICS_ID;
const YM_ID = process.env.REACT_APP_YANDEX_METRIKA_ID;

export function Analytics() {
  useEffect(() => {
    if (GA_ID) {
      const s = document.createElement('script');
      s.async = true;
      s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
      document.head.appendChild(s);
      (window as any).dataLayer = (window as any).dataLayer || [];
      (window as any).gtag = function(...args: any[]) {
        (window as any).dataLayer.push(args);
      };
      (window as any).gtag('js', new Date());
      (window as any).gtag('config', GA_ID);
    }
    if (YM_ID) {
      const w = window as any;
      w.ym = w.ym || function() { (w.ym.a = w.ym.a || []).push(arguments); };
      w.ym.l = 1 * new Date().getTime();
      const script = document.createElement('script') as HTMLScriptElement;
      script.async = true;
      script.src = 'https://mc.yandex.ru/metrika/tag.js';
      const first = document.getElementsByTagName('script')[0];
      first.parentNode?.insertBefore(script, first);
      w.ym(YM_ID, 'init', { clickmap: true, trackLinks: true, accurateTrackBounce: true });
    }
  }, []);
  return null;
}
