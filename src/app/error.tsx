'use client';

import Link from 'next/link';

export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main id="main" className="empty-page container"><span className="eyebrow">Что-то пошло не так</span><h1>Давайте попробуем<br /><em>ещё раз.</em></h1><p>Не удалось отобразить страницу.</p><button className="button button-primary" onClick={reset}>Повторить</button><Link className="text-button" href="/">На главную</Link></main>;
}
