import type { Location } from './types';

export const contacts = { phone: '', phoneLabel: '', telegramUrl: '', vkUrl: '' };

// Добавление второй реальной локации не требует изменения компонентов.
export const locations: Location[] = [{
  id: 'ramenskoe', city: 'Раменское', region: 'Московская область',
  address: '', hours: '', entrancePhoto: '',
  yandexMapsUrl: '', twoGisUrl: '', yandexReviewsUrl: '', twoGisReviewsUrl: '',
}];
