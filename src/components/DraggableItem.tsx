import React, { useState, useRef } from "react";
import {
  PanResponder,
  View,
  StyleSheet,
  GestureResponderEvent,
} from "react-native";

interface DraggableItemProps {
  children: React.ReactNode;
  onDragStart?: () => void;
  onDragEnd?: (position: { x: number; y: number }) => void;
}

const DraggableItem: React.FC<DraggableItemProps> = ({
  children,
  onDragStart,
  onDragEnd,
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const viewRef = useRef<View>(null);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,

    onPanResponderGrant: (evt, gestureState) => {
      onDragStart?.();
      // Stop propagation to prevent window from dragging
      evt.stopPropagation();
    },

    onPanResponderMove: (evt, gestureState) => {
      // Stop propagation to prevent window from dragging
      evt.stopPropagation();

      const newPosition = {
        x: gestureState.dx,
        y: gestureState.dy,
      };
      setPosition(newPosition);
    },

    onPanResponderRelease: (evt, gestureState) => {
      // Stop propagation to prevent window from dragging
      evt.stopPropagation();

      onDragEnd?.(position);
      setPosition({ x: 0, y: 0 }); // Reset position
    },
  });

  return (
    <View
      ref={viewRef}
      style={[
        styles.draggable,
        {
          transform: [{ translateX: position.x }, { translateY: position.y }],
        },
      ]}
      {...panResponder.panHandlers}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  draggable: {
    // position: 'absolute', // Don't use absolute positioning
    zIndex: 1000, // Make sure dragged items appear on top
  },
});

export default DraggableItem;
