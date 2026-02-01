import { useEffect } from 'react';

const YM_ID = process.env.REACT_APP_YANDEX_METRIKA_ID || '106569354';
const GTM_ID = process.env.REACT_APP_GTM_ID || 'GTM-MQV9PG9C';

export function Analytics() {
  useEffect(() => {
    // Yandex Metrika
    (function(m: any, e: string, t: string, r: string, i: string, k?: string, a?: any) {
      m[i] = m[i] || function() { (m[i].a = m[i].a || []).push(arguments); };
      m[i].l = 1 * new Date().getTime();
      for (let j = 0; j < document.scripts.length; j++) {
        if ((document.scripts[j] as HTMLScriptElement).src === r) return;
      }
      const s = document.createElement(e) as HTMLScriptElement;
      const first = document.getElementsByTagName(e)[0];
      s.async = true;
      s.src = r;
      first?.parentNode?.insertBefore(s, first);
    })(window, 'script', 'https://mc.yandex.ru/metrika/tag.js?id=' + YM_ID, 'https://mc.yandex.ru/metrika/tag.js?id=' + YM_ID, 'ym');

    (window as any).ym(YM_ID, 'init', {
      ssr: true,
      webvisor: true,
      clickmap: true,
      ecommerce: 'dataLayer',
      referrer: document.referrer,
      url: window.location.href,
      accurateTrackBounce: true,
      trackLinks: true
    });

    // Google Tag Manager
    (function(w: any, d: Document, s: string, l: string, i: string) {
      w[l] = w[l] || [];
      w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
      const f = d.getElementsByTagName(s)[0];
      const j = d.createElement(s) as HTMLScriptElement;
      const dl = l !== 'dataLayer' ? '&l=' + l : '';
      j.async = true;
      j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
      f?.parentNode?.insertBefore(j, f);
    })(window, document, 'script', 'dataLayer', GTM_ID);
  }, []);

  return (
    <>
      <noscript>
        <div>
          <img src={`https://mc.yandex.ru/watch/${YM_ID}`} style={{ position: 'absolute', left: '-9999px' }} alt="" />
        </div>
      </noscript>
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
          height="0"
          width="0"
          style={{ display: 'none', visibility: 'hidden' }}
          title="GTM"
        />
      </noscript>
    </>
  );
}
