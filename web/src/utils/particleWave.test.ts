import assert from 'node:assert/strict';
import test from 'node:test';
import { computePinchedWavePoint, generateParticleSeeds } from './particleWave.ts';

test('generateParticleSeeds creates deterministic particle array with bounded coordinates', () => {
  const first = generateParticleSeeds(100, 1234);
  const second = generateParticleSeeds(100, 1234);

  assert.equal(first.length, 100);
  assert.deepEqual(first, second);

  for (const p of first) {
    assert.ok(p.x >= 0 && p.x <= 1);
    assert.ok(p.radius > 0);
    assert.ok(p.colorIndex >= 0 && p.colorIndex <= 2);
  }
});

test('computePinchedWavePoint narrows vertical envelope near the focal pinch throat', () => {
  const width = 1440;
  const height = 900;

  const topAtLeft = computePinchedWavePoint(0.1, 1, 0, 0, true, 0, width, height, 0, 0, 0);
  const bottomAtLeft = computePinchedWavePoint(0.1, -1, 0, 0, true, 0, width, height, 0, 0, 0);
  const spreadLeft = Math.abs(topAtLeft.py - bottomAtLeft.py);

  const topAtThroat = computePinchedWavePoint(0.68, 1, 0, 0, true, 0, width, height, 0, 0, 0);
  const bottomAtThroat = computePinchedWavePoint(0.68, -1, 0, 0, true, 0, width, height, 0, 0, 0);
  const spreadThroat = Math.abs(topAtThroat.py - bottomAtThroat.py);

  assert.ok(spreadThroat < spreadLeft * 0.4, `Expected pinched throat (${spreadThroat}) < 40% of left spread (${spreadLeft})`);
  assert.ok(topAtThroat.alphaScale >= topAtLeft.alphaScale);
});
