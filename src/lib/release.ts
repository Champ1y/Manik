import type { BookingConfig, Diploma, Location, PortfolioWork, Review } from '../content/types';
import { isSafeUrl } from './booking';

export interface ReleaseContent {
  studio: { demo: boolean; brand: string; masterName: string; biography: string; education: string; portrait: string; sanitation: string };
  seo: { siteUrl: string; legal: { operatorName: string; contactEmail: string; policyReviewed: boolean } };
  contacts: { phone: string };
  locations: Location[];
  booking: BookingConfig;
  portfolio: PortfolioWork[];
  diplomas: Diploma[];
  reviews: Review[];
  analytics: { enabled: boolean; yandexMetrikaId: string; legalReady: boolean; requireConsent: boolean };
}

export function releaseIssues(data: ReleaseContent): string[] {
  const issues: string[] = [];
  if (data.studio.demo) issues.push('Выключите studio.demo после заполнения реальных данных.');
  for (const key of ['brand', 'masterName', 'biography', 'education', 'portrait', 'sanitation'] as const) {
    if (!data.studio[key].trim()) issues.push(`Заполните studio.${key}.`);
  }
  if (!isSafeUrl(data.seo.siteUrl)) issues.push('Укажите реальный HTTPS-домен в seo.siteUrl.');
  if (!/^\+\d{10,15}$/.test(data.contacts.phone)) issues.push('Укажите реальный телефон в международном формате.');
  if (!data.locations.length) issues.push('Добавьте реальную локацию.');
  for (const location of data.locations) {
    if (!location.address || !location.hours) issues.push(`Укажите адрес и график: ${location.id}.`);
    if (!isSafeUrl(location.yandexMapsUrl) || !isSafeUrl(location.twoGisUrl)) issues.push(`Укажите ссылки маршрутов: ${location.id}.`);
  }
  if (!isSafeUrl(data.booking.url)) issues.push('Подключите HTTPS-ссылку на внешний сервис записи.');
  if (data.booking.messengerUrl && !isSafeUrl(data.booking.messengerUrl)) issues.push('Проверьте ссылку мессенджера.');
  if (!data.portfolio.some(work => !work.demo)) issues.push('Добавьте реальные работы в портфолио.');
  if (data.portfolio.some(work => work.demo)) issues.push('Удалите демонстрационные работы перед публичным запуском.');
  if (!data.diplomas.length) issues.push('Добавьте подтверждённые дипломы.');
  if (!data.seo.legal.operatorName || !data.seo.legal.contactEmail || !data.seo.legal.policyReviewed) issues.push('Заполните и проверьте политику обработки персональных данных.');
  if (data.analytics.enabled && (!/^\d+$/.test(data.analytics.yandexMetrikaId) || !data.analytics.legalReady || !data.analytics.requireConsent)) issues.push('Проверьте ID Метрики, правовые условия и согласие на аналитику.');
  for (const review of data.reviews) if (!isSafeUrl(review.sourceUrl)) issues.push(`Укажите источник отзыва: ${review.id}.`);
  return issues;
}
