export default function Loading() {
  return <main id="main" className="container loading-page" aria-busy="true"><span className="eyebrow" role="status">Собираем маленькие детали…</span><div className="skeleton skeleton-title" /><div className="portfolio-grid">{[1, 2, 3].map(number => <div key={number} className="skeleton skeleton-card" />)}</div></main>;
}
