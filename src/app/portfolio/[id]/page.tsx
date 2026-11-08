import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { portfolio } from '@/content/portfolio';
import { WorkDetail } from '@/components/work-detail';
import { isPublishable } from '@/lib/readiness';

export const dynamicParams = false;
export function generateStaticParams() { return portfolio.map(work => ({ id: work.id })); }
type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const work = portfolio.find(item => item.id === id);
  if (!work) return {};
  return { title: work.title, description: `${work.subtitle}. ${work.demo ? 'Демонстрационный образец дизайна.' : 'Работа мастера.'} Сохраните референс и перейдите к записи.`, alternates: isPublishable ? { canonical: `/portfolio/${id}/` } : undefined };
}

export default async function WorkPage({ params }: Props) {
  const { id } = await params;
  const work = portfolio.find(item => item.id === id);
  if (!work) notFound();
  return <main id="main" className="inner-page"><section className="container"><Link className="breadcrumb" href="/portfolio/">← Ко всем дизайнам</Link><WorkDetail work={work} /></section></main>;
}
