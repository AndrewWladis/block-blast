import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Dimensions, Image, ImageStyle, Animated } from 'react-native';
import { useGame } from '../hooks/useGame';
import { GRID_SIZE } from '../types/game';
import { canPlaceBlock } from '../utils/gameUtils';
import DraggableBlock from './DraggableBlock';
import { BLOCK_IMAGES } from '../constants/images';

const CELL_SIZE = Dimensions.get('window').width / (GRID_SIZE + 4);

const blockImageStyle: ImageStyle = {
  width: '100%',
  height: '100%',
  position: 'absolute',
  top: 0,
  left: 0,
};

// Background colors to cycle through
const BACKGROUND_COLORS = [
  '#1A1A1A', // Dark gray
  '#0D1B2A', // Dark blue
  '#1B263B', // Darker blue
  '#2D3748', // Slate gray
  '#1A365D', // Deep blue
];

const Game = () => {
  const { gameState, placeBlockOnGrid, resetGame } = useGame();
  const gridRef = useRef<View>(null);
  const colorIndex = useRef(0);
  const animatedValue = useRef(new Animated.Value(0)).current;
  const scoreScale = useRef(new Animated.Value(1)).current;
  const prevScore = useRef(0);

  useEffect(() => {
    const animateBackground = () => {
      colorIndex.current = (colorIndex.current + 1) % BACKGROUND_COLORS.length;
      Animated.timing(animatedValue, {
        toValue: colorIndex.current,
        duration: 5000, // 5 seconds per color
        useNativeDriver: false,
      }).start(() => {
        animateBackground();
      });
    };

    animateBackground();
  }, []);

  const backgroundColor = animatedValue.interpolate({
    inputRange: BACKGROUND_COLORS.map((_, index) => index),
    outputRange: BACKGROUND_COLORS,
  });

  // Add score animation effect
  useEffect(() => {
    if (gameState.score > prevScore.current) {
      // Animate the score text
      Animated.sequence([
        Animated.timing(scoreScale, {
          toValue: 1.5,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scoreScale, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
    prevScore.current = gameState.score;
  }, [gameState.score]);

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
          const minCol = Math.min(...block.cells.map(([_, dc]) => dc));
          console.log('Block bounds:', { maxRow, maxCol, minCol, gridY, gridX });
          
          // Check if the block would fit within the grid bounds, accounting for the block's shape
          if (gridY + maxRow <= GRID_SIZE - 1 && 
              gridX + maxCol <= GRID_SIZE - 1 && 
              gridX + minCol >= 0) {
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
    <Animated.View style={[styles.container, { backgroundColor }]}>
      <Animated.Text 
        style={[
          styles.score,
          {
            transform: [{ scale: scoreScale }]
          }
        ]}
      >
        Score: {gameState.score}
      </Animated.Text>
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
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  grid: {
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // 70% opacity white
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
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
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