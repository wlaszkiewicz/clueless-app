import React, { useState, useRef } from "react";
import { PanResponder, View, StyleSheet } from "react-native";

interface DraggableProps {
  children: React.ReactNode;
  initialPosition?: { x: number; y: number };
  onDrag?: (position: { x: number; y: number }) => void;
  onDoubleClick?: () => void;
  disableContentDrag?: boolean;
}

const Draggable: React.FC<DraggableProps> = ({
  children,
  initialPosition = { x: 0, y: 0 },
  onDrag,
  onDoubleClick,
  disableContentDrag = false,
}) => {
  const [position, setPosition] = useState(initialPosition);
  const viewRef = useRef<View>(null);
  const lastTapRef = useRef<number>(0);
  const isDraggingRef = useRef(false);

  const handlePress = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      return;
    }

    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;

    if (lastTapRef.current && now - lastTapRef.current < DOUBLE_PRESS_DELAY) {
      onDoubleClick?.();
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
    }
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (evt, gestureState) => {
      // Only allow dragging from title bar if disableContentDrag is true
      if (disableContentDrag) {
        // Check if the touch is in the title bar area (first 30 pixels from top)
        return gestureState.y0 < 30;
      }
      return true;
    },
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      isDraggingRef.current = false;
    },
    onPanResponderMove: (_, gestureState) => {
      // Only start dragging after a small movement to avoid text selection
      if (Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5) {
        isDraggingRef.current = true;

        const newPosition = {
          x: initialPosition.x + gestureState.dx,
          y: initialPosition.y + gestureState.dy,
        };
        setPosition(newPosition);
        onDrag?.(newPosition);
      }
    },
    onPanResponderRelease: () => {
      if (!isDraggingRef.current) {
        handlePress();
      }
      isDraggingRef.current = false;
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
    position: "absolute",
    // Prevent text selection
    userSelect: "none",
  },
});

export default Draggable;
