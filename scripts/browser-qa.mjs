import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from '../.tools/qa/node_modules/playwright/index.mjs';
import AxeBuilder from '../.tools/qa/node_modules/@axe-core/playwright/dist/index.mjs';

const base = 'http://127.0.0.1:4173';
await mkdir('.artifacts', { recursive: true });
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, permissions: ['clipboard-read', 'clipboard-write'] });
const page = await context.newPage();
const errors = [];
const external = [];
page.on('pageerror', error => errors.push(error.message));
page.on('request', request => { if (!request.url().startsWith(base) && !request.url().startsWith('data:')) external.push(request.url()); });
const report = { checks: [], accessibility: [] };
function passed(label) { report.checks.push(label); console.log(`PASS ${label}`); }
async function visit(path = '/') { const response = await page.goto(base + path); assert.equal(response.status(), 200, path); await page.waitForLoadState('networkidle'); }
async function axe(label) {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  report.accessibility.push({ page: label, violations: results.violations.map(item => ({ id: item.id, impact: item.impact, description: item.description, nodes: item.nodes.map(node => ({ target: node.target, summary: node.failureSummary })) })) });
}
async function noOverflow(label) {
  await page.evaluate(() => document.fonts.ready);
  const overflow = await page.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth, nodes: [...document.querySelectorAll('body *')].filter(el => el.getBoundingClientRect().right > innerWidth + 1).map(el => ({ tag: el.tagName, className: String(el.className), width: el.getBoundingClientRect().width, right: el.getBoundingClientRect().right })) }));
  assert.ok(overflow.scrollWidth <= overflow.width + 1, `Horizontal overflow: ${label}: ${JSON.stringify(overflow)}`);
}

try {
  await visit();
  await page.screenshot({ path: '.artifacts/hero-desktop.png' });
  await page.screenshot({ path: '.artifacts/home-desktop.png', fullPage: true });
  assert.match(await page.title(), /маникюр/i);
  assert.match(await page.locator('meta[name="robots"]').getAttribute('content'), /noindex/);
  await noOverflow('desktop home');
  await axe('desktop home');
  passed('Home renders with demo warning and noindex');

  // Generate a standalone Open Graph card from repo-native HTML/CSS and local fonts.
  const og = await context.newPage();
  await og.setViewportSize({ width: 1200, height: 630 });
  await og.goto(base);
  await og.evaluate(() => {
    document.body.innerHTML = `<div style="width:1200px;height:630px;background:#f8f6f1;position:relative;padding:58px 78px;overflow:hidden"><div style="font-family:'Cormorant Garamond',Georgia,serif;font-size:72px;letter-spacing:-4px;line-height:1">manic<span style="font-size:26px;color:#663847;vertical-align:top">✳</span></div><div style="font:10px Manrope;letter-spacing:4px;color:#77716a;margin-top:12px">PERSONAL NAIL STUDIO · ДЕМО-КОНЦЕПЦИЯ</div><div style="position:relative;z-index:1;font:78px/.95 'Cormorant Garamond',Georgia,serif;margin-top:68px">Маникюр,<br>в котором<br><i style="color:#663847">вы — это вы.</i></div><div style="position:absolute;width:470px;height:630px;right:0;top:0;background:#e4ddcf"><img src="/images/hero.svg" alt="" style="height:100%;width:100%;object-fit:cover"></div><div style="position:absolute;bottom:36px;left:78px;font:11px Manrope;color:#77716a">Персональный маникюр и дизайн ногтей</div></div>`;
    document.body.style.padding = '0';
  });
  await og.evaluate(() => document.fonts.ready);
  await og.screenshot({ path: 'public/og.png' });
  await og.close();
  passed('Open Graph PNG generated from local assets');

  await page.getByRole('button', { name: 'Записаться', exact: true }).first().click();
  await page.getByRole('dialog').waitFor();
  assert.match(await page.getByRole('dialog').innerText(), /Подключите ссылку на онлайн-запись/);
  for (let index = 0; index < 10; index++) {
    await page.keyboard.press('Tab');
    // Native dialogs can hand focus to browser chrome; background page controls remain inert.
    assert.ok(await page.evaluate(() => document.activeElement === document.body || Boolean(document.activeElement.closest('dialog'))), 'Modal must prevent focus on background controls');
  }
  await page.keyboard.press('Escape');
  await page.getByRole('dialog').waitFor({ state: 'detached' });
  passed('Unconfigured booking is honest; Escape closes modal');

  await visit('/portfolio/');
  assert.equal(await page.locator('.work-card').count(), 6);
  await page.getByRole('button', { name: 'Френч', exact: true }).click();
  assert.equal(await page.locator('.work-card').count(), 1);
  assert.match(await page.locator('.work-card').innerText(), /Новая классика/);
  await page.getByRole('button', { name: 'Все дизайны', exact: true }).click();
  await page.getByRole('button', { name: 'Рассмотреть дизайн «Тихая нежность»' }).click();
  await page.getByRole('dialog').waitFor();
  await page.getByRole('dialog').getByRole('button', { name: 'Хочу такой маникюр', exact: true }).click();
  await page.getByRole('dialog', { name: 'Ваш следующий маникюр' }).waitFor();
  assert.match(await page.getByRole('dialog').innerText(), /Тихая нежность/);
  await page.getByRole('button', { name: 'Скопировать пожелания' }).click();
  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  assert.match(clipboard, /portfolio\/soft-nude\//);
  assert.match(clipboard, /Маникюр с покрытием/);
  await page.screenshot({ path: '.artifacts/booking-desktop.png' });
  await axe('booking dialog');
  await page.keyboard.press('Escape');
  passed('Filters, lightbox, direct design selection, and clipboard work');

  await page.getByRole('link', { name: 'Тихая нежность', exact: true }).click();
  await page.waitForURL('**/portfolio/soft-nude/');
  assert.match(await page.locator('.saved-reference').innerText(), /Тихая нежность/);
  await page.reload();
  assert.match(await page.locator('.saved-reference').innerText(), /Тихая нежность/);
  await page.getByRole('button', { name: 'Поделиться дизайном', exact: true }).click();
  assert.match(await page.evaluate(() => navigator.clipboard.readText()), /portfolio\/soft-nude\//);
  passed('Dedicated work route, persisted selection, and share link work');

  await visit('/quiz/');
  await page.getByRole('button', { name: /Натуральный и спокойный/ }).click();
  await page.getByRole('button', { name: 'Продолжить', exact: true }).click();
  await page.getByRole('button', { name: /Короткие/ }).click();
  await axe('quiz length step');
  await page.getByRole('button', { name: 'Назад', exact: true }).click();
  assert.equal(await page.getByRole('button', { name: /Натуральный и спокойный/ }).getAttribute('aria-pressed'), 'true');
  await page.getByRole('button', { name: 'Продолжить', exact: true }).click();
  assert.equal(await page.getByRole('button', { name: /Короткие/ }).getAttribute('aria-pressed'), 'true');
  await page.getByRole('button', { name: 'Продолжить', exact: true }).click();
  await axe('quiz shade step');
  await page.getByRole('button', { name: /Нюдовые/ }).click();
  await page.getByRole('button', { name: 'Посмотреть подборку', exact: true }).click();
  assert.equal(await page.locator('.quiz-result .work-card').count(), 2);
  await page.screenshot({ path: '.artifacts/quiz-result-desktop.png', fullPage: true });
  await page.getByRole('button', { name: 'Пройти ещё раз', exact: true }).click();
  await page.getByRole('button', { name: /Натуральный и спокойный/ }).click();
  await page.getByRole('button', { name: 'Продолжить', exact: true }).click();
  await page.getByRole('button', { name: /Длинные/ }).click();
  await page.getByRole('button', { name: 'Продолжить', exact: true }).click();
  await page.getByRole('button', { name: /Яркие/ }).click();
  await page.getByRole('button', { name: 'Посмотреть подборку', exact: true }).click();
  assert.equal(await page.locator('.quiz-result .work-card').count(), 0);
  assert.match(await page.locator('.quiz-result').innerText(), /Точных совпадений пока нет/);
  passed('Quiz matching, back navigation, reset, and empty result work');

  await page.setViewportSize({ width: 390, height: 844 });
  await visit();
  await page.screenshot({ path: '.artifacts/hero-mobile.png' });
  await page.screenshot({ path: '.artifacts/home-mobile.png', fullPage: true });
  await noOverflow('mobile home');
  await axe('mobile home');
  await page.getByRole('button', { name: 'Открыть меню', exact: true }).click();
  await page.getByRole('navigation', { name: 'Мобильная навигация' }).getByRole('link', { name: 'Контакты' }).click();
  await page.waitForURL('**/#contacts');
  assert.equal(await page.getByRole('button', { name: 'Открыть меню' }).getAttribute('aria-expanded'), 'false');
  assert.equal(new URL(page.url()).hash, '#contacts');
  await page.getByRole('button', { name: /Записаться снова/ }).click();
  await page.getByRole('dialog').waitFor();
  assert.match(await page.getByRole('dialog').innerText(), /Тихая нежность/);
  await page.keyboard.press('Escape');
  passed('Mobile navigation, contacts anchor, and repeat booking work');

  for (const width of [320, 390, 768, 1024]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ['/', '/portfolio/', '/quiz/', '/portfolio/soft-nude/', '/privacy/']) {
      await visit(route);
      await noOverflow(`${width}px ${route}`);
    }
  }
  passed('All main routes fit 320, 390, 768, and 1024px without horizontal overflow');
  await page.setViewportSize({ width: 390, height: 844 });
  await visit('/quiz/');
  await page.screenshot({ path: '.artifacts/quiz-mobile.png', fullPage: true });
  await axe('quiz mobile');
  await visit('/portfolio/');
  await axe('portfolio mobile');
  await visit('/privacy/');
  await axe('privacy mobile');
  await visit('/portfolio/soft-nude/');
  await axe('work detail mobile');

  // Browser API denial must leave a usable manual copy path.
  await page.addInitScript(() => Object.defineProperty(navigator, 'clipboard', { value: { writeText: () => Promise.reject(new Error('denied')) } }));
  await visit('/portfolio/soft-nude/');
  await page.getByRole('button', { name: 'Хочу такой маникюр', exact: true }).click();
  await page.getByRole('button', { name: 'Скопировать пожелания', exact: true }).click();
  assert.match(await page.getByRole('textbox', { name: 'Пожелания для ручного копирования' }).inputValue(), /Тихая нежность/);
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Поделиться дизайном', exact: true }).click();
  assert.match(await page.getByRole('textbox', { name: 'Ссылка для копирования' }).inputValue(), /soft-nude/);
  passed('Clipboard-denied fallback works for wishes and sharing');

  const robots = await (await context.request.get(base + '/robots.txt')).text();
  assert.match(robots, /Disallow: \//);
  const missing = await context.request.get(base + '/missing-page/');
  assert.equal(missing.status(), 404);
  passed('Robots blocks demo indexing and missing routes return 404');

  assert.deepEqual(errors, [], 'Browser runtime errors');
  assert.deepEqual(external, [], 'Unexpected external requests while analytics is disabled');
  passed('No browser runtime errors or third-party requests');
} finally {
  await writeFile('.artifacts/browser-qa.json', JSON.stringify({ ...report, errors, external }, null, 2));
  await browser.close();
}
const violations = report.accessibility.flatMap(item => item.violations);
if (violations.length) { console.error(JSON.stringify(report.accessibility.filter(item => item.violations.length), null, 2)); process.exitCode = 1; }
else passed('Axe WCAG A/AA scans passed on all checked views');
