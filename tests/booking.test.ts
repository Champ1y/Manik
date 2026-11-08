import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildDesignLink, buildWishText, createBookingAdapter, isSafeUrl } from '../src/lib/booking';
import { portfolio } from '../src/content/portfolio';
import { services } from '../src/content/services';
import type { BookingConfig } from '../src/content/types';

const config: BookingConfig = { provider: 'dikidi', url: 'https://dikidi.ru/example?lang=ru', messengerLabel: '', messengerUrl: '' };
test('each work receives a shareable static route', () => {
  assert.equal(buildDesignLink('https://example.ru', 'soft-nude'), 'https://example.ru/portfolio/soft-nude/');
  assert.equal(buildDesignLink('https://example.ru/', 'мой дизайн'), 'https://example.ru/portfolio/%D0%BC%D0%BE%D0%B9%20%D0%B4%D0%B8%D0%B7%D0%B0%D0%B9%D0%BD/');
});
test('wish text includes service, demo label, and reference URL', () => {
  const text = buildWishText('https://example.ru', portfolio[0], services[1]);
  assert.match(text, /Тихая нежность/);
  assert.match(text, /демонстрационный образец/);
  assert.match(text, /Маникюр с покрытием/);
  assert.match(text, /https:\/\/example.ru\/portfolio\/soft-nude\//);
  assert.doesNotMatch(text, /отправлено|подтверждено/);
});
test('missing booking configuration never generates a booking', () => {
  assert.equal(createBookingAdapter({ ...config, url: '' }).getUrl(), null);
  assert.equal(createBookingAdapter({ ...config, url: 'javascript:alert(1)' }).getUrl(), null);
});
test('adapter preserves provider query and whitelists UTM parameters', () => {
  const url = new URL(createBookingAdapter(config).getUrl({ utm_source: 'vk', utm_campaign: 'осень', phone: 'private', redirect: 'https://evil.example' })!);
  assert.equal(url.searchParams.get('lang'), 'ru');
  assert.equal(url.searchParams.get('utm_source'), 'vk');
  assert.equal(url.searchParams.get('utm_campaign'), 'осень');
  assert.equal(url.searchParams.has('phone'), false);
  assert.equal(url.searchParams.has('redirect'), false);
});
test('provider can be replaced without changing UI', () => {
  assert.equal(createBookingAdapter({ ...config, provider: 'yclients' }).label, 'YCLIENTS');
  assert.equal(createBookingAdapter({ ...config, provider: 'custom' }).label, 'сервис записи');
});
test('unsafe external protocols and credentials are rejected', () => {
  for (const value of ['', '/local', 'http://example.ru', 'data:text/plain,test', 'https://user:pass@example.ru']) assert.equal(isSafeUrl(value), false);
  assert.equal(isSafeUrl('https://t.me/example'), true);
});
