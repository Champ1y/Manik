import type { Metadata } from 'next';
import Link from 'next/link';
import { PortfolioGrid } from '@/components/portfolio-grid';
import { Icon } from '@/components/icon';
import { isPublishable } from '@/lib/readiness';
import { portfolio } from '@/content/portfolio';

export const metadata: Metadata = { title: 'Портфолио и идеи маникюра', description: 'Нюд, френч, минимализм и яркие акценты. Выберите дизайн, сохраните референс и перейдите к записи.', alternates: isPublishable ? { canonical: '/portfolio/' } : undefined };

export default function PortfolioPage() {
  return <main id="main" className="inner-page"><section className="container"><div className="page-intro"><Link className="breadcrumb" href="/">Главная / Портфолио</Link><span className="eyebrow">Коллекция настроений</span><h1>Найдите своё.<br /><em>В самых маленьких деталях.</em></h1><div className="page-intro-bottom"><p className="section-description">Выбирайте сердцем, сохраняйте понравившееся.<br />Каждый дизайн можно взять с собой на запись.</p><Link className="text-button" href="/quiz/">Помочь с выбором?<Icon name="spark" size={18} /></Link></div></div>{portfolio.some(work => work.demo) && <p className="demo-note">Демонстрационная галерея: графические образцы не являются работами мастера.</p>}<PortfolioGrid /></section></main>;
}
