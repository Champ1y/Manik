import type { PortfolioWork, Preferences } from '../content/types';

export function filterPortfolio(works: PortfolioWork[], category: string): PortfolioWork[] {
  return category === 'all' ? [...works] : works.filter(work => work.categories.includes(category));
}

// Все заданные критерии обязательны. «Не знаю» не сужает выбор.
export function recommendWorks(works: PortfolioWork[], preferences: Preferences): PortfolioWork[] {
  return works.filter(work =>
    work.styles.includes(preferences.style) &&
    (preferences.length === 'any' || work.lengths.includes(preferences.length)) &&
    (preferences.shade === 'any' || work.shades.includes(preferences.shade))
  );
}

export function formatPrice(price?: number): string {
  return price === undefined ? 'Стоимость уточняется' : `${new Intl.NumberFormat('ru-RU').format(price)} ₽`;
}

export function formatDuration(minutes?: number): string {
  return minutes === undefined ? 'Время уточняется' : `${minutes} мин`;
}
