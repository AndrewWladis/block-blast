import React, { useRef } from 'react';
import { View, PanResponder, Animated, StyleSheet } from 'react-native';
import { Block } from '../types/game';

interface DraggableBlockProps {
  block: Block;
  cellSize: number;
  onDragEnd: (position: { x: number; y: number }) => void;
}

const DraggableBlock: React.FC<DraggableBlockProps> = ({ block, cellSize, onDragEnd }) => {
  const pan = useRef(new Animated.ValueXY()).current;
  const isDragging = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        isDragging.current = true;
        const currentValue = { x: 0, y: 0 };
        pan.x.extractOffset();
        pan.y.extractOffset();
        pan.setValue(currentValue);
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (_, gestureState) => {
        isDragging.current = false;
        pan.flattenOffset();
        onDragEnd({ x: gestureState.moveX, y: gestureState.moveY });
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: cellSize * 4,
          height: cellSize * 4,
          transform: [{ translateX: pan.x }, { translateY: pan.y }],
        },
      ]}
      {...panResponder.panHandlers}
    >
      {block.cells.map(([dr, dc], index) => (
        <View
          key={index}
          style={[
            styles.cell,
            {
              width: cellSize,
              height: cellSize,
              backgroundColor: block.color,
              top: dr * cellSize,
              left: dc * cellSize,
            },
          ]}
        />
      ))}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  cell: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: '#DDD',
  },
});

export default DraggableBlock; 