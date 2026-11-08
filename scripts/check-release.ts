import { publicationIssues } from '../src/lib/readiness';

if (publicationIssues.length) {
  console.error('Публичная публикация заблокирована:\n' + publicationIssues.map(issue => `  • ${issue}`).join('\n'));
  process.exitCode = 1;
} else {
  console.log('Обязательные поля заполнены. Проверьте фактическую достоверность данных по README.');
}
