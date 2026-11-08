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
    service && `Услуга: ${service.title}.`,
    work && buildDesignLink(siteUrl, work.id),
    'Подскажите, пожалуйста, итоговую стоимость, длительность и доступное время.',
  ].filter(Boolean).join('\n');
}

export interface BookingProviderAdapter {
  label: string;
  getUrl: (utm?: Record<string, string>) => string | null;
}

// DIKIDI/YCLIENTS получают только свою ссылку. Пожелания не считаются переданными.
export function createBookingAdapter(config: BookingConfig): BookingProviderAdapter {
  return {
    label: { dikidi: 'DIKIDI', yclients: 'YCLIENTS', custom: 'сервис записи' }[config.provider],
    getUrl(utm = {}) {
      if (!isSafeUrl(config.url)) return null;
      const url = new URL(config.url);
      for (const [key, value] of Object.entries(utm)) {
        if (/^utm_(source|medium|campaign|content|term)$/.test(key)) url.searchParams.set(key, value.slice(0, 120));
      }
      return url.toString();
    },
  };
}
