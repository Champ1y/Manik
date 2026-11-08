import type { BookingConfig } from './types';
export const booking: BookingConfig = {
  provider: 'dikidi',
  status: 'ready', // Подключена общая запись. Код виджета пока не предоставлен.
  url: 'https://dikidi.ru/2199286',
  fallbackUrl: '', // Если отличается от основной ссылки.
  messengerLabel: 'Написать мастеру',
  messengerUrl: '',
  dikidi: {
    // Официальный скрипт из инструкции DIKIDI. Не вставляйте произвольный HTML.
    scriptUrl: 'https://dikidi.net/assets/js/widget_record/widget2.min.js',
    widgetUrl: '', // Целиком href из сгенерированного кода кнопки.
    serviceWidgets: {
      // Ключ — id услуги из services.ts. Ссылки выдаёт DIKIDI Business.
      // gel: { widgetUrl: '', fallbackUrl: '', serviceId: '', staffId: '' },
    },
  },
};
