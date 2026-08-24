import { describe, expect, it } from 'vitest';
import { resolveDropIndex } from './resolve-drop-index.util';

// Four equal-height (60px) slots stacked with no gap, tops at 0/60/120/180.
const EQUAL_SLOTS = [
  { top: 0, height: 60 },
  { top: 60, height: 60 },
  { top: 120, height: 60 },
  { top: 180, height: 60 },
];

describe('resolveDropIndex', () => {
  it('resolves to its own slot when there is no movement', () => {
    // Dragged item started as slot 1 (top 60, height 60); offset 0.
    expect(resolveDropIndex(EQUAL_SLOTS, 60, 60, 0)).toBe(1);
  });

  it('stays in place for small movements that do not cross a neighboring midpoint', () => {
    // Slot 1's own midpoint is 90; moving 10px down keeps the center at 100,
    // still short of slot 2's midpoint (150), so it should not jump yet.
    expect(resolveDropIndex(EQUAL_SLOTS, 60, 60, 10)).toBe(1);
  });

  it('moves to the next slot once the dragged center passes the neighbor midpoint', () => {
    // Center starts at 90 (slot 1). Slot 2's midpoint is 150 → need offset >= 60.
    expect(resolveDropIndex(EQUAL_SLOTS, 60, 60, 60)).toBe(2);
  });

  it('moves up a slot when dragged past the previous neighbor midpoint', () => {
    // Dragged item starts as slot 2 (top 120, height 60), center 150.
    // Slot 1's midpoint is 90 → need offset <= -60.
    expect(resolveDropIndex(EQUAL_SLOTS, 120, 60, -60)).toBe(1);
  });

  it('clamps to the first slot when dragged above the list', () => {
    expect(resolveDropIndex(EQUAL_SLOTS, 60, 60, -10000)).toBe(0);
  });

  it('clamps to the last slot when dragged below the list', () => {
    expect(resolveDropIndex(EQUAL_SLOTS, 60, 60, 10000)).toBe(3);
  });

  it('handles variable-height slots (multi-line text wrapping differently)', () => {
    const variableSlots = [
      { top: 0, height: 40 },
      { top: 40, height: 90 }, // a taller, two-line item
      { top: 130, height: 40 },
    ];
    // Dragged item is slot 0 (top 0, height 40, center 20).
    // Slot 1's midpoint is 40 + 45 = 85 → need offset >= 65 to cross it.
    expect(resolveDropIndex(variableSlots, 0, 40, 60)).toBe(0);
    expect(resolveDropIndex(variableSlots, 0, 40, 70)).toBe(1);
  });

  it('handles a single-item list', () => {
    expect(resolveDropIndex([{ top: 0, height: 60 }], 0, 60, 500)).toBe(0);
  });
});
