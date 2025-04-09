export type BlockType = 'L' | 'T' | 'I' | 'O' | 'Z' | 'S';

export interface Block {
  type: BlockType;
  cells: [number, number][]; // [row, col] coordinates
  color: string;
}

export interface GridCell {
  color: string;
  type: BlockType;
}

export interface GameState {
  grid: (GridCell | null)[][]; // null for empty, GridCell for filled
  currentBlocks: Block[];
  score: number;
  gameOver: boolean;
  combo: number;
}

export interface GridPosition {
  row: number;
  col: number;
}

export const GRID_SIZE = 8;
export const BLOCK_COLORS = [
  '#FF5252', // Red
  '#4CAF50', // Green
  '#2196F3', // Blue
  '#FFC107', // Yellow
  '#9C27B0', // Purple
  '#FF9800', // Orange
];

export const BLOCK_SHAPES: Record<BlockType, [number, number][]> = {
  'L': [[0,0], [1,0], [2,0], [2,1]],
  'T': [[0,1], [1,0], [1,1], [1,2]],
  'I': [[0,0], [1,0], [2,0], [3,0]],
  'O': [[0,0], [0,1], [1,0], [1,1]],
  'Z': [[0,0], [0,1], [1,1], [1,2]],
  'S': [[0,1], [0,2], [1,0], [1,1]],
}; 