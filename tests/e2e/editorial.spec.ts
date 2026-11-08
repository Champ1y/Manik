import { test, expect, visit, expectNoOverflow, openBookingPopup } from '../fixtures/site';

test('header becomes compact while scrolling and restores its entry state', async ({ page }) => {
  await visit(page);
  const header = page.locator('.site-header');
  await expect(header).not.toHaveClass(/is-compact/);
  await expect(page.locator('.header-inner')).toHaveCSS('min-height', '96px');
  await page.evaluate(() => window.scrollTo(0, 500));
  await expect(header).toHaveClass(/is-compact/);
  await expect(page.locator('.header-inner')).toHaveCSS('min-height', '72px');
  await expect.poll(async () => (await header.boundingBox())!.y).toBe(0);
  await openBookingPopup(page, header.getByRole('button', { name: 'Записаться', exact: true }));
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(header).not.toHaveClass(/is-compact/);
});

test('tablet header stays stable after filtering and returning to the top', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1000 });
  await visit(page, '/portfolio/');
  await page.evaluate(() => window.scrollTo(0, 140));
  await expect(page.locator('.site-header')).toHaveClass(/is-compact/);
  await page.getByRole('button', { name: 'Френч', exact: true }).click();
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(page.locator('.site-header')).not.toHaveClass(/is-compact/);
  const samples = await page.evaluate(async () => {
    const values = [];
    for (let frame = 0; frame < 30; frame++) {
      await new Promise(requestAnimationFrame);
      values.push({ y: window.scrollY, height: document.querySelector('.header-inner')!.getBoundingClientRect().height });
    }
    return values;
  });
  expect(samples.every(sample => sample.y === 0 && sample.height === 80)).toBe(true);
});

test('mobile menu locks scroll, keeps keyboard focus inside and closes with Escape', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await visit(page);
  const trigger = page.getByRole('button', { name: 'Открыть меню', exact: true });
  await trigger.click();
  const menu = page.getByRole('navigation', { name: 'Мобильная навигация' });
  await expect(menu).toBeVisible();
  await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
  await menu.getByRole('link').last().focus();
  await page.keyboard.press('Tab');
  expect(await page.evaluate(() => Boolean(document.activeElement?.closest('.site-header')))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(menu).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
  await trigger.click();
  await page.setViewportSize({ width: 1024, height: 1000 });
  await expect(menu).not.toBeVisible();
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
});

test('editorial layout fits all seven viewports with visible service actions and touch targets', async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  await visit(page);
  for (const width of [320, 375, 390, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(page.locator('.site-header')).not.toHaveClass(/is-compact/);
    await expectNoOverflow(page);
    if (width === 375 || width === 1440) await page.screenshot({ path: `.artifacts/ux-review/hero-${width}.png` });
    const columns = await page.locator('.portfolio-grid').first().evaluate(element => getComputedStyle(element).gridTemplateColumns.split(' ').length);
    expect(columns).toBe(width <= 600 ? 1 : width <= 1100 ? 2 : 3);
    const h1 = page.locator('.hero h1');
    expect(await h1.innerText()).toContain('вы — это вы.');
    const cardCount = await page.locator('#portfolio .work-card:visible').count();
    expect(cardCount).toBe(3); // Mobile must not hide the odd third item.
    for (const button of await page.locator('.service-row:visible .service-book').all()) {
      await expect(button).toHaveText(/Записаться/);
      expect((await button.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    }
    for (const button of await page.locator('.icon-button:visible').all()) expect((await button.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    await page.locator('.service-catalog > summary').click();
    await expectNoOverflow(page);
    if (width === 375 || width === 1440) {
      await page.locator('#services').scrollIntoViewIfNeeded();
      await page.screenshot({ path: `.artifacts/ux-review/services-${width}.png` });
    }
    await page.locator('.faq-list summary').first().click();
    await expectNoOverflow(page);
    expect((await page.locator('.faq-list summary').first().boundingBox())!.height).toBeGreaterThanOrEqual(56);
    await expect(page.locator('.abstract-map')).toHaveCount(0);
    await expect(page.locator('.location-placeholder')).toContainText('Точное расположение пока не указано');
    await expect(page.locator('.closing-inner').getByRole('link', { name: 'Подобрать маникюр' })).toHaveCount(0);
    await expect(page.locator('.hero').getByRole('link', { name: 'Посмотреть работы' })).toHaveAttribute('href', '/portfolio/');
    await testInfo.attach(`editorial-home-${width}`, { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
    await page.locator('.faq-list summary').first().click();
    await page.locator('.service-catalog > summary').click();
  }
});

test('portfolio whitespace opens the viewer while title links and booking stay independent', async ({ page }) => {
  await visit(page, '/portfolio/');
  const card = page.locator('.work-card').first();
  const box = (await card.boundingBox())!;
  await card.click({ position: { x: 6, y: box.height - 6 } });
  await expect(page.getByRole('dialog', { name: 'Тихая нежность', exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await openBookingPopup(page, card.getByRole('button', { name: 'Хочу такой маникюр: Тихая нежность', exact: true }));
  await card.getByRole('link', { name: 'Тихая нежность', exact: true }).click();
  await expect(page).toHaveURL(/\/portfolio\/soft-nude\/$/);
});
