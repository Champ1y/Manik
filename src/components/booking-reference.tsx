'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { PortfolioWork, Service } from '@/content/types';
import { buildWishText } from '@/lib/booking';
import { formatDuration, formatPrice } from '@/lib/portfolio';
import { Icon } from './icon';

export function BookingReference({ work, service, onRemove }: { work?: PortfolioWork; service?: Service; onRemove: () => void }) {
  return <>
    {work && <div className="selected-reference"><Image src={work.images[0].src} alt={work.images[0].alt} width={100} height={120} /><div><span className="eyebrow">Ваш дизайн {work.demo && '· демо'}</span><h3>{work.title}</h3><p>{work.subtitle}</p><button className="text-button small" onClick={onRemove}>Убрать референс</button></div></div>}
    {service && <div className="booking-service"><span>{service.title}</span><strong>{formatPrice(work?.price ?? service.price)}</strong><small>{formatDuration(work?.durationMinutes ?? service.durationMinutes)}</small></div>}
  </>;
}

export function CopyBookingWishes({ work, service }: { work?: PortfolioWork; service?: Service }) {
  const [status, setStatus] = useState('');
  const [manualText, setManualText] = useState('');
  async function copy() {
    const text = buildWishText(window.location.origin, work, service);
    try { await navigator.clipboard.writeText(text); setStatus('Пожелания скопированы'); }
    catch { setManualText(text); setStatus('Выделите и скопируйте текст ниже'); }
  }
  return <div className="booking-wishes"><p className="fine-print">Дизайн не отправляется мастеру автоматически. При желании можно скопировать ссылку и пожелания.</p><button className="text-button" onClick={copy}><Icon name="copy" size={16} />Скопировать пожелания</button><p className="status" role="status">{status}</p>{manualText && <textarea className="copy-input" aria-label="Пожелания для ручного копирования" readOnly value={manualText} rows={5} onFocus={event => event.target.select()} />}</div>;
}
