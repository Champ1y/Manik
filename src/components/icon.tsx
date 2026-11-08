import type { CSSProperties } from 'react';

const paths = {
  arrow: 'M5 12h14M13 6l6 6-6 6',
  diagonal: 'M6 18 18 6M6 6h12v12',
  close: 'm6 6 12 12M6 18 18 6',
  menu: 'M4 7h16M4 12h16M4 17h16',
  spark: 'm12 3 2.6 6.4L21 12l-6.4 2.6L12 21l-2.6-6.4L3 12l6.4-2.6L12 3Z',
  pin: 'M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0ZM15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  clock: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM12 7v5l3 2',
  check: 'm5 12 4 4L19 6',
  copy: 'M9 9h12v12H9zM15 5V3H3v12h2',
  share: 'M12 16V3m-5 5 5-5 5 5M5 13v8h14v-8',
  heart: 'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z',
  plus: 'M12 5v14M5 12h14',
  back: 'M19 12H5m6 6-6-6 6-6',
  message: 'M21 11.5a9 9 0 0 1-9 9 10 10 0 0 1-4-.9L3 21l1.4-5A9 9 0 1 1 21 11.5Z',
  phone: 'm7 3 3 5-2 2c1 3 3 5 6 6l2-2 5 3-1 4C10 23 1 14 3 4l4-1Z',
  leaf: 'M20 3C9 2 3 7 4 14c0 4 4 7 8 5 6-3 8-10 8-16ZM4 21 15 10',
};

export function Icon({ name, size = 20, style }: { name: keyof typeof paths; size?: number; style?: CSSProperties }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={style}><path d={paths[name]} /></svg>;
}
