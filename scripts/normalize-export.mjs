import { readdir, copyFile } from 'node:fs/promises';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

// Next 16.4 exports segment keys with Windows separators, but the router
// requests __next.segment.child.txt. Keep the exported files and add the
// canonical flat filenames so both local preview and static hosting work.
export async function normalizeExport(directory) {
  const root = resolve(directory);
  const copies = [];
  async function walk(current) {
    for (const entry of await readdir(current, { withFileTypes: true })) {
      const source = join(current, entry.name);
      if (entry.isDirectory()) await walk(source);
      else if (entry.isFile() && entry.name.endsWith('.txt')) {
        const parts = relative(root, source).split(sep);
        const start = parts.findIndex(part => part.startsWith('__next.'));
        if (start !== -1 && start < parts.length - 1) {
          copies.push({ source, target: join(root, ...parts.slice(0, start), parts.slice(start).join('.')) });
        }
      }
    }
  }
  await walk(root);
  for (const { source, target } of copies) {
    if (dirname(source) === dirname(target)) continue;
    await copyFile(source, target);
  }
  return copies.length;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  normalizeExport('out').then(count => console.log(`Static export: normalized ${count} segment filenames.`)).catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
}
