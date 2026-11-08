import { test } from 'node:test';
import assert from 'node:assert/strict';
import { portfolio } from '../src/content/portfolio';
import { filterPortfolio, recommendWorks, formatPrice, formatDuration } from '../src/lib/portfolio';

test('all category returns all works without mutating the source', () => {
  const result = filterPortfolio(portfolio, 'all');
  assert.deepEqual(result, portfolio);
  assert.notEqual(result, portfolio);
});
test('category filters by exact tag', () => {
  assert.deepEqual(filterPortfolio(portfolio, 'french').map(work => work.id), ['milky-french']);
  assert.equal(filterPortfolio(portfolio, 'missing').length, 0);
});
test('natural short nude matches all three criteria', () => {
  assert.deepEqual(recommendWorks(portfolio, { style: 'natural', length: 'short', shade: 'nude' }).map(work => work.id), ['soft-nude', 'fine-line']);
});
test('any length and shade do not restrict matching', () => {
  assert.deepEqual(recommendWorks(portfolio, { style: 'bold', length: 'any', shade: 'any' }).map(work => work.id), ['cherry', 'pink']);
});
test('conflicting choices produce an honest empty result', () => {
  assert.deepEqual(recommendWorks(portfolio, { style: 'natural', length: 'long', shade: 'bright' }), []);
});
test('length criteria exclude otherwise matching work', () => {
  assert.deepEqual(recommendWorks(portfolio, { style: 'classic', length: 'long', shade: 'light' }).map(work => work.id), ['milky-french']);
});
test('missing costs and durations are never invented', () => {
  assert.equal(formatPrice(), 'Стоимость уточняется');
  assert.equal(formatDuration(), 'Время уточняется');
  assert.equal(formatDuration(90), '90 мин');
  assert.match(formatPrice(2000), /2\s000 ₽/);
});
