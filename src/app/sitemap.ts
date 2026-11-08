import type { MetadataRoute } from 'next';
import { portfolio } from '@/content/portfolio';
import { seo } from '@/content/seo';
import { isPublishable } from '@/lib/readiness';

export const dynamic = 'force-static';
export default function sitemap(): MetadataRoute.Sitemap {
  if (!isPublishable) return [];
  return ['', '/portfolio', '/quiz', ...portfolio.filter(work => !work.demo).map(work => `/portfolio/${work.id}`)].map(path => ({ url: `${seo.siteUrl}${path}/`, changeFrequency: 'monthly', priority: path === '' ? 1 : 0.7 }));
}
