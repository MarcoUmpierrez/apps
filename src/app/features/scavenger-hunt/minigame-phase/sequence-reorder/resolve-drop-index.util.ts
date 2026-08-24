export interface SlotRect {
  top: number;
  height: number;
}

/**
 * Given the fixed layout slots measured once at drag start, works out which
 * slot the dragged item's current center overlaps — i.e. the index it would
 * land in if dropped right now. `draggedTop`/`draggedHeight` are the dragged
 * item's own original (pre-drag) slot, and `offsetY` is how far the pointer
 * has moved since the drag began.
 */
export function resolveDropIndex(
  slots: SlotRect[],
  draggedTop: number,
  draggedHeight: number,
  offsetY: number,
): number {
  const draggedCenter = draggedTop + draggedHeight / 2 + offsetY;

  let target = 0;
  for (let i = 0; i < slots.length; i++) {
    const slotMidpoint = slots[i].top + slots[i].height / 2;
    if (draggedCenter >= slotMidpoint) target = i;
  }
  return target;
}
