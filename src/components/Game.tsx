import React, { useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Dimensions } from 'react-native';
import { useGame } from '../hooks/useGame';
import { GRID_SIZE } from '../types/game';
import { canPlaceBlock } from '../utils/gameUtils';
import DraggableBlock from './DraggableBlock';

const CELL_SIZE = Dimensions.get('window').width / (GRID_SIZE + 4);

const Game = () => {
  const { gameState, placeBlockOnGrid, resetGame } = useGame();
  const gridRef = useRef<View>(null);

  const handleBlockDragEnd = (index: number, position: { x: number; y: number }, touchOffset: { x: number; y: number }) => {
    const block = gameState.currentBlocks[index];
    
    if (gridRef.current) {
      // Get grid position relative to screen
      gridRef.current.measure((x, y, width, height, pageX, pageY) => {
        // Calculate grid coordinates, accounting for touch offset
        const relativeX = position.x - pageX - touchOffset.x;
        const relativeY = position.y - pageY - touchOffset.y;
        
        // Add half a cell size to center the block
        const gridX = Math.round(relativeX / CELL_SIZE);
        const gridY = Math.round(relativeY / CELL_SIZE);

        console.log('Drop position:', { relativeX, relativeY, gridX, gridY });

        if (gridX >= 0 && gridX < GRID_SIZE && gridY >= 0 && gridY < GRID_SIZE) {
          if (canPlaceBlock(gameState.grid, block, { row: gridY, col: gridX })) {
            placeBlockOnGrid(index, { row: gridY, col: gridX });
          }
        }
      });
    }
  };

  const renderGrid = () => {
    return (
      <View ref={gridRef} style={styles.grid}>
        {gameState.grid.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.row}>
            {row.map((cell, colIndex) => (
              <View
                key={`cell-${rowIndex}-${colIndex}`}
                style={[
                  styles.cell,
                  { backgroundColor: cell || '#FFFFFF' },
                ]}
              />
            ))}
          </View>
        ))}
      </View>
    );
  };

  const renderBlockTray = () => {
    return (
      <View style={styles.blockTray}>
        {gameState.currentBlocks.map((block, index) => (
          <DraggableBlock
            key={`block-${index}`}
            block={block}
            cellSize={CELL_SIZE}
            onDragEnd={(position, touchOffset) => handleBlockDragEnd(index, position, touchOffset)}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.score}>Score: {gameState.score}</Text>
      {gameState.gameOver && (
        <View style={styles.gameOver}>
          <Text style={styles.gameOverText}>Game Over!</Text>
          <TouchableOpacity style={styles.resetButton} onPress={resetGame}>
            <Text style={styles.resetButtonText}>Play Again</Text>
          </TouchableOpacity>
        </View>
      )}
      {renderGrid()}
      {renderBlockTray()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  grid: {
    borderWidth: 2,
    borderColor: '#333',
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  blockTray: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    padding: 10,
    position: 'relative',
  },
  score: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  gameOver: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -100 }, { translateY: -50 }],
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  gameOverText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  resetButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Game; 