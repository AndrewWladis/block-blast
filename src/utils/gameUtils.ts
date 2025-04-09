import { Block, GRID_SIZE } from '../types/game';

export const canPlaceBlock = (grid: (string | null)[][], block: Block, position: { row: number; col: number }): boolean => {
  return block.cells.every(([dr, dc]) => {
    const r = position.row + dr;
    const c = position.col + dc;
    return r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE && grid[r][c] === null;
  });
}; 