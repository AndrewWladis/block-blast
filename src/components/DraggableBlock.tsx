import React, { useRef } from 'react';
import { View, PanResponder, Animated, StyleSheet, Image, ImageStyle } from 'react-native';
import { Block } from '../types/game';

// Import block images
const BLOCK_IMAGES = {
  'L': require('../../assets/belmar.jpeg'),
  'T': require('../../assets/morbius.png'),
  'I': require('../../assets/belmar.jpeg'),
  'O': require('../../assets/belmar.jpeg'),
  'Z': require('../../assets/belmar.jpeg'),
  'S': require('../../assets/belmar.jpeg'),
};

const blockImageStyle: ImageStyle = {
  width: '100%',
  height: '100%',
  position: 'absolute',
  top: 0,
  left: 0,
};

interface DraggableBlockProps {
  block: Block;
  cellSize: number;
  onDragEnd: (position: { x: number; y: number }, touchOffset: { x: number; y: number }) => void;
}

const DraggableBlock: React.FC<DraggableBlockProps> = ({ block, cellSize, onDragEnd }) => {
  const pan = useRef(new Animated.ValueXY()).current;
  const touchOffset = useRef({ x: 0, y: 0 });
  const blockRef = useRef<View>(null);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        if (blockRef.current) {
          blockRef.current.measure((x, y, width, height, pageX, pageY) => {
            // Calculate where within the block the user touched
            touchOffset.current = {
              x: evt.nativeEvent.pageX - pageX,
              y: evt.nativeEvent.pageY - pageY,
            };
          });
        }
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (evt) => {
        const currentPosition = {
          x: evt.nativeEvent.pageX,
          y: evt.nativeEvent.pageY,
        };
        onDragEnd(currentPosition, touchOffset.current);
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

  return (
    <Animated.View
      ref={blockRef}
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
        >
          <Image
            source={BLOCK_IMAGES[block.type]}
            style={blockImageStyle}
            resizeMode="cover"
          />
        </View>
      ))}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1,
  },
  cell: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: '#DDD',
    overflow: 'hidden',
  },
});

export default DraggableBlock; 