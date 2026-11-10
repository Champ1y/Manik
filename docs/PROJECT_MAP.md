# Карта проекта

Актуально на 8 ноября 2026 года. Источник — фактические файлы репозитория.

## Стек и окружение

Next.js 16.4.4, React/React DOM 19.3.1, TypeScript 6.0.3, Tailwind CSS 4.3.4 через PostCSS. Node.js в рабочей копии: 26.13.0, npm 11.20.0; переносимый комплект `.tools/node-v26.13.0-win-x64`. npm lockfile фиксирует дерево зависимостей.

Тесты: существующий `node:test` через tsx 4.23.15; Playwright Test 1.65.0; axe-core Playwright 4.14.0. Второй модульный фреймворк не добавлен. Инструменты тестирования находятся в devDependencies.

## Архитектура и данные

UI: `src/app/globals.css` содержит общие цветовые, типографические и размерные токены, адаптивные сетки и состояния. `navigation.tsx` отвечает за компактную шапку и клавиатурное мобильное меню; `portfolio-grid.tsx` — за кликабельные карточки с независимыми ссылками/записью. Изменения и список файлов: [UX_UI_REPORT.md](UX_UI_REPORT.md). Регрессии: `tests/e2e/editorial.spec.ts`.

`next.config.ts`: `output: 'export'`, `trailingSlash: true`, изображения без серверной оптимизации. `next build` создаёт `out/`; `scripts/preview.mjs` обслуживает статические файлы на 127.0.0.1 (обычно 4173, тесты 4175). `next start` для этого сайта не применяется.

Backend записи, API мутаций, БД, авторизация, роли, клиентские аккаунты, календарь, управление слотами, оплаты и административный интерфейс отсутствуют по текущему замыслу. Для них статус NOT APPLICABLE. Подтверждение внешней записи невозможно проверить до настройки провайдера и отдельного безопасного окружения.

Данные студии — `src/content/*.ts`: studio/FAQ, services, portfolio/categories, contacts/locations, booking, seo/analytics, reviews, diplomas, общие types. Сейчас 6 демо-работ, предварительные 16 услуг без цен/длительности (`confirmed: false`), 1 незаполненная локация и пустые контакты. Общая запись настроена на обновлённый владельцем `https://dikidi.ru/2197744` с включённой онлайн-записью по его сообщению. Отзывы и дипломы пустые. Неизвестные сведения выводятся как неизвестные.

Выбор `{workId, serviceId}` хранится в sessionStorage (`manic.reference`); при запрете — в памяти документа. После перезагрузки память теряется. Клиентских имён, телефонов и визитов в этом состоянии нет. Согласие на аналитику — localStorage (`manic.analytics-consent`). UTM — память вкладки, только 5 разрешённых параметров, до 120 символов каждый.

## Маршруты

| Путь | Исходник | Назначение |
| --- | --- | --- |
| `/` | `src/app/page.tsx` | Главная; секции portfolio/services/about/reviews/contacts, FAQ, CTA |
| `/portfolio/` | `src/app/portfolio/page.tsx` | Галерея и фильтры |
| `/portfolio/soft-nude/` | `src/app/portfolio/[id]/page.tsx` | Тихая нежность |
| `/portfolio/milky-french/` | тот же | Новая классика |
| `/portfolio/cherry/` | тот же | Вишнёвый акцент |
| `/portfolio/fine-line/` | тот же | Между линий |
| `/portfolio/olive/` | тот же | Оливковая пауза |
| `/portfolio/pink/` | тот же | В своём цвете |
| `/quiz/` | `src/app/quiz/page.tsx` | Три шага подбора |
| `/privacy/` | `src/app/privacy/page.tsx` | Явно обозначенный шаблон политики |
| неизвестный путь | `src/app/not-found.tsx` | HTTP 404 и ссылка в портфолио |
| `/robots.txt`, `/sitemap.xml` | `src/app/robots.ts`, `sitemap.ts` | Запрет индексации/пустая карта до готовности |

`layout.tsx`: локальные шрифты, metadata, язык ru, skip-link, AppProvider, Navigation, SelectedReference, Footer. `loading.tsx` — skeleton со статусом; `error.tsx` — fallback с reset. Их появление во время работы статического экспорта не гарантируется.

## Компоненты и логика

| Файлы | Ответственность |
| --- | --- |
| `app-provider.tsx`, `selected-reference.tsx`, `booking-reference.tsx` | Выбор, сохранение, единая BookingButton, прямой переход/официальный виджет, резервный диалог и необязательное копирование |
| `dialog.tsx` | Нативный modal dialog, Escape, закрытие, блокировка фона |
| `portfolio-grid.tsx`, `work-detail.tsx` | Карточки, фильтры, viewer, детали и выбор работы |
| `quiz.tsx`, `lib/portfolio.ts` | Шаги, ответы, AND-подбор по тегам; any не ограничивает |
| `navigation.tsx`, `sections.tsx` | Desktop/mobile навигация, услуги/FAQ/контакты/CTA/footer |
| `share-button.tsx`, `lib/booking.ts` | Web Share/Clipboard/ручной fallback, HTTPS-адаптер записи |
| `tracked-link.tsx`, `lib/analytics.ts`, `analytics-consent.tsx` | События/UTM/согласие; аналитика отключена |
| `lib/release.ts`, `lib/readiness.ts`, `scripts/check-release.ts` | Готовность публикации и noindex |

CSS и токены — `src/app/globals.css`: cream/ink/plum, локальные Manrope/Cormorant Garamond, breakpoints 600/800/1100/1500 px, `:focus-visible`, `prefers-reduced-motion`. Изображения/лицензии — `public/`.

## QA и автоматизация

- `tests/*.test.ts`: модульная логика, целостность данных, безопасность URL, аналитические условия, публикация.
- `tests/e2e/`: реальные пользовательские сценарии в трёх браузерах, включая browser integration со storage/clipboard.
- `tests/accessibility/`: axe по WCAG A/AA и состояниям UI.
- `tests/visual/`: Chromium, 7 ширин, управляемые PNG в `__screenshots__/<platform>/`.
- `tests/fixtures/site.ts`: изоляция и диагностика. Точный URL профиля DIKIDI перехватывается локально; остальной внешний трафик блокируется. `booking-harness.tsx` собирается esbuild в памяти и доступен только через Playwright route fulfillment, публичного тестового маршрута нет. Им проверяются варианты виджета, отказ скрипта и отсутствие конфигурации без настоящих записей.
- `scripts/qa.mjs`: quick/full, сохранение логов/статусов и генерация `docs/QA_RESULTS.md`.
- `.env.example`: настройки без секретов; данные сайта остаются в content.
- GitHub remote присутствует. Готовых workflows GitHub Actions при исследовании нет; включённый удалённый CI не подтверждён. Доступная автоматизация — локальный watcher и команды QA. Никакие изменения не отправляются в remote.
- Playwright MCP в активном Codex не подключён; для этой задачи достаточно Playwright Test. MCP не устанавливается как обязательная зависимость.

Исходные Next.js инструкции перед реализацией прочитаны в `node_modules/next/dist/docs/01-app/02-guides/testing/playwright.md` и `static-exports.md`.
