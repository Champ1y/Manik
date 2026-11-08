import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildDesignLink, buildWishText, createBookingAdapter, getBookingContact, getBookingTarget, getBookingWarnings, isDikidiScriptUrl, isDikidiUrl, isDikidiWidgetUrl, isSafeUrl } from '../src/lib/booking';
import { portfolio } from '../src/content/portfolio';
import { services } from '../src/content/services';
import type { BookingConfig } from '../src/content/types';

const config: BookingConfig = { provider: 'dikidi', status: 'ready', url: 'https://dikidi.ru/example?lang=ru', messengerLabel: '', messengerUrl: '' };
test('each work receives a shareable static route', () => {
  assert.equal(buildDesignLink('https://example.ru', 'soft-nude'), 'https://example.ru/portfolio/soft-nude/');
  assert.equal(buildDesignLink('https://example.ru/', 'мой дизайн'), 'https://example.ru/portfolio/%D0%BC%D0%BE%D0%B9%20%D0%B4%D0%B8%D0%B7%D0%B0%D0%B9%D0%BD/');
});
test('wish text includes service, demo label, and reference URL', () => {
  const text = buildWishText('https://example.ru', portfolio[0], services[1]);
  assert.match(text, /Тихая нежность/);
  assert.match(text, /демонстрационный образец/);
  assert.match(text, /Маникюр с гель-лаком/);
  assert.match(text, /https:\/\/example.ru\/portfolio\/soft-nude\//);
  assert.doesNotMatch(text, /отправлено|подтверждено/);
});

const widgetConfig: BookingConfig = { ...config, dikidi: {
  scriptUrl: 'https://dikidi.net/assets/js/widget_record/widget2.min.js',
  widgetUrl: 'https://dikidi.net/#widget=10001',
  serviceWidgets: { gel: { widgetUrl: 'https://dikidi.net/#widget=10002', serviceId: 'test-service', staffId: 'test-staff' } },
} };
test('general DIKIDI booking uses the exact supplied profile with no invented parameters', () => {
  assert.deepEqual(getBookingTarget({ ...config, url: 'https://dikidi.ru/2199286' }), { directUrl: 'https://dikidi.ru/2199286', widgetUrl: null, servicePreset: false });
});
test('official service widget is selected by site service id and never constructed from provider ids', () => {
  const target = getBookingTarget(widgetConfig, 'gel', { utm_source: 'vk' });
  assert.equal(target?.widgetUrl, 'https://dikidi.net/#widget=10002');
  assert.equal(target?.directUrl, target?.widgetUrl);
  assert.equal(target?.servicePreset, true);
  assert.doesNotMatch(target!.directUrl, /test-service|test-staff|utm_|reference|workId/);
});
test('unmapped service falls back to general widget without claiming a preset', () => {
  const target = getBookingTarget(widgetConfig, 'unmapped');
  assert.equal(target?.widgetUrl, widgetConfig.dikidi!.widgetUrl);
  assert.equal(target?.servicePreset, false);
});
test('paused and unconfigured booking never opens a stale configured URL', () => {
  for (const status of ['paused', 'not_configured'] as const) assert.equal(getBookingTarget({ ...widgetConfig, status }, 'gel'), null);
});
test('script and widget validation reject lookalike domains and unsafe snippets', () => {
  assert.equal(isDikidiWidgetUrl(widgetConfig.dikidi!.widgetUrl), true);
  for (const url of ['https://dikidi.net.evil.example/#widget=1', 'https://evil.example/dikidi.net/#widget=1', 'javascript:alert(1)', 'https://dikidi.net/#widget=wrong', '<script>alert(1)</script>']) assert.equal(isDikidiWidgetUrl(url), false);
  assert.equal(isDikidiScriptUrl(widgetConfig.dikidi!.scriptUrl), true);
  assert.equal(isDikidiScriptUrl('https://dikidi.net/assets/js/widget_record/widget2.min.js?custom=1'), false);
  assert.equal(isDikidiUrl('https://dikidi.net.evil.example'), false);
});
test('invalid widget configuration degrades to safe direct booking and emits developer warnings', () => {
  const invalid = { ...widgetConfig, dikidi: { ...widgetConfig.dikidi!, scriptUrl: 'https://evil.example/widget.js' } };
  assert.equal(getBookingTarget(invalid)?.widgetUrl, null);
  assert.equal(getBookingTarget(invalid)?.directUrl, config.url);
  assert.ok(getBookingWarnings(invalid).some(warning => warning.includes('scriptUrl')));
});
test('changing provider ignores DIKIDI service variants', () => {
  assert.equal(getBookingTarget({ ...widgetConfig, provider: 'yclients', url: 'https://example.ru/booking' }, 'gel')?.widgetUrl, null);
  assert.equal(getBookingTarget({ ...widgetConfig, provider: 'yclients', url: 'https://example.ru/booking' }, 'gel')?.servicePreset, false);
});
test('unavailable booking chooses real messenger or telephone without inventing contacts', () => {
  const empty = { phone: '', telegramUrl: '', vkUrl: '' };
  assert.equal(getBookingContact(config, empty), null);
  assert.equal(getBookingContact({ ...config, messengerUrl: 'javascript:alert(1)' }, empty), null);
  assert.equal(getBookingContact(config, { ...empty, phone: '+79999999999' })?.href, 'tel:+79999999999');
  assert.equal(getBookingContact(config, { ...empty, telegramUrl: 'https://t.me/test' })?.href, 'https://t.me/test');
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

test('all providers preserve the configured destination and existing parameters', () => {
  for (const provider of ['dikidi', 'yclients', 'custom'] as const) {
    const url = new URL(createBookingAdapter({ ...config, provider }).getUrl({ utm_source: 'x'.repeat(130), utm_term: 'тест & нюд', client_name: 'private' })!);
    assert.equal(url.origin, 'https://dikidi.ru');
    assert.equal(url.pathname, '/example');
    assert.equal(url.searchParams.get('lang'), 'ru');
    assert.equal(url.searchParams.get('utm_source')?.length, 120);
    assert.equal(url.searchParams.get('utm_term'), 'тест & нюд');
    assert.equal(url.searchParams.has('client_name'), false);
  }
});

test('wishes without a reference or service do not invent price, time or confirmation', () => {
  const text = buildWishText('https://example.invalid');
  assert.doesNotMatch(text, /Референс:|Услуга:|undefined|подтвержден|₽|\d{2}:\d{2}/);
  assert.match(text, /доступное время/);
  assert.doesNotMatch(buildWishText('https://example.invalid', { ...portfolio[0], demo: false }), /демонстрационный/);
});
