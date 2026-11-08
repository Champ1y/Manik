import { test, expect, visit, openBookingPopup } from '../fixtures/site';
import { portfolio } from '../../src/content/portfolio';

const routes = ['/', '/portfolio/', '/quiz/', '/privacy/', ...portfolio.map(work => `/portfolio/${work.id}/`)];

test('all routes expose valid links, images, semantics and inventory', async ({ page, request }, testInfo) => {
  test.setTimeout(60_000);
  const inventory: Record<string, unknown> = {};
  const hrefs = new Set<string>();
  for (const route of routes) {
    await visit(page, route);
    await expect(page.getByRole('main')).toHaveCount(1);
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
    inventory[route] = await page.locator('a, button, summary, input, textarea').evaluateAll(elements => elements.map(element => ({
      tag: element.tagName.toLowerCase(), name: element.getAttribute('aria-label') || element.textContent?.trim(),
      href: element.getAttribute('href'), disabled: element.hasAttribute('disabled'),
    })));
    for (const href of await page.locator('a[href]').evaluateAll(elements => elements.map(element => element.getAttribute('href')!))) {
      expect(href).not.toMatch(/^(javascript:|http:\/\/[^1]|#?$)/);
      if (href.startsWith('/')) hrefs.add(href);
    }
    expect(await page.locator('img').evaluateAll(images => images.filter(image => image instanceof HTMLImageElement && image.complete && image.naturalWidth === 0).map(image => image.getAttribute('src')))).toEqual([]);
    for (const link of await page.locator('a[target="_blank"]').all()) await expect(link).toHaveAttribute('rel', /noopener/);
  }
  for (const href of hrefs) {
    expect((await request.get(href.split('#')[0] || '/')).status(), href).toBe(200);
    if (href.includes('#')) {
      await visit(page, href);
      await expect(page.locator(`[id="${href.split('#')[1]}"]`)).toHaveCount(1);
    }
  }
  await testInfo.attach('interactive-inventory', { body: JSON.stringify(inventory, null, 2), contentType: 'application/json' });
});

test('desktop navigation, mobile bottom bar and breadcrumbs reach their targets', async ({ page }) => {
  await visit(page);
  for (const [name, url] of [['Услуги и цены', '/#services'], ['О мастере', '/#about'], ['Контакты', '/#contacts'], ['Портфолио', '/portfolio/']]) {
    await page.getByRole('navigation', { name: 'Основная навигация' }).getByRole('link', { name, exact: true }).click();
    await expect(page).toHaveURL(`http://127.0.0.1:4175${url}`);
  }
  await page.getByRole('link', { name: 'Главная / Портфолио' }).click();
  await expect(page).toHaveURL('http://127.0.0.1:4175/');
  await page.setViewportSize({ width: 375, height: 812 });
  await page.locator('.mobile-booking').getByRole('link', { name: 'Подобрать' }).click();
  await expect(page).toHaveURL(/\/quiz\/$/);
  await page.getByRole('link', { name: 'Главная / Подбор маникюра' }).click();
  await openBookingPopup(page, page.locator('.mobile-booking').getByRole('button', { name: 'Записаться', exact: true }));
});

test('static metadata, noindex guard and 404 recovery are served correctly', async ({ page, request }) => {
  expect(await (await request.get('/robots.txt')).text()).toMatch(/Disallow: \//);
  expect(await (await request.get('/sitemap.xml')).text()).not.toContain('<loc>');
  expect((await request.get('/missing-qa-page/')).status()).toBe(404);
  expect((await request.get('/portfolio/not-a-design/')).status()).toBe(404);
  await visit(page, '/404.html');
  await page.getByRole('link', { name: 'Посмотреть дизайны' }).click();
  await expect(page).toHaveURL(/\/portfolio\/$/);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /\/og.png$/);
  expect((await request.get('/og.png')).headers()['content-type']).toContain('image/png');
});
