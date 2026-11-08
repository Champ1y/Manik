// Compiled in memory and fulfilled ONLY by Playwright on loopback. No public test route.
import React from 'react';
import { createRoot } from 'react-dom/client';
import { AppProvider, BookingButton } from '../../src/components/app-provider';
import { SelectedReference } from '../../src/components/selected-reference';
import { booking } from '../../src/content/booking';
import type { BookingConfig } from '../../src/content/types';

const preset = new URLSearchParams(location.search).get('preset');
const widget: BookingConfig = { ...booking, dikidi: {
  scriptUrl: 'https://dikidi.net/assets/js/widget_record/widget2.min.js',
  widgetUrl: 'https://dikidi.net/#widget=10001',
  serviceWidgets: { gel: { widgetUrl: 'https://dikidi.net/#widget=10002' } },
} };
const unavailable: BookingConfig = { ...booking, status: 'not_configured', url: '' };
const config = preset === 'widget' ? widget
  : preset === 'contact' ? { ...unavailable, messengerUrl: 'https://t.me/manic_test_only', messengerLabel: 'Написать мастеру' }
  : preset === 'invalid' ? { ...booking, url: 'javascript:alert(1)', dikidi: undefined }
  : unavailable;

createRoot(document.getElementById('root')!).render(<AppProvider bookingConfig={config}>
  <main className="container" id="main"><h1>Проверка интеграции записи</h1><p>Синтетические ссылки только для локальных тестов. Бронирование не выполняется.</p><div className="button-row"><BookingButton /><BookingButton serviceId="gel">Записаться на услугу</BookingButton><BookingButton workId="soft-nude">Записаться с дизайном</BookingButton><BookingButton repeat>Записаться снова</BookingButton></div><SelectedReference /></main>
</AppProvider>);
