import { useState, useCallback } from 'react';
import { GameState, Block, BlockType, GRID_SIZE, BLOCK_COLORS, BLOCK_SHAPES, GridCell } from '../types/game';

const generateRandomBlock = (): Block => {
  const types: BlockType[] = ['L', 'T', 'I', 'O', 'Z', 'S'];
  const type = types[Math.floor(Math.random() * types.length)];
  const color = BLOCK_COLORS[Math.floor(Math.random() * BLOCK_COLORS.length)];
  
  return {
    type,
    cells: BLOCK_SHAPES[type],
    color,
  };
};

const generateNewBlocks = (count: number): Block[] => {
  return Array(count).fill(null).map(() => generateRandomBlock());
};

const canPlaceBlock = (grid: (GridCell | null)[][], block: Block, position: { row: number; col: number }): boolean => {
  return block.cells.every(([dr, dc]) => {
    const r = position.row + dr;
    const c = position.col + dc;
    return r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE && grid[r][c] === null;
  });
};

const placeBlock = (grid: (GridCell | null)[][], block: Block, position: { row: number; col: number }): (GridCell | null)[][] => {
  const newGrid = grid.map(row => [...row]);
  block.cells.forEach(([dr, dc]) => {
    const r = position.row + dr;
    const c = position.col + dc;
    newGrid[r][c] = {
      color: block.color,
      type: block.type,
    };
  });
  return newGrid;
};

const checkLines = (grid: (GridCell | null)[][]): { newGrid: (GridCell | null)[][]; linesCleared: number } => {
  let linesCleared = 0;
  const newGrid = grid.map(row => [...row]);
  
  // Check rows
  for (let r = 0; r < GRID_SIZE; r++) {
    if (newGrid[r].every(cell => cell !== null)) {
      newGrid[r] = Array(GRID_SIZE).fill(null);
      linesCleared++;
    }
  }
  
  // Check columns
  for (let c = 0; c < GRID_SIZE; c++) {
    if (newGrid.every(row => row[c] !== null)) {
      for (let r = 0; r < GRID_SIZE; r++) {
        newGrid[r][c] = null;
      }
      linesCleared++;
    }
  }
  
  return { newGrid, linesCleared };
};

export const useGame = () => {
  const [gameState, setGameState] = useState<GameState>({
    grid: Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null)),
    currentBlocks: generateNewBlocks(3),
    score: 0,
    gameOver: false,
    combo: 0,
  });

  const placeBlockOnGrid = useCallback((blockIndex: number, position: { row: number; col: number }) => {
    setGameState(prev => {
      if (prev.gameOver) return prev;
      
      const block = prev.currentBlocks[blockIndex];
      if (!block) return prev;
      
      if (!canPlaceBlock(prev.grid, block, position)) return prev;
      
      const newGrid = placeBlock(prev.grid, block, position);
      const { newGrid: clearedGrid, linesCleared } = checkLines(newGrid);
      
      const newScore = prev.score + (10 * block.cells.length) + (linesCleared * 50 * (prev.combo + 1));
      const newCombo = linesCleared > 0 ? prev.combo + 1 : 0;
      
      const newBlocks = [...prev.currentBlocks];
      newBlocks[blockIndex] = generateRandomBlock();
      
      // Check if game is over
      const isGameOver = newBlocks.every(block => {
        for (let r = 0; r < GRID_SIZE; r++) {
          for (let c = 0; c < GRID_SIZE; c++) {
            if (canPlaceBlock(clearedGrid, block, { row: r, col: c })) {
              return false;
            }
          }
        }
        return true;
      });
      
      return {
        grid: clearedGrid,
        currentBlocks: newBlocks,
        score: newScore,
        gameOver: isGameOver,
        combo: newCombo,
      };
    });
  }, []);

  const resetGame = useCallback(() => {
    setGameState({
      grid: Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null)),
      currentBlocks: generateNewBlocks(3),
      score: 0,
      gameOver: false,
      combo: 0,
    });
  }, []);

  return {
    gameState,
    placeBlockOnGrid,
    resetGame,
  };
}; 