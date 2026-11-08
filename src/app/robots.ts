import type { MetadataRoute } from 'next';
import { seo } from '@/content/seo';
import { isPublishable } from '@/lib/readiness';

export const dynamic = 'force-static';
export default function robots(): MetadataRoute.Robots {
  return isPublishable ? { rules: { userAgent: '*', allow: '/', disallow: '/privacy/' }, sitemap: `${seo.siteUrl}/sitemap.xml` } : { rules: { userAgent: '*', disallow: '/' } };
}
