'use client';

import Link from 'next/link';
import Script from 'next/script';
import { createContext, useContext, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { portfolio } from '@/content/portfolio';
import { services } from '@/content/services';
import { booking } from '@/content/booking';
import { contacts } from '@/content/contacts';
import type { BookingConfig } from '@/content/types';
import { analytics } from '@/content/seo';
import { createBookingAdapter, getBookingContact, getBookingWarnings, isDikidiScriptUrl, isDikidiWidgetUrl } from '@/lib/booking';
import { readUtm, track } from '@/lib/analytics';
import { Dialog } from './dialog';
import { Icon } from './icon';
import { AnalyticsConsent } from './analytics-consent';
import { BookingReference, CopyBookingWishes } from './booking-reference';

type Selection = { workId?: string; serviceId?: string };
type AppContextValue = { selected: Selection; choose: (selection: Selection) => void; openBooking: (selection?: Selection, repeat?: boolean) => void; bookingConfig: BookingConfig; widgetReady: boolean };
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

export function AppProvider({ children, bookingConfig = booking }: { children: ReactNode; bookingConfig?: BookingConfig }) {
  useEffect(() => { readUtm(); }, []);
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      for (const warning of getBookingWarnings(bookingConfig)) console.warn(`[manic booking] ${warning}`);
    }
  }, [bookingConfig]);
  const rawSelection = useSyncExternalStore(subscribe, snapshot, () => '');
  let selected: Selection = {};
  try {
    const parsed = JSON.parse(rawSelection || '{}') as Selection;
    selected = { workId: portfolio.some(work => work.id === parsed.workId) ? parsed.workId : undefined, serviceId: services.some(service => service.id === parsed.serviceId) ? parsed.serviceId : undefined };
  } catch { /* Invalid stored values are ignored. */ }
  const [bookingOpen, setBookingOpen] = useState(false);
  const [widgetReady, setWidgetReady] = useState(false);
  const hasWidget = bookingConfig.provider === 'dikidi' && bookingConfig.status === 'ready'
    && isDikidiScriptUrl(bookingConfig.dikidi?.scriptUrl || '')
    && [bookingConfig.dikidi?.widgetUrl || '', ...Object.values(bookingConfig.dikidi?.serviceWidgets || {}).map(variant => variant.widgetUrl)].some(isDikidiWidgetUrl);
  function choose(selection: Selection) {
    writeSelection(selection);
    if (selection.workId) track('work_select', { work_id: selection.workId });
  }
  function openBooking(selection?: Selection, repeat = false) {
    if (selection) choose(selection);
    track(repeat ? 'repeat_booking_click' : 'booking_click');
    const nextSelection = selection || selected;
    const work = portfolio.find(item => item.id === nextSelection.workId);
    const target = createBookingAdapter(bookingConfig).getTarget(nextSelection.serviceId || work?.serviceIds[0]);
    if (!target) setBookingOpen(true);
  }
  return <AppContext.Provider value={{ selected, choose, openBooking, bookingConfig, widgetReady }}>
    {children}
    {hasWidget && <Script id="dikidi-booking-widget" src={bookingConfig.dikidi!.scriptUrl} strategy="afterInteractive" onReady={() => setWidgetReady(true)} onError={() => setWidgetReady(false)} />}
    {bookingOpen && <BookingDialog onClose={() => setBookingOpen(false)} />}
    <AnalyticsConsent />
  </AppContext.Provider>;
}

export function useStudioApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('AppProvider is required');
  return context;
}

export function BookingButton({ children = 'Записаться', className = 'button button-primary', workId, serviceId, repeat = false, onBeforeOpen }: { children?: ReactNode; className?: string; workId?: string; serviceId?: string; repeat?: boolean; onBeforeOpen?: () => void }) {
  const { openBooking, selected, bookingConfig, widgetReady } = useStudioApp();
  const lastLaunch = useRef(-Infinity);
  const keyboardActivation = useRef(false);
  const explicit = workId || serviceId ? { workId, serviceId } : undefined;
  const selection = explicit || selected;
  const work = portfolio.find(item => item.id === selection.workId);
  const target = createBookingAdapter(bookingConfig).getTarget(selection.serviceId || work?.serviceIds[0], analytics.forwardUtmToBooking ? readUtm() : {});
  function prepare() { openBooking(explicit, repeat); onBeforeOpen?.(); }
  if (!target) return <button type="button" className={className} onClick={event => { event.currentTarget.focus({ preventScroll: true }); prepare(); }}>{children}<Icon name="diagonal" size={17} /></button>;
  // Официальный script сам обрабатывает клик по исходному href. Никаких private API.
  return <a role="button" className={className} href={widgetReady && target.widgetUrl ? target.widgetUrl : target.directUrl} target={widgetReady && target.widgetUrl ? undefined : '_blank'} rel="noopener noreferrer" onClick={event => {
    const viaKeyboard = keyboardActivation.current || event.detail === 0;
    keyboardActivation.current = false;
    if (event.timeStamp - lastLaunch.current < 800) { event.preventDefault(); event.stopPropagation(); return; }
    lastLaunch.current = event.timeStamp;
    event.currentTarget.focus({ preventScroll: true });
    prepare();
    if (!widgetReady || !target.widgetUrl || viaKeyboard) {
      // Клавиатура/отказ JS используют прямую страницу, сохраняя нативную навигацию.
      event.stopPropagation();
      if (widgetReady && target.widgetUrl && viaKeyboard) {
        event.preventDefault();
        window.open(target.directUrl, '_blank', 'noopener,noreferrer');
      }
      track('booking_outbound', { provider: bookingConfig.provider });
    } else track('booking_widget_click', { provider: bookingConfig.provider });
  }} onPointerDown={() => { keyboardActivation.current = false; }} onKeyDown={event => {
    if (event.key === 'Enter' || event.key === ' ') keyboardActivation.current = true;
    if (event.key === ' ') { event.preventDefault(); event.currentTarget.click(); }
  }}>{children}<Icon name="diagonal" size={17} /></a>;
}

function BookingDialog({ onClose }: { onClose: () => void }) {
  const { selected, choose, bookingConfig } = useStudioApp();
  const work = portfolio.find(item => item.id === selected.workId);
  const service = services.find(item => item.id === (selected.serviceId || work?.serviceIds[0]));
  const contact = getBookingContact(bookingConfig, contacts);
  return <Dialog title="Онлайн-запись" className="booking-unavailable" onClose={onClose}>
    <p className="booking-availability">Сейчас онлайн-запись недоступна.</p>
    <p className="muted">{contact ? 'Свяжитесь с мастером, чтобы выбрать удобное время.' : 'Пожалуйста, попробуйте позже.'}</p>
    {contact && <a className="button button-primary full-width" href={contact.href} target={contact.kind === 'messenger' ? '_blank' : undefined} rel={contact.kind === 'messenger' ? 'noopener noreferrer' : undefined} onClick={() => { if (contact.kind === 'messenger') track('messenger_outbound'); }}>{contact.label}<Icon name={contact.kind === 'phone' ? 'phone' : 'message'} size={18} /></a>}
    <BookingReference work={work} service={service} onRemove={() => choose({ serviceId: selected.serviceId })} />
    {(work || service) && <CopyBookingWishes work={work} service={service} />}
    <Link className="text-button" href="/#contacts" onClick={onClose}>Посмотреть контакты<Icon name="arrow" size={16} /></Link>
  </Dialog>;
}
