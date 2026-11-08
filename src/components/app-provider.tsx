'use client';

import Image from 'next/image';
import Link from 'next/link';
import { createContext, useContext, useEffect, useState, useSyncExternalStore, type ReactNode } from 'react';
import { portfolio } from '@/content/portfolio';
import { services } from '@/content/services';
import { booking } from '@/content/booking';
import { analytics } from '@/content/seo';
import { createBookingAdapter, buildWishText, isSafeUrl } from '@/lib/booking';
import { readUtm, track } from '@/lib/analytics';
import { formatDuration, formatPrice } from '@/lib/portfolio';
import { Dialog } from './dialog';
import { Icon } from './icon';
import { AnalyticsConsent } from './analytics-consent';

type Selection = { workId?: string; serviceId?: string };
type AppContextValue = { selected: Selection; choose: (selection: Selection) => void; openBooking: (selection?: Selection, repeat?: boolean) => void };
const AppContext = createContext<AppContextValue | null>(null);
const storageKey = 'manic.reference';
const listeners = new Set<() => void>();
let memorySelection = '';
function subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; }
function snapshot() { try { return sessionStorage.getItem(storageKey) || memorySelection; } catch { return memorySelection; } }
function writeSelection(selection: Selection) {
  memorySelection = JSON.stringify(selection);
  try { sessionStorage.setItem(storageKey, memorySelection); } catch { /* In-memory selection works when storage is unavailable. */ }
  listeners.forEach(listener => listener());
}

export function AppProvider({ children }: { children: ReactNode }) {
  useEffect(() => { readUtm(); }, []);
  const rawSelection = useSyncExternalStore(subscribe, snapshot, () => '');
  let selected: Selection = {};
  try {
    const parsed = JSON.parse(rawSelection || '{}') as Selection;
    selected = { workId: portfolio.some(work => work.id === parsed.workId) ? parsed.workId : undefined, serviceId: services.some(service => service.id === parsed.serviceId) ? parsed.serviceId : undefined };
  } catch { /* Invalid stored values are ignored. */ }
  const [bookingOpen, setBookingOpen] = useState(false);
  function choose(selection: Selection) {
    writeSelection(selection);
    if (selection.workId) track('work_select', { work_id: selection.workId });
  }
  function openBooking(selection?: Selection, repeat = false) {
    if (selection) choose(selection);
    track(repeat ? 'repeat_booking_click' : 'booking_click');
    setBookingOpen(true);
  }
  return <AppContext.Provider value={{ selected, choose, openBooking }}>
    {children}
    {bookingOpen && <BookingDialog onClose={() => setBookingOpen(false)} />}
    <AnalyticsConsent />
  </AppContext.Provider>;
}

export function useStudioApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('AppProvider is required');
  return context;
}

export function BookingButton({ children = 'Записаться', className = 'button button-primary', workId, serviceId, repeat = false }: { children?: ReactNode; className?: string; workId?: string; serviceId?: string; repeat?: boolean }) {
  const { openBooking } = useStudioApp();
  return <button className={className} onClick={() => openBooking(workId || serviceId ? { workId, serviceId } : undefined, repeat)}>{children}<Icon name="diagonal" size={17} /></button>;
}

function BookingDialog({ onClose }: { onClose: () => void }) {
  const { selected, choose } = useStudioApp();
  const work = portfolio.find(item => item.id === selected.workId);
  const service = services.find(item => item.id === (selected.serviceId || work?.serviceIds[0]));
  const adapter = createBookingAdapter(booking);
  const [copyStatus, setCopyStatus] = useState('');
  const [manualText, setManualText] = useState('');
  const url = adapter.getUrl(analytics.forwardUtmToBooking ? readUtm() : {});
  async function copy() {
    const text = buildWishText(window.location.origin, work, service);
    try { await navigator.clipboard.writeText(text); setCopyStatus('Пожелания скопированы'); }
    catch { setManualText(text); setCopyStatus('Выделите и скопируйте текст ниже'); }
  }
  return <Dialog title="Ваш следующий маникюр" onClose={onClose}>
    <p className="muted">Сохраните идею, а время визита выберите в сервисе записи.</p>
    {work && <div className="selected-reference"><Image src={work.images[0].src} alt={work.images[0].alt} width={100} height={120} /><div><span className="eyebrow">Выбранный референс {work.demo && '· демо'}</span><h3>{work.title}</h3><p>{work.subtitle}</p><button className="text-button small" onClick={() => choose({ serviceId: selected.serviceId })}>Убрать референс</button></div></div>}
    {service && <div className="booking-service"><span>{service.title}</span><strong>{formatPrice(work?.price ?? service.price)}</strong><small>{formatDuration(work?.durationMinutes ?? service.durationMinutes)}</small></div>}
    <ol className="booking-steps"><li>Скопируйте пожелания и ссылку на дизайн.</li><li>Откройте запись и выберите услугу и время.</li><li>Вставьте текст в комментарий или отправьте мастеру.</li></ol>
    <button className="button button-outline full-width" onClick={copy}><Icon name="copy" size={17} />Скопировать пожелания</button>
    <p className="status" role="status">{copyStatus}</p>
    {manualText && <textarea className="copy-input" aria-label="Пожелания для ручного копирования" readOnly value={manualText} rows={6} onFocus={event => event.target.select()} />}
    {url ? <a className="button button-primary full-width" href={url} target="_blank" rel="noopener noreferrer" onClick={() => track('booking_outbound', { provider: booking.provider })}>Перейти в {adapter.label}<Icon name="diagonal" size={17} /></a> : <div className="notice"><Icon name="clock" /><div><strong>Подключите ссылку на онлайн-запись</strong><p>Сервис записи ещё не настроен. Выбор дизайна сохранён в этой вкладке; запись не создана.</p></div></div>}
    {isSafeUrl(booking.messengerUrl) && <a className="button button-outline full-width" href={booking.messengerUrl} target="_blank" rel="noopener noreferrer" onClick={() => track('messenger_outbound')}>{booking.messengerLabel}<Icon name="message" size={18} /></a>}
    <p className="fine-print">Пожелания не отправляются автоматически. Переход в сервис ещё не означает подтверждение записи.</p>
    {!url && <Link className="text-button" href="/#contacts" onClick={onClose}>Посмотреть контакты<Icon name="arrow" size={16} /></Link>}
  </Dialog>;
}
