import { test as base, expect, type Page, type Locator } from '@playwright/test';
import { booking } from '../../src/content/booking';

export type NetworkStub = { body: string; contentType: string; fail?: boolean };
type Diagnostics = { errors: string[]; console: string[]; failedRequests: string[]; httpErrors: string[]; external: string[]; mockedBooking: string[]; expectedFailures: string[] };

export const test = base.extend<{ diagnostics: Diagnostics; networkStubs: Map<string, NetworkStub> }>({
  networkStubs: async ({}, provide) => { await provide(new Map()); },
  diagnostics: [async ({ page, baseURL, networkStubs }, use, testInfo) => {
    const diagnostics: Diagnostics = { errors: [], console: [], failedRequests: [], httpErrors: [], external: [], mockedBooking: [], expectedFailures: [] };
    // Block external traffic, including popups. Tests cannot contact live booking providers.
    const localOrigin = new URL(baseURL!).origin;
    await page.context().route(url => /^https?:$/.test(url.protocol) && url.origin !== localOrigin, async route => {
      const stub = networkStubs.get(route.request().url());
      if (stub) {
        diagnostics.mockedBooking.push(route.request().url());
        if (stub.fail) await route.abort('blockedbyclient');
        else await route.fulfill({ contentType: stub.contentType, body: stub.body });
        return;
      }
      // This one exact destination is fulfilled locally, NEVER sent to DIKIDI.
      if (route.request().isNavigationRequest() && route.request().url() === booking.url) {
        diagnostics.mockedBooking.push(route.request().url());
        await route.fulfill({ contentType: 'text/html; charset=utf-8', body: '<!doctype html><html lang="ru"><title>Проверка перехода</title><h1>Переход в DIKIDI перехвачен тестом</h1><p>Бронирование не выполняется.</p></html>' });
        return;
      }
      diagnostics.external.push(route.request().url());
      await route.abort('blockedbyclient');
    });
    page.on('pageerror', error => diagnostics.errors.push(error.message));
    page.on('console', message => {
      if (message.type() !== 'error') return;
      if (networkStubs.get(message.location().url)?.fail) diagnostics.expectedFailures.push(message.text());
      else diagnostics.console.push(message.text());
    });
    page.on('requestfailed', request => {
      if (networkStubs.get(request.url())?.fail) { diagnostics.expectedFailures.push(`${request.url()} ${request.failure()?.errorText}`); return; }
      // Navigation may legitimately cancel prefetched RSC or document requests.
      if (!/ERR_ABORTED|NS_BINDING_ABORTED|cancelled|canceled/i.test(request.failure()?.errorText || ''))
        diagnostics.failedRequests.push(`${request.method()} ${request.url()} ${request.failure()?.errorText}`);
    });
    page.on('response', response => { if (response.status() >= 400) diagnostics.httpErrors.push(`${response.status()} ${response.url()}`); });
    await use(diagnostics);
    await testInfo.attach('browser-diagnostics', { body: JSON.stringify(diagnostics, null, 2), contentType: 'application/json' });
    expect(diagnostics.errors, 'Uncaught JavaScript exceptions').toEqual([]);
    expect(diagnostics.console, 'Browser console errors').toEqual([]);
    expect(diagnostics.failedRequests, 'Failed network requests').toEqual([]);
    expect(diagnostics.httpErrors, 'Unexpected HTTP errors').toEqual([]);
    expect(diagnostics.external, 'Unexpected external traffic').toEqual([]);
  }, { auto: true }],
});

export { expect };

export async function openBookingPopup(page: Page, trigger: Locator) {
  const pending = page.waitForEvent('popup');
  await trigger.click();
  const popup = await pending;
  await expect(popup).toHaveURL(booking.url);
  await expect(popup.getByRole('heading')).toHaveText('Переход в DIKIDI перехвачен тестом');
  await popup.close();
  await expect(page.getByRole('dialog', { name: 'Онлайн-запись', exact: true })).toHaveCount(0);
}

export async function visit(page: Page, path = '/') {
  const response = await page.goto(path);
  if (response) expect(response.status(), path).toBe(200);
  // Same-document anchor navigation correctly has no HTTP response.
  else await expect(page).toHaveURL(new URL(path, page.url()).href);
  // Next/React can retain hidden route trees during navigation.
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
}

export async function completeQuiz(page: Page, answers = ['Натуральный и спокойный', 'Короткие', 'Нюдовые']) {
  for (let step = 0; step < answers.length; step++) {
    await page.getByRole('button', { name: new RegExp(answers[step]) }).click();
    await page.getByRole('button', { name: step === 2 ? 'Посмотреть подборку' : 'Продолжить', exact: true }).click();
  }
}

export async function expectNoOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth }));
  expect(dimensions.document, JSON.stringify(dimensions)).toBeLessThanOrEqual(dimensions.viewport);
}

export async function denyClipboard(page: Page) {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', { configurable: true, value: undefined });
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async () => { throw new Error('Clipboard denied by test'); } } });
  });
}
