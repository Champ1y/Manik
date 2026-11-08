# Функции и интерактивные элементы

Ожидания основаны на реализации и README. Это карта покрытия, фактические результаты — [QA_REPORT.md](QA_REPORT.md) и [QA_RESULTS.md](QA_RESULTS.md). PASS не означает проверку функций, которые отсутствуют или скрыты конфигурацией.

| Элемент / функция | Ожидаемое действие | Автоматизированная проверка |
| --- | --- | --- |
| Skip-link | Фокус и переход к #main | journeys: keyboard; первый Tab проверен в Chromium/Firefox. В Windows WebKit Tab пропускает ссылки, проверяется явный фокус + Enter |
| Logo, breadcrumbs, footer logo | Главная/родительская страница | navigation: internal links + desktop/breadcrumbs; не каждый дубликат ссылки кликается отдельно |
| Desktop Портфолио/Услуги/О мастере/Контакты | Путь или соответствующий anchor | navigation: desktop targets |
| Mobile открыть/закрыть меню | aria-expanded, показ/скрытие пунктов | journeys: mobile; navigation; visual menu |
| Мобильное меню: клавиатура и resize | Блокировка прокрутки, Tab внутри шапки, Escape и возврат фокуса, закрытие на desktop | editorial: mobile menu |
| Компактная шапка | 72 px при прокрутке, восстановление исходной высоты, без колебаний у начала страницы | editorial: header + tablet stability |
| Редакционная раскладка | 3/2/1 колонки, все три карточки на mobile, 44 px controls, видимая запись, нет overflow | editorial: все 7 ширин, раскрытые услуги и FAQ |
| Свободная область карточки | Viewer; название отдельно ведёт на страницу, запись отдельно открывает DIKIDI | editorial: portfolio whitespace |
| Пункты mobile menu | Переход и закрытие меню | journeys: every home booking CTA and mobile menu link кликает все 5 пунктов и отдельное закрытие меню |
| Нижняя mobile панель Подобрать/Записаться | Quiz/прямой переход DIKIDI | navigation: bottom bar, безопасный перехват popup |
| Главная CTA Подобрать, Найдите оттенок, teaser | `/quiz/` | navigation: проверка всех href; основной переход — bottom bar/quiz journey |
| Всё портфолио/Больше вдохновения/Помочь с выбором | Portfolio/quiz | inventory проверяет адрес и HTTP; дублирующие CTA не объявляются отдельно прокликанными |
| Все 7 фильтров на главной и в галерее | Точное множество категорий; главная максимум 3; aria-pressed; live count | journeys: every category |
| Все 6 карточек: изображение | Viewer с правильным изображением, названием, тегами, услугой | journeys: each design |
| Viewer: закрыть / Escape | Закрытие модального окна | journeys: keyboard, each design |
| Viewer: Хочу такой маникюр | Viewer закрыт, открыта страница DIKIDI, work сохранён на сайте | mobile journey, visual, widget harness |
| Viewer: Подробнее о дизайне | Правильная отдельная страница | each design для всех 6 |
| Viewer: Поделиться | Web Share/clipboard/fallback с URL работы | тот же ShareButton проверяется на странице работы; отдельный экземпляр viewer не кликается |
| Миниатюры нескольких изображений | Меняют изображение и aria-pressed | NOT TESTED: в текущем контенте у каждой работы одно изображение |
| Страница работы: увеличить/закрыть | Правильное большое изображение | each design для всех 6 |
| Выбор карточки/страницы/подбора | Work ID и связанная услуга в booking | journeys: reference, quiz, each design |
| Сохранённый дизайн: К записи/убрать/пожелания | DIKIDI / очистка / необязательное копирование | reference; each design; resilience |
| Storage между страницами/reload | Сохранение в пределах вкладки | reference; resilience: storage denied/invalid/isolation |
| Немедленный reload во время prefetch | Нет необъяснённых JS/network ошибок | Отдельная test:stress:reload; открытая FAIL-диагностика WebKit. Обычный reference ждёт завершения навигации |
| Услуги: 16 предварительных позиций, раскрытие каталога и кнопки | Состав/наличие уточняются; выбранный serviceId сохраняется, переход общий до настройки соответствия | journeys: services для всех 16; unit catalogue; widget harness с отдельным вариантом gel |
| Цены/длительность | Фактическое значение или «уточняется» | unit format, services; реальные суммы пока неизвестны |
| FAQ: 5 summary | Открытие/закрытие правильного ответа | journeys: FAQ для каждого вопроса |
| Дипломы summary | Честное отсутствие документов | journeys: FAQ/credentials |
| Реальные дипломы/отзывы/ссылки источников | Проверенный контент/ссылка | NOT TESTED: массивы пусты; content/release валидируют ссылки при наличии |
| Контакты и маршруты | Пустые сведения обозначены, опасные/пустые ссылки скрыты | FAQ/contacts; unit safe URL |
| Телефон, TG/VK/карты | Конфигурируемые безопасные переходы | BLOCKED для живого пути: URL/телефон не настроены; внешних запросов нет |
| Записаться в header/hero/контактах/closing | Сразу DIKIDI в новой вкладке, без промежуточного окна | smoke проверяет mobile/услуги; resilience — header; every home booking CTA — остальные 3 кнопки в main |
| Записаться снова | Тот же адаптер, repeat event | journeys: FAQ/repeat; track unit |
| Booking: удалить референс | Очистка work ID через сохранённый дизайн; при недоступности также из резервного диалога | reference; harness резервного состояния |
| Booking: копировать пожелания | Дополнительное действие; текст с услугой, ссылкой, демо-маркером и предупреждением о неподтверждённой процедуре | resilience clipboard success/denied; unit wishes |
| Booking: ручное поле | readonly, выделение всего текста | resilience denied |
| Booking: ссылка сервиса | Прямая ссылка либо исходный href официального виджета; для виджета никаких выдуманных параметров | unit adapter; перехваченные popup на всех кнопках; widget harness, отказ скрипта, keyboard fallback |
| Booking: контакты/close/Escape при отсутствии конфигурации | Понятное недоступное состояние без технических инструкций, настоящий настроенный контакт, возврат фокуса | booking harness; реальный DIKIDI UI не подменяется этим тестом |
| Повторные клики | Один переход при двойном нажатии одной кнопки, никакой реальной записи | resilience rapid clicks |
| Quiz: 4 стиля/4 длины/5 оттенков | Выбор одного ответа, aria-pressed | journeys проверяют положительный, any и пустой пути; unit логику. Не все 80 сочетаний UI кликаются |
| Quiz: Назад/Продолжить/Результат | Disabled без ответа; сохранение ответа назад; фокус заголовка | smoke quiz |
| Quiz: совпадения/нет совпадений | AND-условия; честный empty state | unit и journeys quiz |
| Quiz: рестарт/обсудить/все дизайны | Сброс, диалог/галерея | quiz, empty quiz |
| Поделиться сайтом/дизайном | Success/cancel/failure, безопасный ручной fallback | resilience Web Share + clipboard |
| Политика/назад | Шаблон, noindex, навигация | FAQ/privacy, navigation |
| 404/Посмотреть дизайны | HTTP 404 для неизвестного пути; recovery | navigation metadata/404 |
| Аналитика выключена | Ни счётчика, ни внешних запросов | auto diagnostics на всех browser tests; unit track |
| Согласие/отказ/отзыв при включённой Метрике | Не грузить до согласия, stop/reload при отзыве | NOT TESTED в браузере: аналитика не настроена; условия track покрыты unit |
| Loading skeleton/error reset | Статус загрузки / повторная попытка | NOT TESTED в реальном маршруте: не воспроизводится детерминированно в статическом экспорте |
| Сетки, текст, overflow, focus/hover/disabled, copy error | Нет горизонтального выхода; фиксируемые состояния | visual: 7 ширин; axe: 375/1440; keyboard |
| Сборка/типы/lint/публикация | Статический build; типы; незаполненный release отклонён | test:full + отдельный check:release |
| Свой календарь/слоты/БД/API/логин/права/админ/оплата | Не реализованы в этом MVP | NOT APPLICABLE, тестовые backend/аккаунты не создаются |
| Двойное бронирование/отмена/перенос | Управляется внешним провайдером | NOT APPLICABLE для сайта; подтверждение у провайдера NOT TESTED |

Браузерный инвентарь каждого доступного маршрута сохраняется как `interactive-inventory` в HTML-отчёте теста `all routes expose valid links, images, semantics and inventory`. Диагностика каждой страницы — вложение `browser-diagnostics`. Проверка href/HTTP и проверка кликом различаются в таблице; отсутствие ошибок консоли само по себе не доказывает работоспособность элемента.
