import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Dimensions } from 'react-native';
import { useGame } from '../hooks/useGame';
import { GRID_SIZE } from '../types/game';
import { canPlaceBlock } from '../utils/gameUtils';

const CELL_SIZE = Dimensions.get('window').width / (GRID_SIZE + 4);

const Game = () => {
  const { gameState, placeBlockOnGrid, resetGame } = useGame();

  const renderGrid = () => {
    return (
      <View style={styles.grid}>
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
          <TouchableOpacity
            key={`block-${index}`}
            style={styles.block}
            onPress={() => {
              // Place block at first available position
              for (let r = 0; r < GRID_SIZE; r++) {
                for (let c = 0; c < GRID_SIZE; c++) {
                  if (canPlaceBlock(gameState.grid, block, { row: r, col: c })) {
                    placeBlockOnGrid(index, { row: r, col: c });
                    return;
                  }
                }
              }
            }}
          >
            {block.cells.map(([dr, dc], cellIndex) => (
              <View
                key={`block-cell-${cellIndex}`}
                style={[
                  styles.blockCell,
                  {
                    backgroundColor: block.color,
                    top: dr * CELL_SIZE,
                    left: dc * CELL_SIZE,
                  },
                ]}
              />
            ))}
          </TouchableOpacity>
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
  },
  block: {
    width: CELL_SIZE * 4,
    height: CELL_SIZE * 4,
    position: 'relative',
  },
  blockCell: {
    position: 'absolute',
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderWidth: 1,
    borderColor: '#DDD',
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