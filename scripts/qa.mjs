import { spawn } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createWriteStream } from 'node:fs';
import { createRequire } from 'node:module';

const mode = process.argv[2] || 'quick';
const latestPath = '.artifacts/qa/latest.json';
async function render(report) {
  const lines = [
    '# Результаты автоматического запуска', '',
    `Запуск: ${report.startedMoscow} (Europe/Moscow). Режим: ${report.mode}.`,
    `Окружение: ${report.platform}, Node ${report.node}. Статус: **${report.status}**.`, '',
    '| Этап | Статус | Секунды | Лог |', '| --- | --- | ---: | --- |',
    ...report.stages.map(stage => `| ${stage.name} | ${stage.status} | ${stage.seconds} | ${stage.log} |`), '',
  ];
  if (report.browser) lines.push(`Playwright: PASS ${report.browser.expected}; FAIL ${report.browser.unexpected}; flaky ${report.browser.flaky}; skipped ${report.browser.skipped}.`, '');
  if (report.unit) lines.push(`Unit: всего ${report.unit.total}; PASS ${report.unit.passed}; FAIL ${report.unit.failed}.`, '');
  lines.push(`Артефакты: \`${report.directory}\`. HTML: \`${report.directory}/browser/html/index.html\`.`, '',
    'Это результаты выполненных команд. Не являются подтверждением дизайна или работоспособности внешней записи.',
    'Ограничения и ручной анализ: [QA_REPORT.md](QA_REPORT.md).', '');
  await writeFile('docs/QA_RESULTS.md', lines.join('\n'));
  await writeFile('.artifacts/qa/latest.md', lines.join('\n'));
}
if (mode === 'open') {
  try {
    const report = JSON.parse(await readFile(latestPath, 'utf8'));
    const require = createRequire(import.meta.url);
    const child = spawn(process.execPath, [require.resolve('@playwright/test/cli'), 'show-report', resolve(report.directory, 'browser/html')], { stdio: 'inherit', windowsHide: true });
    child.on('error', error => { console.error(error); process.exitCode = 1; });
    child.on('exit', code => { process.exitCode = code ?? 1; });
  } catch (error) { console.error('Run npm run test:quick or test:full first.', error.message); process.exitCode = 1; }
} else if (mode === 'report') {
  try { const report = JSON.parse(await readFile(latestPath, 'utf8')); await render(report); console.log('docs/QA_RESULTS.md'); }
  catch (error) { console.error('No completed QA run found. Run npm run test:quick or test:full first.', error.message); process.exitCode = 1; }
} else {
  if (!['quick', 'full'].includes(mode)) throw new Error(`Unknown QA mode: ${mode}`);
  const directory = `.artifacts/qa/${new Date().toISOString().replace(/[:.]/g, '-')}-${mode}`;
  await mkdir(directory, { recursive: true });
  await mkdir('docs', { recursive: true });
  const report = {
    mode, directory, startedMoscow: new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' }),
    platform: process.platform, node: process.version, status: 'RUNNING', stages: [],
  };
  const steps = mode === 'full' ? [['lint', ['run', 'lint']], ['types', ['run', 'typecheck']]] : [];
  steps.push(['unit', ['test']], ['browser', ['exec', '--', 'playwright', 'test', ...(mode === 'quick' ? ['--project=chromium', '--grep', '@smoke'] : [])]]);
  const npmCli = process.env.npm_execpath;
  if (!npmCli) throw new Error('Use npm run test:quick / test:full so the current npm executable is used.');
  for (const [name, args] of steps) {
    console.log(`\nQA ${name}: npm ${args.join(' ')}`);
    const started = Date.now();
    const log = `${directory}/${name}.log`;
    const stream = createWriteStream(log);
    const code = await new Promise(done => {
      const child = spawn(process.execPath, [npmCli, ...args], { env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1', QA_ARTIFACT_DIR: resolve(directory, 'browser') }, windowsHide: true });
      child.stdout.on('data', data => { process.stdout.write(data); stream.write(data); });
      child.stderr.on('data', data => { process.stderr.write(data); stream.write(data); });
      child.on('error', error => { stream.write(error.stack); done(1); });
      child.on('close', code => done(code ?? 1));
    });
    await new Promise(done => stream.end(done));
    report.stages.push({ name, status: code === 0 ? 'PASS' : 'FAIL', exitCode: code, seconds: Math.round((Date.now() - started) / 1000), log });
    // Continue independent stages after failure to retain a complete diagnostic report.
  }
  try { report.browser = JSON.parse(await readFile(`${directory}/browser/results.json`, 'utf8')).stats; } catch { /* Server or tool startup failure is recorded in the log. */ }
  const unitLog = await readFile(`${directory}/unit.log`, 'utf8');
  const count = name => Number(unitLog.match(new RegExp(`(?:^|\\n)[^\\n]*\\b${name}\\s+(\\d+)(?:\\r?\\n|$)`))?.[1] ?? NaN);
  if (Number.isFinite(count('tests'))) report.unit = { total: count('tests'), passed: count('pass'), failed: count('fail') };
  report.status = report.stages.every(stage => stage.status === 'PASS') ? 'PASS' : 'FAIL';
  await writeFile(`${directory}/summary.json`, JSON.stringify(report, null, 2));
  await writeFile(latestPath, JSON.stringify(report, null, 2));
  await render(report);
  console.log(`\nQA ${report.status}. Results: docs/QA_RESULTS.md; ${directory}`);
  process.exitCode = report.status === 'PASS' ? 0 : 1;
}
