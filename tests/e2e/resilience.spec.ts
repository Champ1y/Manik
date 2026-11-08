import { test, expect, visit, denyClipboard, openBookingPopup } from '../fixtures/site';

test('denied clipboard exposes selectable wishes and share URL', async ({ page }) => {
  await denyClipboard(page);
  await visit(page, '/portfolio/soft-nude/');
  await openBookingPopup(page, page.getByRole('button', { name: 'Хочу такой маникюр', exact: true }));
  await page.locator('.reference-wishes > summary').click();
  await page.getByRole('button', { name: 'Скопировать пожелания' }).click();
  const wishes = page.getByRole('textbox', { name: 'Пожелания для ручного копирования' });
  await expect(wishes).toHaveValue(/Тихая нежность/);
  await expect(wishes).toHaveValue(/Маникюр с гель-лаком/);
  await expect(wishes).toHaveValue(/демонстрационный образец/);
  await expect(wishes).toHaveValue(/\/portfolio\/soft-nude\//);
  await wishes.focus();
  expect(await wishes.evaluate((element: HTMLTextAreaElement) => element.selectionEnd - element.selectionStart)).toBe((await wishes.inputValue()).length);
  await page.locator('.reference-wishes > summary').click();
  await page.getByRole('button', { name: 'Поделиться дизайном' }).click();
  const link = page.getByRole('textbox', { name: 'Ссылка для копирования' });
  await expect(link).toHaveValue('http://127.0.0.1:4175/portfolio/soft-nude/');
  await expect(link).toHaveAttribute('readonly', '');
  await page.locator('.site-footer').getByRole('button', { name: 'Поделиться сайтом' }).click();
  await expect(page.locator('.site-footer').getByRole('textbox')).toHaveValue('http://127.0.0.1:4175/');
});

test('clipboard success reports completed copy and writes exact data', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', { configurable: true, value: undefined });
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: {
      writeText: async (value: string) => { document.documentElement.dataset.copied = value; },
    } });
  });
  await visit(page, '/portfolio/soft-nude/');
  await page.getByRole('button', { name: 'Поделиться дизайном' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-copied', 'http://127.0.0.1:4175/portfolio/soft-nude/');
  await expect(page.locator('.work-detail-content [role="status"]')).toHaveText('Ссылка скопирована');
  await openBookingPopup(page, page.getByRole('button', { name: 'Хочу такой маникюр', exact: true }));
  await page.locator('.reference-wishes > summary').click();
  await page.getByRole('button', { name: 'Скопировать пожелания' }).click();
  await expect(page.locator('.reference-wishes').getByRole('status')).toHaveText('Пожелания скопированы');
  await expect(page.locator('html')).toHaveAttribute('data-copied', /Референс: «Тихая нежность»/);
});

for (const outcome of ['success', 'cancel', 'failure'] as const) {
  test(`Web Share ${outcome} handles result without false copy confirmation`, async ({ page }) => {
    await page.addInitScript(result => {
      Object.defineProperty(navigator, 'share', { configurable: true, value: async (data: ShareData) => {
        document.documentElement.dataset.shared = JSON.stringify(data);
        if (result === 'cancel') throw new DOMException('Cancelled', 'AbortError');
        if (result === 'failure') throw new Error('Share unavailable');
      } });
    }, outcome);
    await visit(page, '/portfolio/soft-nude/');
    await page.getByRole('button', { name: 'Поделиться дизайном' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-shared', JSON.stringify({ title: 'Тихая нежность', url: 'http://127.0.0.1:4175/portfolio/soft-nude/' }));
    const status = page.locator('.work-detail-content [role="status"]');
    if (outcome === 'success') await expect(status).toHaveText('Открыто меню отправки');
    if (outcome === 'cancel') {
      await expect(status).toBeEmpty();
      await expect(page.getByRole('textbox')).toHaveCount(0);
    }
    if (outcome === 'failure') await expect(page.getByRole('textbox', { name: 'Ссылка для копирования' })).toHaveValue(/\/portfolio\/soft-nude\/$/);
  });
}

test('blocked browser storage keeps selection during client navigation', async ({ page }) => {
  await page.addInitScript(() => {
    for (const key of ['sessionStorage', 'localStorage']) Object.defineProperty(window, key, { configurable: true, get() { throw new DOMException('Denied', 'SecurityError'); } });
  });
  await visit(page, '/portfolio/soft-nude/');
  await openBookingPopup(page, page.getByRole('button', { name: 'Хочу такой маникюр', exact: true }));
  await page.getByRole('link', { name: '← Ко всем дизайнам' }).click();
  await expect(page.locator('.saved-reference')).toContainText('Тихая нежность');
  await openBookingPopup(page, page.locator('.saved-reference').getByRole('button', { name: 'К записи' }));
  await page.reload();
  await expect(page.locator('.saved-reference')).toHaveCount(0);
});

for (const stored of ['{broken', 'null', '42', '{"workId":"missing","serviceId":"missing"}']) {
  test(`invalid session selection is ignored: ${stored}`, async ({ page }) => {
    await page.addInitScript(value => sessionStorage.setItem('manic.reference', value), stored);
    await visit(page);
    await expect(page.locator('.saved-reference')).toHaveCount(0);
    await openBookingPopup(page, page.locator('.header-actions').getByRole('button', { name: 'Записаться', exact: true }));
    await expect(page.locator('.saved-reference')).toHaveCount(0);
  });
}

test('selection is isolated between independent browser contexts', async ({ page, browser, baseURL }) => {
  await visit(page, '/portfolio/soft-nude/');
  await openBookingPopup(page, page.getByRole('button', { name: 'Хочу такой маникюр', exact: true }));
  const other = await browser.newContext({ baseURL });
  try {
    const otherPage = await other.newPage();
    await visit(otherPage, '/portfolio/');
    await expect(otherPage.locator('.saved-reference')).toHaveCount(0);
    await expect(page.locator('.saved-reference')).toContainText('Тихая нежность');
  } finally { await other.close(); }
});

test('rapid repeated booking clicks open one outbound page', async ({ page, diagnostics }) => {
  await visit(page);
  const pending = page.waitForEvent('popup');
  await page.locator('.header-actions [role="button"]').evaluate((button: HTMLAnchorElement) => { button.click(); button.click(); });
  const popup = await pending;
  await expect(popup.getByRole('heading')).toHaveText('Переход в DIKIDI перехвачен тестом');
  await popup.close();
  expect(diagnostics.mockedBooking).toHaveLength(1);
  await expect(page.getByRole('dialog')).toHaveCount(0);
});
