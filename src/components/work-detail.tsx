'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { PortfolioWork } from '@/content/types';
import { services } from '@/content/services';
import { categories } from '@/content/portfolio';
import { formatPrice, formatDuration } from '@/lib/portfolio';
import { BookingButton } from './app-provider';
import { ShareButton } from './share-button';
import { Dialog } from './dialog';
import { Icon } from './icon';

export function WorkDetail({ work }: { work: PortfolioWork }) {
  const [viewing, setViewing] = useState(false);
  const [index, setIndex] = useState(0);
  return <div className="work-detail-grid"><div><button className="work-image detail-image" onClick={() => setViewing(true)} aria-label={`Увеличить изображение${work.demo ? ' — демо-образец, не работа мастера' : ''}`}><Image src={work.images[index].src} alt={work.images[index].alt} width={800} height={900} priority />{work.demo && <span className="demo-tag" aria-hidden="true">Демо-образец · не работа мастера</span>}<span className="expand-image"><Icon name="diagonal" /></span></button>{work.images.length > 1 && <div className="viewer-thumbs">{work.images.map((image, imageIndex) => <button key={image.src} className={`chip ${index === imageIndex ? 'active' : ''}`} onClick={() => setIndex(imageIndex)} aria-label={`Фото ${imageIndex + 1}`} aria-pressed={index === imageIndex}>{imageIndex + 1}</button>)}</div>}</div>
    <div className="work-detail-content"><span className="eyebrow">В деталях — ваше настроение</span><h1>{work.title}</h1><p className="section-description">{work.subtitle}</p><div className="tag-list">{work.categories.map(category => <span key={category}>{categories.find(item => item.id === category)?.label}</span>)}</div>{work.demo && <p className="demo-note">Графическая иллюстрация для демонстрации сайта. Реальная работа мастера ещё не добавлена.</p>}
      {work.serviceIds.map(serviceId => { const service = services.find(item => item.id === serviceId); return service && <div className="detail-service" key={serviceId}><span className="eyebrow">Подходящая услуга</span><h2>{service.title}</h2><p>{service.includes}</p><div><strong>{formatPrice(work.price ?? service.price)}</strong><span>{formatDuration(work.durationMinutes ?? service.durationMinutes)}</span></div><p className="fine-print">{service.extra}</p></div>; })}
      <BookingButton workId={work.id}>Хочу такой маникюр</BookingButton><p className="fine-print">Дизайн сохранится на сайте. Услугу и время выберите в DIKIDI; пожелания можно скопировать отдельно.</p><ShareButton title={work.title} path={`/portfolio/${work.id}/`} label="Поделиться дизайном" />
    </div>{viewing && <Dialog title={work.title} onClose={() => setViewing(false)} className="work-dialog"><Image className="detail-large-image" src={work.images[index].src} alt={work.images[index].alt} width={1000} height={1100} /><p>{work.demo ? 'Демонстрационный образец, не работа мастера.' : work.subtitle}</p></Dialog>}
  </div>;
}
