'use client';

import type { ReactNode } from 'react';
import { track, type AnalyticsEvent } from '@/lib/analytics';

export function TrackedLink({ href, event, children, className, external = false }: { href: string; event: AnalyticsEvent; children: ReactNode; className?: string; external?: boolean }) {
  return <a href={href} className={className} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined} onClick={() => track(event)}>{children}</a>;
}
