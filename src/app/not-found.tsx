import Link from 'next/link';
import { Icon } from '@/components/icon';

export default function NotFound() {
  return <main id="main" className="empty-page container"><span className="eyebrow">404 · потерялась маленькая деталь</span><h1>Такого оттенка<br /><em>здесь пока нет.</em></h1><p>Страница не найдена. Но в портфолио есть другие идеи.</p><Link href="/portfolio/" className="button button-primary">Посмотреть дизайны<Icon name="arrow" size={17} /></Link></main>;
}
