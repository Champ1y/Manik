import { test } from 'node:test';
import assert from 'node:assert/strict';
import { releaseIssues, type ReleaseContent } from '../src/lib/release';
import { publicationIssues, isPublishable } from '../src/lib/readiness';
import { portfolio } from '../src/content/portfolio';
import { locations } from '../src/content/contacts';

// Pure synthetic fixture used only in tests, never exposed as studio content.
const ready: ReleaseContent = {
  studio: { demo: false, brand: 'test', masterName: 'test', biography: 'test', education: 'test', portrait: '/test.webp', sanitation: 'test' },
  seo: { siteUrl: 'https://example.ru', legal: { operatorName: 'test', contactEmail: 'test@example.ru', policyReviewed: true } },
  contacts: { phone: '+79999999999' },
  locations: [{ ...locations[0], address: 'test', hours: 'test', yandexMapsUrl: 'https://yandex.ru/maps/', twoGisUrl: 'https://2gis.ru/' }],
  booking: { provider: 'dikidi', url: 'https://dikidi.ru/test', messengerLabel: '', messengerUrl: '' },
  portfolio: [{ ...portfolio[0], demo: false }], diplomas: [{ id: 'test', title: 'test', image: '/test.webp' }], reviews: [],
  analytics: { enabled: false, yandexMetrikaId: '', legalReady: false, requireConsent: true },
};
test('unfinished demo is blocked from publishing and indexing', () => {
  assert.equal(isPublishable, false);
  assert.ok(publicationIssues.length > 5);
  assert.ok(publicationIssues.some(issue => issue.includes('онлайн') || issue.includes('записи')));
});
test('complete fields allow release check without inventing reviews', () => {
  assert.deepEqual(releaseIssues(ready), []);
});
test('unreviewed privacy policy prevents release', () => {
  assert.ok(releaseIssues({ ...ready, seo: { ...ready.seo, legal: { ...ready.seo.legal, policyReviewed: false } } }).length);
});
test('demo work still blocks release even after disabling demo flag', () => {
  assert.ok(releaseIssues({ ...ready, portfolio }).some(issue => issue.includes('демонстрационные')));
});
test('analytics cannot be enabled without legal readiness and valid counter', () => {
  assert.ok(releaseIssues({ ...ready, analytics: { ...ready.analytics, enabled: true } }).some(issue => issue.includes('Метрики')));
});
test('missing contact or location blocks release', () => {
  assert.ok(releaseIssues({ ...ready, contacts: { phone: '' }, locations: [] }).length >= 2);
});
