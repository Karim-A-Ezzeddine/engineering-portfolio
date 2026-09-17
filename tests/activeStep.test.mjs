import assert from 'node:assert/strict';
import test from 'node:test';
import { activeStepAtLine } from '../src/story/activeStep.ts';

const bounds = [
  { top: -100, bottom: 500 },
  { top: 500, bottom: 1100 },
  { top: 1100, bottom: 1700 },
];

test('keeps the first step before the story enters the trigger line', () => {
  assert.equal(activeStepAtLine(bounds, -200), 0);
});

test('moves exactly once at a shared boundary', () => {
  assert.equal(activeStepAtLine(bounds, 499.9, 0, 0), 0);
  assert.equal(activeStepAtLine(bounds, 500, 0, 0), 1);
  assert.equal(activeStepAtLine(bounds, 500.1, 0, 0), 1);
});

test('forward and reverse traversal select the corresponding visual step', () => {
  const forward = [0, 200, 499, 500, 800, 1100, 1500].map((line) => activeStepAtLine(bounds, line, 0, 0));
  assert.deepEqual(forward, [0, 0, 0, 1, 1, 2, 2]);
  assert.deepEqual([...forward].reverse(), [2, 2, 1, 1, 0, 0, 0]);
});

test('clamps fast jumps to the nearest completed step', () => {
  assert.equal(activeStepAtLine(bounds, 1800, 0), 2);
  assert.equal(activeStepAtLine(bounds, 250, 2), 0);
  assert.equal(activeStepAtLine([], 250), 0);
});

test('holds the current step inside the forward and reverse dead band', () => {
  const nearForward = [{ top: -100, bottom: 498 }, { top: 496, bottom: 1100 }];
  const nearReverse = [{ top: -100, bottom: 506 }, { top: 506, bottom: 1100 }];

  assert.equal(activeStepAtLine(nearForward, 500, 0, 8), 0);
  assert.equal(activeStepAtLine(nearReverse, 500, 1, 8), 1);
  assert.equal(activeStepAtLine([{ top: -100, bottom: 490 }, { top: 490, bottom: 1100 }], 500, 0, 8), 1);
  assert.equal(activeStepAtLine([{ top: -100, bottom: 510 }, { top: 510, bottom: 1100 }], 500, 1, 8), 0);
});
