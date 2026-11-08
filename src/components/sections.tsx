import Image from 'next/image';
import Link from 'next/link';
import { studio, faq } from '@/content/studio';
import { services } from '@/content/services';
import { contacts, locations } from '@/content/contacts';
import { reviews } from '@/content/reviews';
import { diplomas } from '@/content/diplomas';
import { booking } from '@/content/booking';
import { formatPrice, formatDuration } from '@/lib/portfolio';
import { isSafeUrl } from '@/lib/booking';
import { BookingButton } from './app-provider';
import { TrackedLink } from './tracked-link';
import { ShareButton } from './share-button';
import { Icon } from './icon';

export function ServicesSection() {
  return <section className="section services-section" id="services"><div className="container">
    <div className="section-heading"><div><span className="eyebrow">Услуги и стоимость</span><h2>Внимание к каждой<br /><em>маленькой детали</em></h2></div><p className="section-description">Сначала — ваши пожелания.<br />Затем — подходящая услуга и понятная стоимость.</p></div>
    <div className="services-list">{services.map((service, index) => <article className="service-row" key={service.id}><span className="service-number">0{index + 1}</span><div className="service-body"><span className="eyebrow">{service.category}</span><h3>{service.title}</h3><p>{service.description}</p><details><summary>Что входит в услугу <Icon name="plus" size={14} /></summary><div><p>{service.includes}</p><p>{service.extra}</p><Link className="text-button" href="/portfolio/">Посмотреть дизайны<Icon name="arrow" size={15} /></Link></div></details></div><div className="service-price"><strong>{formatPrice(service.price)}</strong><span><Icon name="clock" size={14} />{formatDuration(service.durationMinutes)}</span></div><BookingButton className="icon-button service-book" serviceId={service.id}><span className="sr-only">Записаться: {service.title}</span></BookingButton></article>)}</div>
    <p className="fine-print service-note">{services.some(service => service.price === undefined) ? 'Точный прайс ещё не добавлен. ' : ''}Итоговую стоимость и длительность необходимо согласовать до процедуры.</p>
  </div></section>;
}

export function AboutSection() {
  return <section className="section about-section" id="about"><div className="container about-grid">
    <div className="about-visual">{studio.portrait ? <Image src={studio.portrait} alt={`Мастер ${studio.masterName}`} width={700} height={850} /> : <div className="portrait-placeholder"><span className="portrait-orbit" /><Icon name="leaf" size={86} /><span className="portrait-letter">m.</span><p>Здесь будет<br />ваша история</p><small>Место для фотографии мастера</small></div>}<div className="about-caption"><Icon name="heart" size={18} /><span>За красивыми ногтями — человек,<br />которому вы доверяете.</span></div></div>
    <div className="about-content"><span className="eyebrow">Личное знакомство</span><h2>Ваш маникюр.<br /><em>Личный подход.</em></h2>
      <p className="about-intro">{studio.masterName ? `Здравствуйте, я ${studio.masterName}.` : 'Красота начинается с внимания.'}</p>
      <p>{studio.biography || 'Этот сайт создаётся для частного дипломированного мастера. Здесь появятся имя, личная история и профессиональный подход — словами самого мастера.'}</p><p>{studio.studioDescription}</p>
      <div className="about-facts"><div><Icon name="spark" /><div><h3>Образование и практика</h3><p>{studio.education || 'Сведения об обучении и реальные дипломы будут добавлены владельцем.'}</p></div></div><div><Icon name="leaf" /><div><h3>Внимание к процессу</h3><p>{studio.sanitation || 'Порядок обработки инструментов и подготовки рабочего места необходимо уточнить у мастера.'}</p></div></div></div>
      <details className="credentials"><summary>Дипломы и сертификаты <span>{diplomas.length ? diplomas.length : 'Скоро'}<Icon name="plus" size={16} /></span></summary><div className="credentials-content">{diplomas.length ? diplomas.map(diploma => <a key={diploma.id} href={diploma.image} target="_blank" rel="noopener noreferrer"><Image src={diploma.image} alt={diploma.title} width={450} height={320} />{diploma.title}{diploma.year && ` · ${diploma.year}`}</a>) : <p>Документы пока не загружены. Здесь будут только настоящие дипломы с разрешением на публикацию.</p>}</div></details>
    </div>
  </div></section>;
}

export function ReviewsSection() {
  return <section className="section reviews-section" id="reviews"><div className="container"><div className="section-heading"><div><span className="eyebrow">Впечатления</span><h2>Лучше всего говорят <em>клиенты</em></h2></div></div>
    {reviews.length ? <div className="reviews-grid">{reviews.map(review => <blockquote key={review.id}><p>«{review.text}»</p><footer><strong>{review.author}</strong><time dateTime={review.date}>{new Intl.DateTimeFormat('ru-RU', { timeZone: 'Europe/Moscow' }).format(new Date(review.date))}</time><a href={review.sourceUrl} target="_blank" rel="noopener noreferrer">{review.sourceLabel}<Icon name="diagonal" size={15} /></a></footer></blockquote>)}</div> : <div className="reviews-empty"><span className="quote-mark">“</span><div><h3>Здесь появятся ваши впечатления</h3><p>Настоящие отзывы ещё не добавлены. Каждое мнение будет опубликовано со ссылкой на источник.</p></div><Icon name="heart" size={30} /></div>}
    <div className="review-links">{locations.flatMap(location => [{ url: location.yandexReviewsUrl, title: 'Отзывы в Яндекс Картах' }, { url: location.twoGisReviewsUrl, title: 'Отзывы в 2ГИС' }].filter(item => isSafeUrl(item.url)).map(item => <a className="text-button" key={item.url} href={item.url} target="_blank" rel="noopener noreferrer">{item.title}<Icon name="diagonal" size={16} /></a>))}</div>
  </div></section>;
}

export function FaqSection() {
  return <section className="section faq-section"><div className="container faq-grid"><div><span className="eyebrow">До встречи в студии</span><h2>Возможно,<br /><em>вы хотели спросить</em></h2><p className="section-description">О первом визите, выборе дизайна<br />и маленьких организационных деталях.</p></div><div className="faq-list">{faq.map(item => <details key={item.question}><summary>{item.question}<Icon name="plus" size={20} /></summary><p>{item.answer}</p></details>)}</div></div></section>;
}

export function ContactsSection() {
  return <section className="section contacts-section" id="contacts"><div className="container"><div className="section-heading"><div><span className="eyebrow">Место встречи</span><h2>Небольшая студия.<br /><em>Время для себя.</em></h2></div><p className="section-description">Спланируйте свой визит.<br />Все детали — в одном месте.</p></div>
    {locations.map(location => <div className="location-grid" key={location.id}><div className="location-card"><span className="location-label"><Icon name="pin" size={17} />{location.region}</span><h3>{location.city}</h3><p className="location-address">{location.address || 'Точный адрес студии добавляется'}</p><p className="muted">{location.hours || 'График приёма уточняется у мастера'}</p>
      <div className="contact-links">{contacts.phone ? <a href={`tel:${contacts.phone}`}><Icon name="phone" size={18} />{contacts.phoneLabel || contacts.phone}</a> : <p className="fine-print">Телефон и мессенджеры пока не указаны.</p>}{[{ url: contacts.telegramUrl, title: 'Telegram' }, { url: contacts.vkUrl, title: 'ВКонтакте' }, { url: booking.messengerUrl, title: booking.messengerLabel }].filter(item => isSafeUrl(item.url)).map(item => <TrackedLink key={item.url} href={item.url} event="messenger_outbound" external><Icon name="message" size={17} />{item.title}<Icon name="diagonal" size={15} /></TrackedLink>)}</div>
      <BookingButton />
      <div className="route-links">{isSafeUrl(location.yandexMapsUrl) && <TrackedLink href={location.yandexMapsUrl} event="route_open" external className="text-button">Яндекс Карты<Icon name="diagonal" size={16} /></TrackedLink>}{isSafeUrl(location.twoGisUrl) && <TrackedLink href={location.twoGisUrl} event="route_open" external className="text-button">2ГИС<Icon name="diagonal" size={16} /></TrackedLink>}{!location.yandexMapsUrl && !location.twoGisUrl && <p className="fine-print">Маршруты появятся после добавления адреса.</p>}</div>
    </div><div className="location-visual">{location.entrancePhoto ? <Image src={location.entrancePhoto} alt={`Вход в студию: ${location.city}`} width={800} height={600} /> : <><div className="abstract-map" aria-hidden="true"><span className="map-road road-one" /><span className="map-road road-two" /><span className="map-road road-three" /><span className="map-park" /><span className="map-water" /><div className="map-city">{location.city}</div></div><div className="map-caption"><Icon name="pin" /><span>Скоро здесь — фото входа<br /><small>Схема декоративная, точный адрес не указан</small></span></div></>}</div></div>)}
  </div></section>;
}

export function ClosingSection() {
  return <section className="closing-section"><div className="container closing-inner"><Icon name="spark" size={34} /><span className="eyebrow">Та самая маленькая радость</span><h2>Начните с настроения.<br /><em>Остальное — в деталях.</em></h2><div className="button-row"><BookingButton /><Link className="button button-light" href="/quiz/">Подобрать маникюр<Icon name="arrow" size={17} /></Link></div><BookingButton className="text-button repeat-button" repeat>Записаться снова</BookingButton></div></section>;
}

export function Footer() {
  return <footer className="site-footer"><div className="container"><div className="footer-top"><Link href="/" className="wordmark">{studio.brand}<span className="wordmark-star">✳</span><span className="wordmark-sub">personal nail studio</span></Link><p>Красота — в деталях.<br />И в том, как вы себя чувствуете.</p><ShareButton title={studio.tagline} path="/" label="Поделиться сайтом" /></div><div className="footer-bottom"><span>© {studio.brand}{studio.demo && ' · рабочее название, демоверсия'}</span><Link href="/privacy/">Политика обработки данных</Link><Link href="/#contacts">Раменское, Московская область</Link></div></div></footer>;
}
