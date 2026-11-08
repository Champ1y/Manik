import type { PortfolioWork } from './types';

export const categories = [
  { id: 'all', label: 'Все дизайны' },
  { id: 'minimal', label: 'Минимализм' },
  { id: 'french', label: 'Френч' },
  { id: 'solid', label: 'Однотонное' },
  { id: 'design', label: 'Дизайн' },
  { id: 'nude', label: 'Нюд' },
  { id: 'bright', label: 'Яркий' },
];

// Это графические образцы, а не фотографии выполненных работ.
export const portfolio: PortfolioWork[] = [
  { id: 'soft-nude', title: 'Тихая нежность', subtitle: 'Пудровый нюд · мягкий квадрат', images: [{ src: '/images/nude.svg', alt: 'Демонстрационный образец пудрового нюдового покрытия' }], categories: ['nude', 'minimal', 'solid'], styles: ['natural'], lengths: ['short', 'medium'], shades: ['nude'], serviceIds: ['gel'], demo: true },
  { id: 'milky-french', title: 'Новая классика', subtitle: 'Молочный френч · миндаль', images: [{ src: '/images/french.svg', alt: 'Демонстрационный образец молочного френча' }], categories: ['french', 'minimal'], styles: ['classic'], lengths: ['medium', 'long'], shades: ['light', 'nude'], serviceIds: ['design'], demo: true },
  { id: 'cherry', title: 'Вишнёвый акцент', subtitle: 'Глубокий бордо · короткая длина', images: [{ src: '/images/cherry.svg', alt: 'Демонстрационный образец глубокого вишнёвого покрытия' }], categories: ['solid', 'bright'], styles: ['bold', 'classic'], lengths: ['short', 'medium'], shades: ['dark', 'bright'], serviceIds: ['gel'], demo: true },
  { id: 'fine-line', title: 'Между линий', subtitle: 'Графичный акцент · светлая база', images: [{ src: '/images/line.svg', alt: 'Демонстрационный образец нюдового покрытия с тонкими линиями' }], categories: ['minimal', 'design', 'nude'], styles: ['accent', 'natural'], lengths: ['short', 'medium'], shades: ['nude', 'light'], serviceIds: ['design'], demo: true },
  { id: 'olive', title: 'Оливковая пауза', subtitle: 'Приглушённый зелёный · миндаль', images: [{ src: '/images/olive.svg', alt: 'Демонстрационный образец оливкового покрытия' }], categories: ['solid', 'design'], styles: ['accent'], lengths: ['medium', 'long'], shades: ['dark'], serviceIds: ['gel'], demo: true },
  { id: 'pink', title: 'В своём цвете', subtitle: 'Яркий розовый · мягкий квадрат', images: [{ src: '/images/pink.svg', alt: 'Демонстрационный образец яркого розового покрытия' }], categories: ['bright', 'solid'], styles: ['bold'], lengths: ['short', 'medium'], shades: ['bright'], serviceIds: ['gel'], demo: true },
];
