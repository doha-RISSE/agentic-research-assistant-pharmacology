import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extractCitedFilenames,
  parseInlineSegments,
  parseMarkdownBlocks
} from './markdownParser';
import {
  findMatchingDocuments,
  getDocumentByFilename,
  runPharmacologicalSearch,
  validateQuestion
} from './searchAgent';

test('validateQuestion rejects empty and overly short queries', () => {
  assert.ok(validateQuestion(''));
  assert.ok(validateQuestion('   '));
  assert.ok(validateQuestion('abc'));
  assert.equal(validateQuestion('Apixaban posologie'), null);
});

test('runPharmacologicalSearch handles default comparative query as in_scope with citations', () => {
  const result = runPharmacologicalSearch(
    'Explique les différences entre anticoagulant, antiagrégant plaquettaire et thrombolytique.',
    new Date('2026-11-13T10:15:00Z')
  );

  assert.equal(result.scope, 'in_scope');
  assert.equal(result.statusLabel, 'Terminé — périmètre : in_scope');
  assert.ok(result.citedFiles.includes('dailymed-apixaban.md'));
  assert.ok(result.citedFiles.includes('has-antithrombotiques.md'));
  assert.ok(result.markdownAnswer.includes('### Rôle dans la formation d\'un thrombus'));
  assert.ok(result.disclaimer.includes('Avertissement médical'));
});

test('runPharmacologicalSearch classifies unrelated queries as out_of_scope', () => {
  const result = runPharmacologicalSearch(
    'Quel est le protocole de chimiothérapie pour le mélanome ?',
    new Date('2026-11-13T10:15:00Z')
  );

  assert.equal(result.scope, 'out_of_scope');
  assert.equal(result.statusLabel, 'Terminé — périmètre : out_of_scope');
  assert.deepEqual(result.citedFiles, []);
});

test('findMatchingDocuments prioritizes relevant corpus files', () => {
  const docs = findMatchingDocuments('Risques hémorragiques du clopidogrel avec oméprazole');
  assert.ok(docs.length > 0);
  assert.equal(docs[0].filename, 'ansm-clopidogrel.md');
  assert.ok(getDocumentByFilename('dailymed-apixaban.md'));
});

test('markdownParser extracts headings, lists, bold spans, and citations', () => {
  const sample = [
    '### Rôle dans la formation',
    'Texte avec **emphase** et [dailymed-apixaban.md].',
    '',
    '- Point un [ema-alteplase.md]'
  ].join('\n');

  const blocks = parseMarkdownBlocks(sample);
  assert.equal(blocks.length, 3);
  assert.equal(blocks[0].type, 'heading');
  assert.equal(blocks[1].type, 'paragraph');
  assert.equal(blocks[2].type, 'list');

  const inline = parseInlineSegments('Voir **facteur Xa** dans [dailymed-apixaban.md].');
  assert.deepEqual(inline, [
    { type: 'text', value: 'Voir ' },
    { type: 'bold', value: 'facteur Xa' },
    { type: 'text', value: ' dans ' },
    { type: 'citation', filename: 'dailymed-apixaban.md' },
    { type: 'text', value: '.' }
  ]);

  assert.deepEqual(extractCitedFilenames(sample), [
    'dailymed-apixaban.md',
    'ema-alteplase.md'
  ]);
});
