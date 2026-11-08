import { analytics } from '../content/seo';

export type AnalyticsEvent = 'booking_click' | 'booking_outbound' | 'booking_widget_click' | 'quiz_start' | 'quiz_complete' | 'work_select' | 'contacts_click' | 'route_open' | 'messenger_outbound' | 'repeat_booking_click' | 'share_click';

declare global {
  interface Window {
    ym?: ((id: number, method: string, ...args: unknown[]) => void) & { a?: unknown[][]; l?: number };
  }
}

export function track(event: AnalyticsEvent, params: Record<string, string> = {}) {
  if (typeof window === 'undefined' || !analytics.enabled || !analytics.legalReady) return;
  try { if (localStorage.getItem('manic.analytics-consent') !== 'accepted') return; }
  catch { return; }
  if (/^\d+$/.test(analytics.yandexMetrikaId)) window.ym?.(Number(analytics.yandexMetrikaId), 'reachGoal', event, params);
}

let capturedUtm: Record<string, string> = {};
// UTM остаются в памяти вкладки и сохраняются при клиентской навигации.
export function readUtm(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  const current = Object.fromEntries(['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']
    .flatMap(key => params.has(key) ? [[key, params.get(key)!.slice(0, 120)]] : []));
  capturedUtm = { ...capturedUtm, ...current };
  return { ...capturedUtm };
}
