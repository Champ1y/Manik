# Запуск и расширение тестов

## Подготовка

В этой Windows-копии:

```powershell
$env:PATH = "$PWD\.tools\node-v26.13.0-win-x64;$env:PATH"
$env:NEXT_TELEMETRY_DISABLED = '1'
npm.cmd ci
npm.cmd run test:install
npm.cmd run test:quick
```

На другой машине нужны Node.js с поддержкой проекта и npm. Linux: `npx playwright install --with-deps chromium firefox webkit`. Браузеры привязаны к версии Playwright из lockfile. Обычный путь к их кешу используется автоматически; старый `.tools/browsers` от прежней разовой проверки не требуется. Не задавайте прежний PLAYWRIGHT_BROWSERS_PATH, если там нет новых версий браузеров.

Для npm scripts Windows используйте `npm.cmd`, если PowerShell блокирует npm.ps1. Подготовка не меняет production-сервисы. Секретов, БД и аккаунтов для тестов не требуется.

## Команды

| Команда | Назначение |
| --- | --- |
| `npm test` / `test:unit` | Unit и целостность контента |
| `npm run test:quick` | Unit + 5 smoke Chromium, сохранение отчёта |
| `npm run test:full` | Lint/types/unit/build/E2E 3 браузера/axe/visual |
| `npm run test:smoke` | Только smoke Chromium |
| `npm run test:e2e` | Функциональные тесты 3 браузеров |
| `npm run test:stress:reload` | 10 WebKit-повторов немедленной перезагрузки во время prefetch; известная открытая нестабильность |
| `npm run test:a11y` | Axe и состояния интерфейса |
| `npm run test:visual:quick` | Screenshots 375/768/1440 |
| `npm run test:visual` | Все 7 ширин |
| `npm run test:visual:candidates` | Создать только отсутствующие кандидаты PNG |
| `npm run test:watch` | Наблюдение за unit, остановка Ctrl+C |
| `npm run test:ui` | Playwright UI, выбор и повтор тестов |
| `npm run test:coverage` | Покрытие src/lib средствами Node |
| `npm run lint` / `typecheck` / `build` | Отдельные технические проверки |
| `npm run test:report` | Перегенерировать docs/QA_RESULTS из последнего quick/full |
| `npm run test:report:open` | HTML последнего quick/full из latest.json |
| `npm run check:release` | Готовность реального контента, ожидаемый FAIL для demo |

Playwright самостоятельно выполняет production build, поднимает preview на **127.0.0.1:4175**, дожидается HTTP и завершает свой сервер. Не запускайте два browser suite одновременно: build и порт общие. Свободный 4175 обязателен; обычный пользовательский preview на 4173 не трогается. Прямой E2E не требует запуска dev-сервера вручную.

## Отчёты и диагностика

Quick/full: каталог указан в конце команды и в `.artifacts/qa/latest.json`. HTML открывается так (подставьте каталог):

```powershell
npx.cmd playwright show-report .artifacts/qa/<id>-full/browser/html
npx.cmd playwright show-trace <путь-к-trace.zip>
```

Прямые команды test:e2e/a11y/visual: `.artifacts/playwright/html/index.html`, `results.json`, `results/`. При падении там screenshot, trace, error-context и browser-diagnostics. JSON и HTML фиксируют фактические результаты. Инвентаризация ссылок/кнопок приложена к navigation-тесту; axe JSON — к accessibility-тестам.

Ненулевой exit code нельзя объявлять PASS. Если среда не запускает конкретный браузер, зафиксируйте BLOCKED с причиной и выполните доступный project; не объявляйте полный набор пройденным.

Проверка сохранения референса в обычном наборе дожидается заголовка нового маршрута, готовности шрифтов и окончания сетевой активности перед reload. После SPA-перехода `networkidle` может уже относиться к предыдущему документу: одного этого события недостаточно. Это проверяет перезагрузку после завершённой навигации. Отдельная `test:stress:reload` перезагружает немедленно и сохраняет все access-control/pageerror в `.artifacts/webkit-reload-stress/`. Её результат не заменяется результатом обычного набора; открытое ограничение описано в QA_REPORT. Повторные попытки не включены.

## Визуальные кандидаты

После первой установки для текущей ОС нужны просмотренные snapshots. Сначала `test:visual:candidates`, затем **обычный** `test:visual`: второй прогон должен сравнивать, а не создавать. Первый набор пока имеет статус кандидатов и не доказывает правильность дизайна. Для другой ОС нужны собственные кандидаты; Windows PNG не подходят для Linux.

Не запускайте массовое обновление ради зелёного статуса. Для согласованного изменения ограничьте запуск конкретным test/width и проверьте diff. В Git должны попадать только относящиеся к изменению PNG. Пример целевого сравнения без изменения эталонов:

```powershell
npx.cmd playwright test --project=visual --grep '375px'
npx.cmd playwright test --project=chromium --grep 'reference survives'
```

## Добавление сценариев

Unit: добавьте `tests/<область>.test.ts`, используйте node:test/assert. Синтетические данные не добавляйте в публичный content. Browser: `tests/e2e/*.spec.ts`, импорт `test/expect/visit` из `tests/fixtures/site.ts`; только локальная сборка. `@smoke` оставляйте небольшим набором ключевых путей. Новый маршрут добавьте в navigation/axe/visual и FEATURE_MATRIX. Для дефекта сначала воспроизведите его тестом, внесите минимальное исправление и повторите связанный набор.

Общая запись DIKIDI настроена; карты и мессенджеры пока нет. Fixture перехватывает точный URL DIKIDI локально, без внешнего запроса. `tests/e2e/booking.spec.ts` дополнительно собирает harness через esbuild (devDependency), проверяет виджеты, отказ скрипта и резервные контакты на синтетическом конфиге. Никаких сообщений/броней не создаётся, запрет остального внешнего трафика сохранён. Реальное подтверждение у провайдера тестами не заявляется.

Предыдущий `scripts/browser-qa.mjs` заменён оболочкой smoke-набора; он больше не импортирует зависимости из .tools и не перезаписывает public/og.png. Исторический VERIFICATION не заменяет свежий QA_REPORT.
