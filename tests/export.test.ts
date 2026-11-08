import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname, basename, resolve } from 'node:path';
import { normalizeExport } from '../scripts/normalize-export.mjs';

async function cleanupTemporaryExport(directory: string) {
  const target = resolve(directory);
  assert.equal(dirname(target), resolve(tmpdir()));
  assert.ok(basename(target).startsWith('manic-export-'));
  await rm(target, { recursive: true, force: true });
}

test('Windows nested static segments receive canonical browser-request filenames', async () => {
  const root = await mkdtemp(join(tmpdir(), 'manic-export-'));
  try {
    const segments = join(root, 'portfolio', 'synthetic', '__next.portfolio', '$d$id');
    await mkdir(segments, { recursive: true });
    await writeFile(join(segments, '__PAGE__.txt'), 'synthetic flight response');
    assert.equal(await normalizeExport(root), 1);
    assert.equal(await readFile(join(root, 'portfolio', 'synthetic', '__next.portfolio.$d$id.__PAGE__.txt'), 'utf8'), 'synthetic flight response');
    assert.equal(await readFile(join(segments, '__PAGE__.txt'), 'utf8'), 'synthetic flight response');
  } finally { await cleanupTemporaryExport(root); }
});

test('flat exports and unrelated nested files are left intact', async () => {
  const root = await mkdtemp(join(tmpdir(), 'manic-export-'));
  try {
    await mkdir(join(root, 'licenses'));
    await writeFile(join(root, '__next._tree.txt'), 'tree');
    await writeFile(join(root, 'licenses', 'sample.txt'), 'license');
    assert.equal(await normalizeExport(root), 0);
    assert.equal(await readFile(join(root, '__next._tree.txt'), 'utf8'), 'tree');
    assert.equal(await readFile(join(root, 'licenses', 'sample.txt'), 'utf8'), 'license');
  } finally { await cleanupTemporaryExport(root); }
});
