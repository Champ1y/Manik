'use client';

import { useEffect, useId, useRef, type ReactNode } from 'react';
import { Icon } from './icon';

export function Dialog({ title, onClose, children, className = '' }: { title: string; onClose: () => void; children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { dialog?.close(); document.body.style.overflow = previous; };
  }, []);
  return <dialog ref={ref} aria-labelledby={id} className={`dialog ${className}`} onCancel={onClose} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="dialog-inner">
      <div className="dialog-heading"><h2 id={id}>{title}</h2><button type="button" className="icon-button" aria-label="Закрыть окно" onClick={onClose}><Icon name="close" /></button></div>
      {children}
    </div>
  </dialog>;
}
