import { build } from 'esbuild';
import { readFile } from 'node:fs/promises';
import { test, expect, visit, type NetworkStub } from '../fixtures/site';
import type { Page } from '@playwright/test';

const scriptUrl = 'https://dikidi.net/assets/js/widget_record/widget2.min.js';
let bundle: string;
let styles: string;
test.beforeAll(async () => {
  const result = await build({ entryPoints: ['tests/fixtures/booking-harness.tsx'], bundle: true, write: false, platform: 'browser', format: 'iife', jsx: 'automatic', define: { 'process.env.NODE_ENV': '"production"', 'process.env': '{}' } });
  bundle = result.outputFiles[0].text;
  const index = await readFile('out/index.html', 'utf8');
  styles = [...index.matchAll(/<link[^>]+rel="stylesheet"[^>]*>/g)].map(match => match[0]).join('');
});

async function harness(page: Page, preset: string) {
  await page.route('**/__qa/booking.js', route => route.fulfill({ contentType: 'text/javascript', body: bundle }));
  await page.route('**/__qa/booking/?*', route => route.fulfill({ contentType: 'text/html; charset=utf-8', body: `<!doctype html><html lang="ru"><head><title>Booking harness</title>${styles}</head><body><div id="root"></div><script src="/__qa/booking.js"></script></body></html>` }));
  await visit(page, `/__qa/booking/?preset=${preset}`);
}

// A local contract stub, NOT the real DIKIDI interface or a fake booking calendar.
const widgetStub = `document.documentElement.dataset.widgetScript = 'loaded';
document.addEventListener('click', event => {
  const link = event.target.closest('a');
  if (!link || !link.href.startsWith('https://dikidi.net/#widget=')) return;
  event.preventDefault();
  document.documentElement.dataset.widgetLink = link.href;
  const dialog = document.createElement('dialog');
  dialog.setAttribute('aria-label', 'Тестовая оболочка DIKIDI');
  const text = document.createElement('p'); text.textContent = 'Проверено открытие виджета. Бронирование не выполняется.';
  const close = document.createElement('button'); close.textContent = 'Закрыть тестовый виджет';
  close.onclick = () => { dialog.close(); dialog.remove(); link.focus(); };
  dialog.addEventListener('cancel', () => { dialog.remove(); link.focus(); });
  dialog.append(text, close); document.body.append(dialog); dialog.showModal();
});`;

test('official widget link opens without copy step, selects service, supports reopening', async ({ page, networkStubs, diagnostics }) => {
  networkStubs.set(scriptUrl, { body: widgetStub, contentType: 'text/javascript' });
  await harness(page, 'widget');
  await expect(page.locator('html')).toHaveAttribute('data-widget-script', 'loaded');
  const general = page.getByRole('button', { name: 'Записаться', exact: true });
  await expect(general).toHaveAttribute('href', 'https://dikidi.net/#widget=10001');
  await general.click();
  await expect(page.getByRole('dialog')).toHaveAttribute('aria-label', 'Тестовая оболочка DIKIDI');
  await expect(page.locator('html')).toHaveAttribute('data-widget-link', 'https://dikidi.net/#widget=10001');
  await page.getByRole('button', { name: 'Закрыть тестовый виджет' }).click();
  await page.getByRole('button', { name: 'Записаться на услугу', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-widget-link', 'https://dikidi.net/#widget=10002');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Записаться с дизайном', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-widget-link', 'https://dikidi.net/#widget=10002');
  expect(await page.evaluate(() => JSON.parse(sessionStorage.getItem('manic.reference')!).workId)).toBe('soft-nude');
  await page.keyboard.press('Escape');
  expect(diagnostics.mockedBooking.filter(url => url === scriptUrl)).toHaveLength(1);
  await expect(page.locator('.saved-reference')).toContainText('Тихая нежность');
});

test('failed widget script uses exact direct link without blocking the customer', async ({ page, networkStubs, diagnostics }) => {
  networkStubs.set(scriptUrl, { body: '', contentType: 'text/javascript', fail: true });
  await harness(page, 'widget');
  const general = page.getByRole('button', { name: 'Записаться', exact: true });
  await expect(general).toHaveAttribute('href', 'https://dikidi.ru/2199286');
  const pending = page.waitForEvent('popup');
  await general.click();
  const popup = await pending;
  await expect(popup).toHaveURL('https://dikidi.ru/2199286');
  await popup.close();
  expect(diagnostics.expectedFailures.length).toBeGreaterThan(0);
});

test('keyboard uses direct page without overwriting the official widget href', async ({ page, networkStubs }) => {
  networkStubs.set(scriptUrl, { body: widgetStub, contentType: 'text/javascript' });
  await harness(page, 'widget');
  await expect(page.locator('html')).toHaveAttribute('data-widget-script', 'loaded');
  const general = page.getByRole('button', { name: 'Записаться', exact: true });
  await expect(general).toHaveAttribute('href', 'https://dikidi.net/#widget=10001');
  const pending = page.waitForEvent('popup');
  await general.focus();
  await general.press('Enter');
  const popup = await pending;
  await expect(popup).toHaveURL('https://dikidi.ru/2199286');
  await popup.close();
  await expect(general).toHaveAttribute('href', 'https://dikidi.net/#widget=10001');
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('unconfigured and unsafe URLs show customer-facing fallback without technical instructions', async ({ page }) => {
  for (const preset of ['missing', 'invalid']) {
    await harness(page, preset);
    await page.getByRole('button', { name: 'Записаться', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Онлайн-запись', exact: true });
    await expect(dialog).toContainText('Сейчас онлайн-запись недоступна');
    await expect(dialog).not.toContainText('Подключите ссылку');
    await expect(dialog.locator('a[target="_blank"]')).toHaveCount(0);
    await expect(page.locator('#dikidi-booking-widget')).toHaveCount(0);
    await page.keyboard.press('Escape');
  }
});

test('unavailable service offers configured real contact, reference and optional copy on mobile', async ({ page, networkStubs }) => {
  networkStubs.set('https://t.me/manic_test_only', { body: '<h1>Контакт перехвачен локально</h1>', contentType: 'text/html' } satisfies NetworkStub);
  await page.setViewportSize({ width: 375, height: 812 });
  await harness(page, 'contact');
  await page.getByRole('button', { name: 'Записаться с дизайном', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.locator('.selected-reference')).toContainText('Тихая нежность');
  await expect(dialog.locator('.booking-service')).toContainText('Маникюр с гель-лаком');
  await expect(dialog.getByRole('link', { name: 'Написать мастеру' })).toHaveAttribute('href', 'https://t.me/manic_test_only');
  await expect(dialog.getByRole('button', { name: 'Скопировать пожелания' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Записаться с дизайном' })).toBeFocused();
});
