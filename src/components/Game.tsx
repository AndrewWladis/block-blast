import React, { useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Dimensions, Image, ImageStyle } from 'react-native';
import { useGame } from '../hooks/useGame';
import { GRID_SIZE } from '../types/game';
import { canPlaceBlock } from '../utils/gameUtils';
import DraggableBlock from './DraggableBlock';

// Import block images
const BLOCK_IMAGES = {
  'L': require('../../assets/belmar.jpeg'),
  'T': require('../../assets/morbius.png'),
  'I': require('../../assets/belmar.jpeg'),
  'O': require('../../assets/belmar.jpeg'),
  'Z': require('../../assets/belmar.jpeg'),
  'S': require('../../assets/belmar.jpeg'),
};

const CELL_SIZE = Dimensions.get('window').width / (GRID_SIZE + 4);

const blockImageStyle: ImageStyle = {
  width: '100%',
  height: '100%',
  position: 'absolute',
  top: 0,
  left: 0,
};

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
        
        // Calculate grid position, ensuring we account for the block's height
        const gridX = Math.round(relativeX / CELL_SIZE);
        const gridY = Math.round(relativeY / CELL_SIZE);

        console.log('Drop position:', { 
          relativeX, 
          relativeY, 
          gridX, 
          gridY,
          pageX,
          pageY,
          touchOffset,
          blockType: block.type,
          blockCells: block.cells
        });

        // Check if the block can be placed at this position
        if (gridX >= 0 && gridX < GRID_SIZE && gridY >= 0 && gridY < GRID_SIZE) {
          // Check if the block would fit within the grid bounds
          const maxRow = Math.max(...block.cells.map(([dr, _]) => dr));
          const maxCol = Math.max(...block.cells.map(([_, dc]) => dc));
          console.log('Block bounds:', { maxRow, maxCol, gridY, gridX });
          
          if (gridY + maxRow < GRID_SIZE && gridX + maxCol < GRID_SIZE) {
            const canPlace = canPlaceBlock(gameState.grid, block, { row: gridY, col: gridX });
            console.log('Can place block:', canPlace);
            
            if (canPlace) {
              placeBlockOnGrid(index, { row: gridY, col: gridX });
            }
          } else {
            console.log('Block would exceed grid bounds');
          }
        } else {
          console.log('Drop position outside grid');
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
                  { backgroundColor: cell?.color || '#FFFFFF' },
                ]}
              >
                {cell?.type && (
                  <Image
                    source={BLOCK_IMAGES[cell.type]}
                    style={blockImageStyle}
                    resizeMode="cover"
                  />
                )}
              </View>
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
    overflow: 'hidden',
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