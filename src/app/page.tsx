import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { BookingButton } from '@/components/app-provider';
import { Icon } from '@/components/icon';
import { PortfolioGrid } from '@/components/portfolio-grid';
import { AboutSection, ClosingSection, ContactsSection, FaqSection, ReviewsSection, ServicesSection } from '@/components/sections';
import { studio } from '@/content/studio';
import { contacts, locations } from '@/content/contacts';
import { seo } from '@/content/seo';
import { isPublishable } from '@/lib/readiness';
import { portfolio } from '@/content/portfolio';

export const metadata: Metadata = { alternates: isPublishable ? { canonical: '/' } : undefined };

export default function HomePage() {
  const jsonLd = isPublishable ? { '@context': 'https://schema.org', '@type': 'NailSalon', name: studio.brand, url: seo.siteUrl, telephone: contacts.phone, image: studio.portrait, address: locations.map(location => ({ '@type': 'PostalAddress', streetAddress: location.address, addressLocality: location.city, addressRegion: location.region, addressCountry: 'RU' })) } : null;
  return <main id="main">
    {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />}
    <section className="hero"><div className="container hero-grid"><div className="hero-content"><span className="eyebrow hero-eyebrow"><span />Маленькие детали. Ваш характер.</span><h1>Маникюр,<br />в котором<br /><em>вы — это вы.</em></h1><p>{studio.heroDescription}</p><div className="button-row"><BookingButton /><Link className="button button-text" href="/portfolio/">Посмотреть работы<Icon name="arrow" size={18} /></Link></div><div className="hero-footnote"><span className="mini-swatch swatch-one" /><span className="mini-swatch swatch-two" /><span className="mini-swatch swatch-three" /><span>Ваш стиль начинается<br /><strong>с одного оттенка</strong></span></div></div>
      <div className="hero-art"><Image src="/images/hero.svg" alt="Художественная композиция образцов покрытия: пудровый, молочный и вишнёвый. Демонстрационная иллюстрация." width={850} height={1000} priority /><span className="hero-art-caption">THE ART OF LITTLE DETAILS</span><span className="hero-art-badge"><Icon name="spark" size={22} /><span>Вдохновение<br />до кончиков пальцев</span></span><span className="hero-demo">Иллюстрация · демо-концепция</span></div>
    </div></section>
    <div className="principles"><div className="container principles-inner"><span><Icon name="spark" size={18} />Дизайн под ваше настроение</span><span><Icon name="heart" size={18} />Частная студия</span><span><Icon name="leaf" size={18} />Выбор без спешки</span><Link href="/quiz/">Найдите свой оттенок<Icon name="arrow" size={17} /></Link></div></div>
    <section className="section portfolio-section" id="portfolio"><div className="container"><div className="section-heading"><div><span className="eyebrow">Портфолио · вдохновение</span><h2>Какое у вас<br /><em>сегодня настроение?</em></h2></div><div className="section-heading-side"><p>Сохраните то, что откликается.<br />И возьмите идею с собой на визит.</p><Link href="/portfolio/" className="text-button">Всё портфолио<Icon name="diagonal" size={17} /></Link></div></div>{portfolio.some(work => work.demo) && <p className="demo-note">Сейчас в галерее — графические демо-образцы. Они будут заменены фотографиями работ мастера.</p>}<PortfolioGrid limit={3} /><div className="portfolio-bottom"><span>От тихого нюда до смелого цвета —<br />найдётся что-то ваше.</span><Link href="/portfolio/" className="button button-outline">Больше вдохновения<Icon name="arrow" size={18} /></Link></div></div></section>
    <section className="quiz-teaser"><div className="container quiz-teaser-inner"><div className="quiz-teaser-art" aria-hidden="true"><span className="teaser-nail nail-one" /><span className="teaser-nail nail-two" /><span className="teaser-nail nail-three" /><span className="teaser-ring"><span>your<br /><em>mood.</em></span></span></div><div className="quiz-teaser-content"><span className="eyebrow">Маленький помощник в выборе</span><h2>Не знаете, чего хочется?<br /><em>Начнём с вас.</em></h2><p>Три простых вопроса о стиле, длине и цвете —<br />и подборка дизайнов, в которых есть ваше настроение.</p><Link href="/quiz/" className="button button-primary">Подобрать маникюр<Icon name="spark" size={18} /></Link><span className="teaser-caption">3 вопроса · без регистрации</span></div></div></section>
    <ServicesSection /><AboutSection /><ReviewsSection /><FaqSection /><ContactsSection /><ClosingSection />
  </main>;
}
