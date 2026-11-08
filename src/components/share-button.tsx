'use client';

import { useState } from 'react';
import { Icon } from './icon';
import { track } from '@/lib/analytics';

export function ShareButton({ title, path, label = 'Поделиться' }: { title: string; path: string; label?: string }) {
  const [status, setStatus] = useState('');
  const [fallback, setFallback] = useState('');
  async function share() {
    const url = new URL(path, window.location.origin).toString();
    track('share_click', { path });
    try {
      if (navigator.share) { await navigator.share({ title, url }); setStatus('Открыто меню отправки'); }
      else { await navigator.clipboard.writeText(url); setStatus('Ссылка скопирована'); }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      setFallback(url); setStatus('Выделите и скопируйте ссылку');
    }
  }
  return <div className="share-control"><button className="text-button" onClick={share}><Icon name="share" size={17} />{label}</button><span className="status" role="status">{status}</span>{fallback && <input className="copy-input" aria-label="Ссылка для копирования" readOnly value={fallback} onFocus={event => event.target.select()} />}</div>;
}
