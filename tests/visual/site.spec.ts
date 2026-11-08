import { test, expect, visit, completeQuiz, denyClipboard, expectNoOverflow, openBookingPopup } from '../fixtures/site';
import type { Locator, Page } from '@playwright/test';

async function pageSnapshot(page: Page, name: string) {
  // Sticky elements otherwise appear halfway down a full-page capture after an action scrolls.
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(page.locator('.site-header')).not.toHaveClass(/is-compact/);
  await expect(page).toHaveScreenshot(name, { fullPage: true });
}

async function elementSnapshot(page: Page, element: Locator, name: string) {
  // Let React settle the compact header before clipping an element. Otherwise
  // scrollIntoView and the header resize can change subpixel capture coordinates.
  await element.scrollIntoViewIfNeeded();
  await page.evaluate(async () => {
    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);
  });
  await element.scrollIntoViewIfNeeded();
  await expect(element).toHaveScreenshot(name);
}

for (const width of [320, 375, 390, 768, 1024, 1440, 1920]) {
  test(`pages and states at ${width}px ${[375, 768, 1440].includes(width) ? '@visual-quick' : ''}`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width, height: 1000 });
    await denyClipboard(page);
    // No date-dependent product UI exists. Freeze time for future additions as well.
    await page.clock.setFixedTime(new Date('2026-11-08T12:00:00+03:00'));
    for (const [name, route] of Object.entries({ portfolio: '/portfolio/', privacy: '/privacy/', missing: '/404.html' })) {
      await visit(page, route);
      await expectNoOverflow(page);
      await pageSnapshot(page, `${name}-${width}.png`);
    }
    await visit(page, '/portfolio/');
    await page.getByRole('button', { name: 'Френч', exact: true }).click();
    await pageSnapshot(page, `filter-${width}.png`);
    await visit(page, '/quiz/');
    await page.getByRole('button', { name: /Натуральный и спокойный/ }).focus();
    await pageSnapshot(page, `quiz-focus-disabled-${width}.png`);
    await page.getByRole('button', { name: /Натуральный и спокойный/ }).hover();
    await elementSnapshot(page, page.locator('.quiz-panel'), `quiz-hover-${width}.png`);
    await completeQuiz(page);
    await expectNoOverflow(page);
    await pageSnapshot(page, `quiz-result-${width}.png`);
  });

  // Keep booking states separate so later booking-only changes stay scoped.
  test(`booking updates at ${width}px ${[375, 768, 1440].includes(width) ? '@visual-quick' : ''}`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width, height: 1000 });
    await denyClipboard(page);
    await page.clock.setFixedTime(new Date('2026-11-08T12:00:00+03:00'));
    for (const [name, route] of Object.entries({ home: '/', work: '/portfolio/soft-nude/' })) {
      await visit(page, route);
      await expectNoOverflow(page);
      await pageSnapshot(page, `${name}-${width}.png`);
    }
    await visit(page, '/portfolio/');
    await page.getByRole('button', { name: /Рассмотреть дизайн «Новая классика»/ }).click();
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(page.locator('.site-header')).not.toHaveClass(/is-compact/);
    await elementSnapshot(page, page.getByRole('dialog'), `viewer-${width}.png`);
    await page.keyboard.press('Escape');
    await visit(page, '/quiz/');
    await completeQuiz(page);
    await openBookingPopup(page, page.getByRole('button', { name: /Хочу такой маникюр: Тихая нежность/ }));
    await page.locator('.reference-wishes > summary').click();
    await page.getByRole('button', { name: 'Скопировать пожелания' }).click();
    await expectNoOverflow(page);
    await elementSnapshot(page, page.locator('.saved-reference'), `booking-reference-wishes-${width}.png`);
    await page.locator('.reference-wishes > summary').click();
    await page.getByRole('button', { name: 'Пройти ещё раз' }).click();
    await completeQuiz(page, ['Натуральный и спокойный', 'Длинные', 'Яркие']);
    await expectNoOverflow(page);
    await pageSnapshot(page, `quiz-empty-${width}.png`);
    if (width <= 768) {
      await visit(page);
      await page.getByRole('button', { name: 'Открыть меню', exact: true }).click();
      await pageSnapshot(page, `menu-${width}.png`);
    }
  });
}
