import type { Metadata } from 'next';
import Link from 'next/link';
import { Quiz } from '@/components/quiz';
import { isPublishable } from '@/lib/readiness';

export const metadata: Metadata = { title: 'Подобрать маникюр', description: 'Три вопроса о вашем стиле, длине и любимых оттенках — и подходящие идеи маникюра из портфолио.', alternates: isPublishable ? { canonical: '/quiz/' } : undefined };

export default function QuizPage() {
  return <main id="main" className="inner-page quiz-page"><section className="container"><div className="page-intro compact"><Link href="/" className="breadcrumb">Главная / Подбор маникюра</Link><span className="eyebrow">Ваш маленький помощник</span><h1>Маникюр <em>про вас.</em></h1><p className="section-description">Давайте найдём то самое сочетание.</p></div><Quiz /></section></main>;
}
