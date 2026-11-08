export type Style = 'natural' | 'classic' | 'accent' | 'bold';
export type Length = 'short' | 'medium' | 'long';
export type Shade = 'nude' | 'dark' | 'light' | 'bright';

export interface PortfolioWork {
  id: string;
  title: string;
  subtitle: string;
  images: { src: string; alt: string }[];
  categories: string[];
  styles: Style[];
  lengths: Length[];
  shades: Shade[];
  serviceIds: string[];
  demo: boolean;
  price?: number;
  durationMinutes?: number;
}

export interface Preferences {
  style: Style;
  length: Length | 'any';
  shade: Shade | 'any';
}

export interface Service {
  id: string;
  title: string;
  category: string;
  description: string;
  includes: string;
  extra: string;
  price?: number;
  durationMinutes?: number;
}

export interface Location {
  id: string;
  city: string;
  region: string;
  address: string;
  hours: string;
  entrancePhoto: string;
  yandexMapsUrl: string;
  twoGisUrl: string;
  yandexReviewsUrl: string;
  twoGisReviewsUrl: string;
}

export interface Review {
  id: string;
  author: string;
  text: string;
  date: string;
  sourceLabel: string;
  sourceUrl: string;
}

export interface Diploma {
  id: string;
  title: string;
  image: string;
  year?: number;
}

export interface BookingConfig {
  provider: 'dikidi' | 'yclients' | 'custom';
  url: string;
  messengerLabel: string;
  messengerUrl: string;
}
