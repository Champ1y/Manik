'use client';

import { portfolio } from '@/content/portfolio';
import { useStudioApp, BookingButton } from './app-provider';
import { Icon } from './icon';

export function SelectedReference() {
  const { selected, choose } = useStudioApp();
  const work = portfolio.find(item => item.id === selected.workId);
  if (!work) return null;
  return <aside className="saved-reference container" aria-label="Сохранённый дизайн"><span><Icon name="heart" size={18} />Ваш выбор: <strong>{work.title}</strong>{work.demo && <small>демо</small>}</span><div><BookingButton className="text-button">К записи</BookingButton><button className="icon-button" aria-label="Убрать выбранный дизайн" onClick={() => choose({})}><Icon name="close" size={17} /></button></div></aside>;
}
