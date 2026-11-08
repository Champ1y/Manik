import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const child = spawn(process.execPath, [require.resolve('@playwright/test/cli'), 'test', '--project=webkit', '--grep', 'reference survives', '--repeat-each=10'], {
  env: { ...process.env, QA_RELOAD_DURING_PREFETCH: '1', QA_ARTIFACT_DIR: '.artifacts/webkit-reload-stress' },
  stdio: 'inherit', windowsHide: true,
});
child.on('error', error => { console.error(error); process.exitCode = 1; });
child.on('exit', code => { process.exitCode = code ?? 1; });
