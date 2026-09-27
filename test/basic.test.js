import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('survey app contains no Ensenada Flow title priming', () => {
  const html = fs.readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');
  assert.equal(/Ensenada Flow/i.test(html), false);
});

test('worker has anonymous CSV export guarded by bearer token', () => {
  const src = fs.readFileSync(new URL('../src/index.js', import.meta.url), 'utf8');
  assert.match(src, /authorization/);
  assert.match(src, /export\.csv/);
});
