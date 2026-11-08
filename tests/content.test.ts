import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { portfolio, categories } from '../src/content/portfolio';
import { services, serviceCategories } from '../src/content/services';

test('all work ids are unique and suitable for static URLs', () => {
  assert.equal(new Set(portfolio.map(work => work.id)).size, portfolio.length);
  for (const work of portfolio) assert.match(work.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
});

test('preliminary catalogue contains 16 unconfirmed services without invented prices, duration or ids', () => {
  assert.equal(services.length, 16);
  assert.equal(new Set(services.map(service => service.id)).size, 16);
  for (const service of services) {
    assert.equal(service.confirmed, false);
    assert.equal(service.price, undefined);
    assert.equal(service.durationMinutes, undefined);
    assert.ok(serviceCategories.includes(service.category));
  }
});
test('portfolio refers to existing images, categories, and services', () => {
  for (const work of portfolio) {
    assert.ok(work.images.length, work.id);
    for (const image of work.images) { assert.ok(image.alt); assert.ok(existsSync(resolve('public', '.' + image.src)), image.src); }
    for (const category of work.categories) assert.ok(categories.some(item => item.id === category), category);
    for (const serviceId of work.serviceIds) assert.ok(services.some(item => item.id === serviceId), serviceId);
  }
});
