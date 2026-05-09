import React, { useState, useRef } from "react";
import { styles } from "./DraggableWindow.styles";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  PanResponder,
  StatusBar,
  Platform,
} from "react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const isMobile = Platform.OS === "ios" || Platform.OS === "android";

const STATUSBAR_HEIGHT = isMobile ? 40 : StatusBar.currentHeight || 24;

interface DraggableWindowProps {
  title: string;
  children: React.ReactNode;
  mobilePreviewContent?: React.ReactNode;
  onClose?: () => void;
  onMinimize?: () => void;
  onFullscreen?: (isFullscreen: boolean) => void;
  onDrag: (position: { x: number; y: number }) => void;
  onFocus?: () => void;
  initialPosition: { x: number; y: number };
  iconType?: string;
  width?: number;
  height?: number;
  isFocused?: boolean;
  isMobile?: boolean;
}

const windowIconSources = {
  wardrobe: require("../assets/icons/wardrobe.png"),
  outfit: require("../assets/icons/outfit.png"),
  add: require("../assets/icons/add.png"),
  gallery: require("../assets/icons/gallery.png"),
  application: require("../assets/icons/application.png"),
  clueless: require("../assets/icons/clueless.png"),
  folder: require("../assets/icons/folder.png"),
  dressMe: require("../assets/icons/dressMe.png"),
};

const DraggableWindow: React.FC<DraggableWindowProps> = ({
  title,
  children,
  onClose,
  onMinimize,
  onFullscreen,
  onDrag,
  onFocus,
  initialPosition,
  iconType = "folder",
  width = isMobile ? screenWidth * 0.8 : 500,
  height = 400,
  isFocused = false,
  mobilePreviewContent,
}) => {
  const [position, setPosition] = useState(initialPosition);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const windowIconSource =
    windowIconSources[iconType as keyof typeof windowIconSources] ||
    windowIconSources.folder;

  const windowRef = useRef<View>(null);

  const handleFullscreen = () => {
    const newFullscreenState = !isFullscreen;
    setIsFullscreen(newFullscreenState);
    if (newFullscreenState) {
      setPosition({ x: 0, y: STATUSBAR_HEIGHT });
    } else {
      setPosition(initialPosition);
    }
    onFullscreen?.(newFullscreenState);
  };

  const getWindowContent = () => {
    if (isMobile && !isFullscreen && mobilePreviewContent) {
      return mobilePreviewContent;
    }
    return children;
  };

  const handleFocus = () => {
    onFocus?.();
    return true;
  };

  const titleBarPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      handleFocus();
    },
    onPanResponderMove: (_, gestureState) => {
      if (!isFullscreen) {
        const newPosition = {
          x: initialPosition.x + gestureState.dx,
          y: initialPosition.y + gestureState.dy,
        };
        setPosition(newPosition);
        onDrag(newPosition);
      }
    },
  });

  const windowWidth = isFullscreen ? screenWidth : width;
  const windowHeight = isFullscreen ? screenHeight - STATUSBAR_HEIGHT : height;

  return (
    <View
      ref={windowRef}
      style={[
        styles.windowContainer,
        {
          transform: [{ translateX: position.x }, { translateY: position.y }],
          width: windowWidth,
          height: windowHeight,
          zIndex: isFocused ? 1000 : 1,
        },
      ]}
      onStartShouldSetResponder={handleFocus}
    >
      {!isFullscreen && (
        <View style={styles.borderContainer}>
          <View style={styles.borderTopLeft} />
          <View style={styles.borderTopRight} />
          <View style={styles.borderBottomLeft} />
          <View style={styles.borderBottomRight} />
        </View>
      )}

      <View
        style={[styles.titleBar, isFullscreen && styles.titleBarFullscreen]}
        {...titleBarPanResponder.panHandlers}
      >
        <Image source={windowIconSource} style={styles.titleIcon} />
        <Text style={styles.titleText} numberOfLines={1} ellipsizeMode="tail">
          {title} {isFullscreen ? "(Fullscreen)" : ""}
        </Text>
        <View style={styles.windowControls}>
          {isMobile && title !== "Clueless" && (
            <TouchableOpacity
              style={styles.controlButton}
              onPress={handleFullscreen}
            >
              <Text style={styles.controlText}>{isFullscreen ? "❐" : "⛶"}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.controlButton} onPress={onMinimize}>
            <Text style={styles.controlText}>_</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton} onPress={onClose}>
            <Text style={styles.controlText}>×</Text>
          </TouchableOpacity>
        </View>
      </View>

      {(!isMobile || !isFullscreen) && (
        <View style={styles.menuBar}>
          <Text style={styles.menuItem}>File</Text>
          <Text style={styles.menuItem}>Edit</Text>
          <Text style={styles.menuItem}>View</Text>
          <Text style={styles.menuItem}>Help</Text>
        </View>
      )}

      <View
        style={[
          styles.windowContent,
          isFullscreen && styles.windowContentFullscreen,
        ]}
      >
        <View style={styles.contentArea}>{getWindowContent()}</View>

        {isMobile && !isFullscreen && title !== "Clueless" && (
          <View style={styles.fullscreenHint}>
            <Text style={styles.fullscreenHintText}>
              💡 Click the fullscreen button to use this feature!
            </Text>
          </View>
        )}

        {!isFullscreen && (
          <View style={styles.statusBar}>
            <Text style={styles.statusText}>
              {isMobile && mobilePreviewContent ? "Preview Mode" : "Ready"}
            </Text>
            <View style={styles.statusSeparator} />
            <Text style={styles.statusText}>Windows 2000</Text>
          </View>
        )}
      </View>

      {!isFullscreen && <View style={styles.resizeHandle} />}
    </View>
  );
};


export default DraggableWindow;
