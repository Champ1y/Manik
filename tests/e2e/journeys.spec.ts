import { test, expect, visit, completeQuiz, expectNoOverflow, openBookingPopup } from '../fixtures/site';
import { services } from '../../src/content/services';
import { faq } from '../../src/content/studio';
import { portfolio, categories } from '../../src/content/portfolio';
import { formatDuration, formatPrice } from '../../src/lib/portfolio';

test('mobile visitor selects a reference and reaches honest booking @smoke', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await visit(page);
  await expect(page.locator('.demo-bar')).toContainText('Демонстрационная версия');
  await page.getByRole('button', { name: 'Открыть меню', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Закрыть меню' })).toHaveAttribute('aria-expanded', 'true');
  await page.getByRole('navigation', { name: 'Мобильная навигация' }).getByRole('link', { name: 'Портфолио', exact: true }).click();
  await expect(page).toHaveURL(/\/portfolio\/$/);
  await expect(page.getByRole('navigation', { name: 'Мобильная навигация' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Френч', exact: true }).click();
  await expect(page.locator('.work-card')).toHaveCount(1);
  await page.getByRole('button', { name: /Рассмотреть дизайн «Новая классика»/ }).click();
  await openBookingPopup(page, page.getByRole('dialog').getByRole('button', { name: 'Хочу такой маникюр', exact: true }));
  await expect(page.locator('.saved-reference')).toContainText('Новая классика');
  expect(await page.evaluate(() => JSON.parse(sessionStorage.getItem('manic.reference')!).workId)).toBe('milky-french');
  await expectNoOverflow(page);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('.saved-reference')).toContainText('Новая классика');
});

test('quiz validates steps, preserves answers, matches, and restarts @smoke', async ({ page }) => {
  await visit(page, '/quiz/');
  await expect(page.getByRole('button', { name: 'Назад', exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Продолжить', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: /Натуральный и спокойный/ }).click();
  await page.getByRole('button', { name: 'Продолжить', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Какая длина — ваша?' })).toBeFocused();
  await page.getByRole('button', { name: /Короткие/ }).click();
  await page.getByRole('button', { name: 'Назад', exact: true }).click();
  await expect(page.getByRole('button', { name: /Натуральный и спокойный/ })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Продолжить', exact: true }).click();
  await expect(page.getByRole('button', { name: /Короткие/ })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Продолжить', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Посмотреть подборку' })).toBeDisabled();
  await page.getByRole('button', { name: /Нюдовые/ }).click();
  await page.getByRole('button', { name: 'Посмотреть подборку' }).click();
  await expect(page.locator('.quiz-result .work-card h3')).toHaveText(['Тихая нежность', 'Между линий']);
  await openBookingPopup(page, page.getByRole('button', { name: /Хочу такой маникюр: Тихая нежность/ }));
  await expect(page.locator('.saved-reference')).toContainText('Тихая нежность');
  await page.getByRole('button', { name: 'Пройти ещё раз' }).click();
  await expect(page.getByRole('button', { name: 'Продолжить', exact: true })).toBeDisabled();
  await expect(page.locator('.quiz-option[aria-pressed="true"]')).toHaveCount(0);
});

test('services show missing prices honestly and each booking selects its service @smoke', async ({ page }) => {
  test.setTimeout(60_000);
  await visit(page, '/#services');
  await expect(page.locator('.service-availability')).toContainText('Предварительный перечень');
  await page.locator('.service-catalog > summary').click();
  for (const service of services) {
    const row = page.locator('.service-row').filter({ has: page.getByRole('heading', { name: service.title, exact: true }) });
    await expect(row.locator('.service-price strong')).toHaveText(formatPrice(service.price));
    await expect(row.locator('.service-price > span')).toHaveText(formatDuration(service.durationMinutes));
    await row.locator('summary').click();
    await expect(row.locator('details')).toHaveAttribute('open', '');
    await expect(row.locator('details')).toContainText(service.includes);
    await expect(row.locator('details')).toContainText(service.extra);
    await openBookingPopup(page, row.getByRole('button', { name: `Записаться: ${service.title}`, exact: true }));
    expect(await page.evaluate(() => JSON.parse(sessionStorage.getItem('manic.reference')!).serviceId)).toBe(service.id);
    await row.locator('summary').click();
    await expect(row.locator('details')).not.toHaveAttribute('open');
  }
});

test('reference survives navigation and reload and can be removed @smoke', async ({ page }) => {
  async function reload() {
    // This scenario verifies storage after a completed navigation. The separate
    // stress command deliberately reloads during pending prefetch instead.
    if (process.env.QA_RELOAD_DURING_PREFETCH !== '1') {
      // networkidle may still refer to the previous document after a client-side
      // navigation. Wait for the rendered route and its fonts before reloading.
      await page.evaluate(() => document.fonts.ready);
      await page.waitForLoadState('networkidle');
    }
    await page.reload();
    await page.evaluate(() => document.fonts.ready);
  }
  await visit(page, '/portfolio/soft-nude/');
  await openBookingPopup(page, page.getByRole('button', { name: 'Хочу такой маникюр', exact: true }));
  await page.getByRole('link', { name: '← Ко всем дизайнам' }).click();
  await expect(page).toHaveURL(/\/portfolio\/$/);
  if (process.env.QA_RELOAD_DURING_PREFETCH !== '1') {
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Найдите своё');
  }
  await reload();
  await expect(page.locator('.saved-reference')).toContainText('Тихая нежность');
  await openBookingPopup(page, page.locator('.saved-reference').getByRole('button', { name: 'К записи' }));
  await page.getByRole('button', { name: 'Убрать выбранный дизайн', exact: true }).click();
  await expect(page.locator('.saved-reference')).toHaveCount(0);
  await reload();
  await expect(page.locator('.saved-reference')).toHaveCount(0);
});

test('keyboard opens a viewer, traps focus, closes with Escape and restores trigger @smoke', async ({ page, browserName }, testInfo) => {
  await visit(page);
  if (browserName === 'webkit') {
    // This Windows WebKit build tabs through buttons but skips all links by default.
    // Still verify skip-link activation and the modal keyboard behavior below.
    testInfo.annotations.push({ type: 'environment', description: 'Windows WebKit default Tab skips links; skip-link receives explicit focus. Natural first-Tab is checked in Chromium and Firefox.' });
    await page.getByRole('link', { name: 'Перейти к содержимому' }).focus();
  } else await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Перейти к содержимому' })).toBeFocused();
  await expect(page.getByRole('link', { name: 'Перейти к содержимому' })).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#main$/);
  const trigger = page.getByRole('button', { name: /Рассмотреть дизайн «Тихая нежность»/ });
  await trigger.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
  for (let index = 0; index < 8; index++) {
    await page.keyboard.press('Tab');
    expect(await page.evaluate(() => document.activeElement === document.body || !!document.activeElement?.closest('dialog'))).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
});

test('every home booking CTA and mobile menu link performs its action', async ({ page }) => {
  await visit(page);
  for (const button of await page.locator('main').getByRole('button', { name: 'Записаться', exact: true }).all()) {
    await openBookingPopup(page, button);
  }
  await page.setViewportSize({ width: 375, height: 812 });
  for (const [name, path] of [['Портфолио', '/portfolio/'], ['Услуги и цены', '/#services'], ['О мастере', '/#about'], ['Контакты', '/#contacts'], ['Подобрать маникюр', '/quiz/']]) {
    await page.getByRole('button', { name: 'Открыть меню', exact: true }).click();
    await page.getByRole('navigation', { name: 'Мобильная навигация' }).getByRole('link', { name, exact: true }).click();
    await expect(page).toHaveURL(`http://127.0.0.1:4175${path}`);
    await expect(page.getByRole('navigation', { name: 'Мобильная навигация' })).toHaveCount(0);
  }
  await page.getByRole('button', { name: 'Открыть меню', exact: true }).click();
  await page.getByRole('button', { name: 'Закрыть меню', exact: true }).click();
  await expect(page.getByRole('navigation', { name: 'Мобильная навигация' })).toHaveCount(0);
});

test('every category filters exact works, including home limit', async ({ page }) => {
  for (const route of ['/', '/portfolio/']) {
    await visit(page, route);
    for (const category of categories) {
      const chip = page.getByRole('button', { name: category.label, exact: true });
      await chip.click();
      const expected = portfolio.filter(work => category.id === 'all' || work.categories.includes(category.id)).slice(0, route === '/' ? 3 : undefined);
      await expect(page.locator('.work-card h3')).toHaveText(expected.map(work => work.title));
      await expect(chip).toHaveAttribute('aria-pressed', 'true');
      await expect(page.locator('.filter-row [aria-pressed="true"]')).toHaveCount(1);
      await expect(page.getByRole('status').filter({ hasText: 'Показано дизайнов' })).toHaveText(`Показано дизайнов: ${expected.length}`);
    }
  }
});

test('each design route and viewer opens correct image and supports selection', async ({ page }) => {
  for (const work of portfolio) {
    await visit(page, '/portfolio/');
    await page.getByRole('button', { name: new RegExp(`Рассмотреть дизайн «${work.title}»`) }).click();
    const viewer = page.getByRole('dialog', { name: work.title, exact: true });
    await expect(viewer.locator('.viewer-image img')).toHaveAttribute('src', work.images[0].src);
    await viewer.getByRole('link', { name: 'Подробнее о дизайне' }).click();
    await expect(page).toHaveURL(new RegExp(`/portfolio/${work.id}/$`));
    await expect(page.locator('h1')).toHaveText(work.title);
    await page.getByRole('button', { name: /Увеличить изображение/ }).click();
    await expect(page.getByRole('dialog').getByRole('img')).toHaveAttribute('src', work.images[0].src);
    await page.getByRole('button', { name: 'Закрыть окно' }).click();
    await openBookingPopup(page, page.getByRole('button', { name: 'Хочу такой маникюр', exact: true }));
    await expect(page.locator('.saved-reference')).toContainText(work.title);
    await page.getByRole('button', { name: 'Убрать выбранный дизайн' }).click();
    await expect(page.locator('.saved-reference')).toHaveCount(0);
  }
});

test('empty quiz result offers all designs and discussion without invented recommendations', async ({ page }) => {
  await visit(page, '/quiz/');
  await completeQuiz(page, ['Натуральный и спокойный', 'Длинные', 'Яркие']);
  await expect(page.locator('.quiz-result')).toContainText('Точных совпадений пока нет');
  await expect(page.locator('.work-card')).toHaveCount(0);
  await openBookingPopup(page, page.getByRole('button', { name: 'Обсудить идею' }));
  await page.locator('.site-footer').getByRole('link', { name: 'Раменское, Московская область' }).click();
  await expect(page).toHaveURL(/\/#contacts$/);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await visit(page, '/quiz/');
  await completeQuiz(page, ['Натуральный и спокойный', 'Длинные', 'Яркие']);
  await page.getByRole('link', { name: 'Посмотреть все дизайны' }).click();
  await expect(page).toHaveURL(/\/portfolio\/$/);
});

test('any quiz answers do not constrain length or shade', async ({ page }) => {
  await visit(page, '/quiz/');
  await completeQuiz(page, ['Яркий и необычный', 'Пока не знаю', 'Пока не определилась']);
  await expect(page.locator('.quiz-result .work-card h3')).toHaveText(['Вишнёвый акцент', 'В своём цвете']);
});

test('FAQ, credentials, repeat booking and missing contacts remain truthful', async ({ page }) => {
  await visit(page);
  for (const item of faq) {
    const detail = page.locator('.faq-list details').filter({ hasText: item.question });
    await detail.locator('summary').click();
    await expect(detail.locator('p')).toHaveText(item.answer);
    await detail.locator('summary').click();
    await expect(detail.locator('p')).not.toBeVisible();
  }
  await page.locator('.credentials summary').click();
  await expect(page.locator('.credentials-content')).toContainText('Документы пока не загружены');
  await expect(page.locator('#contacts')).toContainText('Телефон и мессенджеры пока не указаны');
  await expect(page.locator('#contacts a[href^="tel:"], #contacts .contact-links a[target="_blank"]')).toHaveCount(0);
  await openBookingPopup(page, page.getByRole('button', { name: 'Записаться снова', exact: true }));
  await page.getByRole('link', { name: 'Политика обработки данных' }).click();
  await expect(page).toHaveURL(/\/privacy\/$/);
  await expect(page.locator('.notice')).toContainText('Шаблон');
  await page.getByRole('link', { name: '← На главную', exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
});
