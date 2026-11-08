'use client';

import Link from 'next/link';
import { useState } from 'react';
import { studio } from '@/content/studio';
import { BookingButton } from './app-provider';
import { Icon } from './icon';
import { track } from '@/lib/analytics';

const links = [{ href: '/portfolio/', label: 'Портфолио' }, { href: '/#services', label: 'Услуги и цены' }, { href: '/#about', label: 'О мастере' }, { href: '/#contacts', label: 'Контакты' }];

export function Navigation() {
  const [open, setOpen] = useState(false);
  return <>
    {studio.demo && <div className="demo-bar">Демонстрационная версия<span> · Образцы дизайнов, не работы мастера</span></div>}
    <header className="site-header"><div className="container header-inner">
      <Link href="/" className="wordmark" aria-label={`${studio.brand} personal nail studio — на главную`}>{studio.brand}<span className="wordmark-star" aria-hidden="true">✳</span><span className="wordmark-sub">personal nail studio</span></Link>
      <nav aria-label="Основная навигация" className="desktop-nav">{links.map(link => <Link key={link.href} href={link.href} onClick={() => { if (link.href.endsWith('contacts')) track('contacts_click'); }}>{link.label}</Link>)}</nav>
      <div className="header-actions"><BookingButton className="button button-small button-primary" /><button className="icon-button mobile-menu-toggle" aria-label={open ? 'Закрыть меню' : 'Открыть меню'} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(!open)}><Icon name={open ? 'close' : 'menu'} /></button></div>
    </div>
    {open && <nav id="mobile-navigation" aria-label="Мобильная навигация" className="mobile-nav">{[...links, { href: '/quiz/', label: 'Подобрать маникюр' }].map(link => <Link key={link.href} href={link.href} onClick={() => { setOpen(false); if (link.href.endsWith('contacts')) track('contacts_click'); }}>{link.label}<Icon name="diagonal" size={18} /></Link>)}</nav>}
    </header>
    <div className="mobile-booking"><Link href="/quiz/"><Icon name="spark" size={18} />Подобрать</Link><BookingButton /></div>
  </>;
}
