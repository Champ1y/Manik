'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { studio } from '@/content/studio';
import { BookingButton } from './app-provider';
import { Icon } from './icon';
import { track } from '@/lib/analytics';

const links = [{ href: '/portfolio/', label: 'Портфолио' }, { href: '/#services', label: 'Услуги и цены' }, { href: '/#about', label: 'О мастере' }, { href: '/#contacts', label: 'Контакты' }];

export function Navigation() {
  const [open, setOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const header = useRef<HTMLElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  useEffect(() => {
    // Separate thresholds prevent scroll anchoring from toggling the header
    // repeatedly when its height changes near the top of the document.
    const update = () => setCompact(previous => window.scrollY > (previous ? 48 : 120));
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const desktop = window.matchMedia('(min-width: 801px)');
    const resize = () => { if (desktop.matches) setOpen(false); };
    desktop.addEventListener('change', resize);
    function escape(event: KeyboardEvent) {
      if (event.key === 'Escape') { setOpen(false); menuButton.current?.focus(); }
      if (event.key === 'Tab') {
        const items = Array.from(header.current?.querySelectorAll<HTMLElement>('a[href], button') || []).filter(element => element.getClientRects().length > 0);
        const first = items[0];
        const last = items.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    }
    document.addEventListener('keydown', escape);
    return () => { document.body.style.overflow = previous; document.removeEventListener('keydown', escape); desktop.removeEventListener('change', resize); };
  }, [open]);
  return <>
    {studio.demo && <div className="demo-bar">Демонстрационная версия<span> · Образцы дизайнов, не работы мастера</span></div>}
    <div className="header-sentinel" aria-hidden="true" />
    <header ref={header} className={`site-header ${compact ? 'is-compact' : ''} ${open ? 'menu-open' : ''}`}><div className="container header-inner">
      <Link href="/" className="wordmark" aria-label={`${studio.brand} personal nail studio — на главную`}>{studio.brand}<span className="wordmark-star" aria-hidden="true">✳</span><span className="wordmark-sub">personal nail studio</span></Link>
      <nav aria-label="Основная навигация" className="desktop-nav">{links.map(link => <Link key={link.href} href={link.href} aria-current={pathname === link.href ? 'page' : undefined} onClick={() => { if (link.href.endsWith('contacts')) track('contacts_click'); }}>{link.label}</Link>)}</nav>
      <div className="header-actions"><BookingButton className="button button-small button-primary" /><button ref={menuButton} className="icon-button mobile-menu-toggle" aria-label={open ? 'Закрыть меню' : 'Открыть меню'} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(!open)}><Icon name={open ? 'close' : 'menu'} /></button></div>
    </div>
    <nav id="mobile-navigation" aria-label="Мобильная навигация" className="mobile-nav" hidden={!open}>{[...links, { href: '/quiz/', label: 'Подобрать маникюр' }].map(link => <Link key={link.href} href={link.href} onClick={() => { setOpen(false); if (link.href.endsWith('contacts')) track('contacts_click'); }}>{link.label}<Icon name="arrow" size={18} /></Link>)}</nav>
    </header>
    <div className="mobile-booking"><Link href="/quiz/"><Icon name="spark" size={18} />Подобрать</Link><BookingButton /></div>
  </>;
}
