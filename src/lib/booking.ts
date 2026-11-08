import type { BookingConfig, PortfolioWork, Service } from '../content/types';

export function isSafeUrl(value: string): boolean {
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password; }
  catch { return false; }
}

export function buildDesignLink(siteUrl: string, workId: string): string {
  return new URL(`/portfolio/${encodeURIComponent(workId)}/`, siteUrl).toString();
}

export function buildWishText(siteUrl: string, work?: PortfolioWork, service?: Service): string {
  return [
    'Здравствуйте! Хочу записаться на маникюр.',
    work && `Референс: «${work.title}»${work.demo ? ' (демонстрационный образец)' : ''}.`,
    service && `Услуга: ${service.title}${service.confirmed ? '' : ' (наличие нужно уточнить)'}.`,
    work && buildDesignLink(siteUrl, work.id),
    'Подскажите, пожалуйста, итоговую стоимость, длительность и доступное время.',
  ].filter(Boolean).join('\n');
}

export interface BookingProviderAdapter {
  label: string;
  getUrl: (utm?: Record<string, string>) => string | null;
  getTarget: (serviceId?: string, utm?: Record<string, string>) => BookingTarget | null;
}

export interface BookingTarget {
  widgetUrl: string | null;
  directUrl: string;
  servicePreset: boolean;
}

const dikidiHosts = new Set(['dikidi.net', 'dikidi.ru', 'dikidi.app']);
export function isDikidiUrl(value: string): boolean {
  return isSafeUrl(value) && dikidiHosts.has(new URL(value).hostname);
}

// Только формат ссылки из официального генератора, без сборки ID/параметров.
export function isDikidiWidgetUrl(value: string): boolean {
  if (!isDikidiUrl(value)) return false;
  const url = new URL(value);
  return url.pathname === '/' && (/^#widget=\d+$/.test(url.hash) || /^\d+$/.test(url.searchParams.get('widget') || ''));
}

export function isDikidiScriptUrl(value: string): boolean {
  if (!isDikidiUrl(value)) return false;
  const url = new URL(value);
  return url.pathname === '/assets/js/widget_record/widget2.min.js' && !url.search && !url.hash;
}

function withUtm(value: string, utm: Record<string, string>): string {
  const url = new URL(value);
  for (const [key, content] of Object.entries(utm)) {
    if (/^utm_(source|medium|campaign|content|term)$/.test(key)) url.searchParams.set(key, content.slice(0, 120));
  }
  return url.toString();
}

export function getBookingTarget(config: BookingConfig, serviceId?: string, utm: Record<string, string> = {}): BookingTarget | null {
  if (config.status !== 'ready') return null;
  const validDirect = config.provider === 'dikidi' ? isDikidiUrl : isSafeUrl;
  const variant = config.provider === 'dikidi' && serviceId ? config.dikidi?.serviceWidgets[serviceId] : undefined;
  const configuredWidget = config.provider === 'dikidi' && isDikidiScriptUrl(config.dikidi?.scriptUrl || '');
  const specificWidget = configuredWidget && isDikidiWidgetUrl(variant?.widgetUrl || '') ? variant!.widgetUrl : null;
  const widgetUrl = specificWidget || (configuredWidget && isDikidiWidgetUrl(config.dikidi?.widgetUrl || '') ? config.dikidi!.widgetUrl : null);
  const specificDirect = variant?.fallbackUrl && validDirect(variant.fallbackUrl) ? variant.fallbackUrl : null;
  // Для выбранного виджета его же ссылка сохраняет выбор при отказе скрипта.
  const direct = (specificWidget ? specificDirect || specificWidget : specificDirect)
    || [config.fallbackUrl, config.url].find(value => value && validDirect(value)) || widgetUrl;
  if (!direct) return null;
  return {
    widgetUrl,
    directUrl: isDikidiWidgetUrl(direct) ? direct : withUtm(direct, utm),
    servicePreset: Boolean(specificWidget || specificDirect),
  };
}

export function getBookingWarnings(config: BookingConfig): string[] {
  const warnings: string[] = [];
  if (config.status !== 'ready') warnings.push('Запись не активирована: заполните src/content/booking.ts и установите status: ready.');
  else if (!getBookingTarget(config)) warnings.push('Не задан безопасный адрес записи.');
  if (config.dikidi?.widgetUrl && !isDikidiWidgetUrl(config.dikidi.widgetUrl)) warnings.push('Нужен исходный href виджета, выданный DIKIDI Business.');
  if (config.dikidi?.widgetUrl && !isDikidiScriptUrl(config.dikidi.scriptUrl)) warnings.push('Проверьте официальный scriptUrl DIKIDI.');
  for (const [id, variant] of Object.entries(config.dikidi?.serviceWidgets || {})) {
    if (variant.widgetUrl && !isDikidiWidgetUrl(variant.widgetUrl)) warnings.push(`Некорректная ссылка виджета услуги: ${id}.`);
  }
  return warnings;
}

export function getBookingContact(config: BookingConfig, contacts: { phone: string; phoneLabel?: string; telegramUrl: string; vkUrl: string }): { href: string; label: string; kind: 'messenger' | 'phone' } | null {
  const messenger = [config.messengerUrl, contacts.telegramUrl, contacts.vkUrl].find(isSafeUrl);
  if (messenger) return { href: messenger, label: config.messengerLabel || 'Написать мастеру', kind: 'messenger' };
  return /^\+\d{10,15}$/.test(contacts.phone) ? { href: `tel:${contacts.phone}`, label: contacts.phoneLabel || 'Позвонить мастеру', kind: 'phone' } : null;
}

// Пожелания остаются у клиента. Сервису не передаются выдуманные параметры.
export function createBookingAdapter(config: BookingConfig): BookingProviderAdapter {
  return {
    label: { dikidi: 'DIKIDI', yclients: 'YCLIENTS', custom: 'сервис записи' }[config.provider],
    getUrl(utm = {}) {
      return getBookingTarget(config, undefined, utm)?.directUrl || null;
    },
    getTarget: (serviceId, utm) => getBookingTarget(config, serviceId, utm),
  };
}
