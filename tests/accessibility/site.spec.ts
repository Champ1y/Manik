import AxeBuilder from '@axe-core/playwright';
import { test, expect, visit, completeQuiz, denyClipboard, openBookingPopup } from '../fixtures/site';

for (const width of [375, 1440]) {
  for (const route of ['/', '/portfolio/', '/portfolio/soft-nude/', '/quiz/', '/privacy/', '/404.html']) {
    test(`axe ${width}px ${route}`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 1000 });
      await visit(page, route);
      const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      await testInfo.attach('axe', { body: JSON.stringify(result, null, 2), contentType: 'application/json' });
      expect(result.violations).toEqual([]);
    });
  }
}

test('axe on quiz steps, results and manual-copy booking', async ({ page }, testInfo) => {
  await denyClipboard(page);
  await page.setViewportSize({ width: 375, height: 812 });
  await visit(page, '/quiz/');
  for (const [index, answer] of ['Натуральный и спокойный', 'Короткие', 'Нюдовые'].entries()) {
    await page.getByRole('button', { name: new RegExp(answer) }).click();
    const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    await testInfo.attach(`axe-step-${index}`, { body: JSON.stringify(result, null, 2), contentType: 'application/json' });
    expect(result.violations).toEqual([]);
    await page.getByRole('button', { name: index === 2 ? 'Посмотреть подборку' : 'Продолжить', exact: true }).click();
  }
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()).violations).toEqual([]);
  await openBookingPopup(page, page.getByRole('button', { name: /Хочу такой маникюр: Тихая нежность/ }));
  await page.locator('.reference-wishes > summary').click();
  await page.getByRole('button', { name: 'Скопировать пожелания' }).click();
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()).violations).toEqual([]);
  await page.keyboard.press('Escape');
  await visit(page, '/quiz/');
  await completeQuiz(page, ['Натуральный и спокойный', 'Длинные', 'Яркие']);
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()).violations).toEqual([]);
});
