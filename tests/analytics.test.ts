import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { analytics } from '../src/content/seo';
import { track, readUtm } from '../src/lib/analytics';

const original = { ...analytics };
// Restore globals/configuration after each test so watch reruns stay isolated.
afterEach(() => {
  Object.assign(analytics, original);
  Reflect.deleteProperty(globalThis, 'window');
  Reflect.deleteProperty(globalThis, 'localStorage');
});

function browser(search = '', consent = 'accepted') {
  const calls: unknown[][] = [];
  Object.defineProperty(globalThis, 'window', { configurable: true, value: { location: { search }, ym: (...args: unknown[]) => calls.push(args) } });
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: () => consent } });
  return calls;
}

test('analytics does nothing during server rendering', () => {
  assert.doesNotThrow(() => track('booking_click'));
  assert.deepEqual(readUtm(), {});
});

test('analytics requires enablement, legal readiness, consent and a numeric id', () => {
  const calls = browser();
  Object.assign(analytics, { enabled: true, legalReady: true, yandexMetrikaId: '123456' });
  for (const settings of [{ enabled: false }, { legalReady: false }, { yandexMetrikaId: 'invalid' }]) {
    Object.assign(analytics, { enabled: true, legalReady: true, yandexMetrikaId: '123456' }, settings);
    track('booking_click');
    assert.deepEqual(calls, []);
  }
  Object.assign(analytics, { enabled: true, legalReady: true, yandexMetrikaId: '123456' });
  track('work_select', { work_id: 'synthetic-reference' });
  assert.deepEqual(calls, [[123456, 'reachGoal', 'work_select', { work_id: 'synthetic-reference' }]]);
});

test('rejected, missing or inaccessible consent prevents event delivery', () => {
  Object.assign(analytics, { enabled: true, legalReady: true, yandexMetrikaId: '123456' });
  for (const consent of ['', 'rejected']) {
    const calls = browser('', consent);
    track('booking_click');
    assert.deepEqual(calls, []);
  }
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw new Error('Storage denied'); } });
  assert.doesNotThrow(() => track('booking_click'));
});

test('UTM whitelist truncates values, persists across navigation and returns a copy', () => {
  browser(`?utm_source=vk&utm_campaign=${'x'.repeat(150)}&phone=private&redirect=https://example.invalid`);
  const first = readUtm();
  assert.deepEqual(first, { utm_source: 'vk', utm_campaign: 'x'.repeat(120) });
  first.utm_source = 'mutated';
  window.location.search = '?utm_medium=social';
  assert.deepEqual(readUtm(), { utm_source: 'vk', utm_campaign: 'x'.repeat(120), utm_medium: 'social' });
});
