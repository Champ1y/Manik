'use client';

import { portfolio } from '@/content/portfolio';
import { services } from '@/content/services';
import { useStudioApp, BookingButton } from './app-provider';
import { Icon } from './icon';
import { CopyBookingWishes } from './booking-reference';

export function SelectedReference() {
  const { selected, choose } = useStudioApp();
  const work = portfolio.find(item => item.id === selected.workId);
  if (!work) return null;
  return <aside className="saved-reference container" aria-label="Сохранённый дизайн"><span><Icon name="heart" size={18} />Ваш выбор: <strong>{work.title}</strong>{work.demo && <small>демо</small>}</span><div><BookingButton className="text-button">К записи</BookingButton><button className="icon-button" aria-label="Убрать выбранный дизайн" onClick={() => choose({})}><Icon name="close" size={17} /></button></div><details className="reference-wishes"><summary>Пожелания к дизайну — по желанию</summary><CopyBookingWishes work={work} service={services.find(service => service.id === (selected.serviceId || work.serviceIds[0]))} /></details></aside>;
}
