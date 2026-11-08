'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { categories, portfolio } from '@/content/portfolio';
import { services } from '@/content/services';
import type { PortfolioWork } from '@/content/types';
import { filterPortfolio, formatPrice, formatDuration } from '@/lib/portfolio';
import { BookingButton, useStudioApp } from './app-provider';
import { Dialog } from './dialog';
import { Icon } from './icon';
import { ShareButton } from './share-button';

export function WorkCard({ work, priority = false }: { work: PortfolioWork; priority?: boolean }) {
  const [viewing, setViewing] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const { selected } = useStudioApp();
  return <article className={`work-card ${selected.workId === work.id ? 'is-selected' : ''}`}>
    <div className="work-visual"><button className="work-image work-preview" onClick={() => setViewing(true)} aria-label={`Рассмотреть дизайн «${work.title}»${work.demo ? ' — демонстрационный образец' : ''}`}>
      <span className="work-image-frame"><Image src={work.images[0].src} alt={work.images[0].alt} width={600} height={700} priority={priority} /></span>
    </button>{work.demo && <span className="demo-tag">Демо-образец</span>}{selected.workId === work.id && <span className="selected-tag"><Icon name="check" size={14} />Выбрано</span>}</div>
    <div className="work-info"><h3><Link href={`/portfolio/${work.id}/`}>{work.title}</Link></h3><p>{work.subtitle}</p></div>
    <div className="work-actions"><span className="work-hint" aria-hidden="true">Рассмотреть дизайн<Icon name="arrow" size={17} /></span><BookingButton className="text-button work-select" workId={work.id}><span className="sr-only">Хочу такой маникюр: {work.title}</span><span aria-hidden="true">Хочу такой маникюр</span></BookingButton></div>
    {viewing && <Dialog title={work.title} className="work-dialog" onClose={() => setViewing(false)}>
      <div className="viewer-image"><Image src={work.images[imageIndex].src} alt={work.images[imageIndex].alt} width={600} height={700} />{work.demo && <span className="demo-tag">Демонстрационный образец · не работа мастера</span>}</div>
      {work.images.length > 1 && <div className="viewer-thumbs">{work.images.map((image, index) => <button className={`chip ${index === imageIndex ? 'active' : ''}`} key={image.src} aria-label={`Фото ${index + 1}`} aria-pressed={index === imageIndex} onClick={() => setImageIndex(index)}>{index + 1}</button>)}</div>}
      <p>{work.subtitle}</p><div className="tag-list">{work.categories.map(category => <span key={category}>{categories.find(item => item.id === category)?.label}</span>)}</div>
      {work.serviceIds.map(id => { const service = services.find(item => item.id === id); return service && <div key={id} className="related-service"><span>{service.title}</span><small>{formatPrice(work.price ?? service.price)} · {formatDuration(work.durationMinutes ?? service.durationMinutes)}</small></div>; })}
      <div className="viewer-actions"><BookingButton workId={work.id} onBeforeOpen={() => setViewing(false)}>Хочу такой маникюр</BookingButton><Link className="button button-outline" href={`/portfolio/${work.id}/`} onClick={() => setViewing(false)}>Подробнее о дизайне<Icon name="diagonal" size={17} /></Link></div>
      <ShareButton title={work.title} path={`/portfolio/${work.id}/`} label="Поделиться дизайном" />
    </Dialog>}
  </article>;
}

export function PortfolioGrid({ limit, showFilters = true }: { limit?: number; showFilters?: boolean }) {
  const [category, setCategory] = useState('all');
  const works = filterPortfolio(portfolio, category).slice(0, limit);
  return <>
    {showFilters && <div className="filter-row" aria-label="Фильтры портфолио">{categories.map(item => <button key={item.id} className={`chip ${category === item.id ? 'active' : ''}`} aria-pressed={category === item.id} onClick={() => setCategory(item.id)}>{item.label}</button>)}</div>}
    <p className="sr-only" role="status">Показано дизайнов: {works.length}</p>
    {works.length ? <div className="portfolio-grid">{works.map(work => <WorkCard key={work.id} work={work} />)}</div> : <div className="empty-state"><Icon name="spark" /><h3>В этой категории пока тихо</h3><p>Посмотрите другие дизайны — возможно, ваша идея уже среди них.</p><button className="button button-outline" onClick={() => setCategory('all')}>Все дизайны</button></div>}
  </>;
}
