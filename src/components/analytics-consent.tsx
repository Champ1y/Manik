'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { analytics } from '@/content/seo';

const consentListeners = new Set<() => void>();
function subscribe(callback: () => void) { consentListeners.add(callback); return () => { consentListeners.delete(callback); }; }
function getConsent() { try { return localStorage.getItem('manic.analytics-consent') || ''; } catch { return 'rejected'; } }

export function AnalyticsConsent() {
  const consent = useSyncExternalStore(subscribe, getConsent, () => '');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const configured = analytics.enabled && analytics.legalReady && analytics.requireConsent && /^\d+$/.test(analytics.yandexMetrikaId);
  useEffect(() => {
    if (!configured || consent !== 'accepted' || document.getElementById('yandex-metrika')) return;
    // Disable URL query recording: UTM/other URL parameters are not sent by the counter.
    const id = Number(analytics.yandexMetrikaId);
    window.ym ??= Object.assign((...args: unknown[]) => { window.ym!.a!.push(args); }, { a: [] as unknown[][], l: Date.now() });
    const script = document.createElement('script');
    script.id = 'yandex-metrika'; script.async = true; script.src = 'https://mc.yandex.ru/metrika/tag.js';
    document.head.appendChild(script);
    window.ym(id, 'init', { defer: true, clickmap: false, trackLinks: false, accurateTrackBounce: false, webvisor: false });
    window.ym(id, 'hit', `${window.location.origin}${window.location.pathname}`);
  }, [configured, consent]);
  function save(value: 'accepted' | 'rejected') {
    try { localStorage.setItem('manic.analytics-consent', value); } catch { return; }
    if (value === 'rejected' && window.ym) window.ym(Number(analytics.yandexMetrikaId), 'destruct');
    consentListeners.forEach(listener => listener());
    setSettingsOpen(false);
    // After a prior acceptance, reload removes the loaded third-party script entirely.
    if (value === 'rejected' && consent === 'accepted') window.location.reload();
  }
  if (!configured) return null;
  return <>
    {consent && <button className="analytics-settings" onClick={() => setSettingsOpen(true)}>Настройки аналитики</button>}
    {(!consent || settingsOpen) && <aside className="consent-panel" aria-label="Согласие на аналитику"><div><strong>Помочь сделать сайт удобнее?</strong><p>С вашего согласия подключим Яндекс Метрику. Без согласия счётчик не загружается. <a href="/privacy/">Подробнее</a></p></div><div className="consent-actions"><button className="button button-primary" onClick={() => save('accepted')}>Разрешить</button><button className="button button-outline" onClick={() => save('rejected')}>Без аналитики</button></div></aside>}
  </>;
}
