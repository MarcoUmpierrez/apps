import { adjacentIndices, createSolvedTiles } from './sliding-tile-puzzle.component';

/** Safety valves so a hint request can never hang the UI thread — if a
 * solution isn't found within budget, findHintMoveIndex just returns null
 * and no tile gets highlighted, same "advisory only" fallback used
 * everywhere else in the hunt. */
const MAX_EXPANSIONS = 200_000;
const MAX_SEARCH_MS = 200;

function manhattanDistance(tiles: readonly number[], gridSize: number): number {
  let total = 0;
  for (let i = 0; i < tiles.length; i++) {
    const value = tiles[i];
    if (value === 0) continue;
    const homeIndex = value - 1;
    total +=
      Math.abs(Math.floor(i / gridSize) - Math.floor(homeIndex / gridSize)) +
      Math.abs((i % gridSize) - (homeIndex % gridSize));
  }
  return total;
}

interface SearchNode {
  tiles: readonly number[];
  blankIndex: number;
  g: number;
  /** Board index tapped on the very first move away from the root state. */
  firstMove: number;
}

/** Binary min-heap keyed by f = g + h, so the cheapest-looking node expands next. */
class MinHeap {
  private readonly items: { f: number; node: SearchNode }[] = [];

  get size(): number {
    return this.items.length;
  }

  push(item: { f: number; node: SearchNode }): void {
    const items = this.items;
    items.push(item);
    let i = items.length - 1;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (items[parent].f <= items[i].f) break;
      [items[parent], items[i]] = [items[i], items[parent]];
      i = parent;
    }
  }

  pop(): { f: number; node: SearchNode } | undefined {
    const items = this.items;
    const top = items[0];
    const last = items.pop();
    if (items.length > 0 && last) {
      items[0] = last;
      let i = 0;
      for (;;) {
        const left = 2 * i + 1;
        const right = 2 * i + 2;
        let smallest = i;
        if (left < items.length && items[left].f < items[smallest].f) smallest = left;
        if (right < items.length && items[right].f < items[smallest].f) smallest = right;
        if (smallest === i) break;
        [items[i], items[smallest]] = [items[smallest], items[i]];
        i = smallest;
      }
    }
    return top;
  }
}

/**
 * A* search (Manhattan-distance heuristic) for the board index the player
 * should tap next to make progress toward the solved state. Returns null if
 * already solved or no solution is found within the search budget.
 */
export function findHintMoveIndex(tiles: readonly number[], gridSize: number): number | null {
  const goalKey = createSolvedTiles(gridSize).join(',');
  const startKey = tiles.join(',');
  if (startKey === goalKey) return null;

  const heap = new MinHeap();
  const bestG = new Map<string, number>([[startKey, 0]]);
  heap.push({
    f: manhattanDistance(tiles, gridSize),
    node: { tiles, blankIndex: tiles.indexOf(0), g: 0, firstMove: -1 },
  });

  const deadline = Date.now() + MAX_SEARCH_MS;
  let expansions = 0;

  while (heap.size > 0) {
    if (++expansions > MAX_EXPANSIONS || Date.now() > deadline) return null;

    const current = heap.pop();
    if (!current) break;
    const { node } = current;
    const key = node.tiles.join(',');
    if (key === goalKey) return node.firstMove;
    if ((bestG.get(key) ?? Infinity) < node.g) continue;

    for (const neighbor of adjacentIndices(node.blankIndex, gridSize)) {
      const nextTiles = [...node.tiles];
      [nextTiles[node.blankIndex], nextTiles[neighbor]] = [
        nextTiles[neighbor],
        nextTiles[node.blankIndex],
      ];
      const nextKey = nextTiles.join(',');
      const nextG = node.g + 1;
      if (nextG < (bestG.get(nextKey) ?? Infinity)) {
        bestG.set(nextKey, nextG);
        heap.push({
          f: nextG + manhattanDistance(nextTiles, gridSize),
          node: {
            tiles: nextTiles,
            blankIndex: neighbor,
            g: nextG,
            firstMove: node.firstMove === -1 ? neighbor : node.firstMove,
          },
        });
      }
    }
  }

  return null;
}
