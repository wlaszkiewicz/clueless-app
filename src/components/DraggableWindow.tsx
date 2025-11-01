import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  PanResponder,
  StatusBar,
  Platform,
} from "react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const isMobile = Platform.OS === "ios" || Platform.OS === "android";

// safe area insets for mobile devices
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
    setTimeout(() => {
      windowRef.current?.measure((x, y, width, height) => {
        console.log("Forced re-measure:", { x, y, width, height });
      });
    }, 100);
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

      {/* Pink Title Bar */}
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

      {/* Menu Bar - Hide in fullscreen on mobile */}
      {(!isMobile || !isFullscreen) && (
        <View style={styles.menuBar}>
          <Text style={styles.menuItem}>File</Text>
          <Text style={styles.menuItem}>Edit</Text>
          <Text style={styles.menuItem}>View</Text>
          <Text style={styles.menuItem}>Help</Text>
        </View>
      )}

      {/* Window Content */}

      {/* Window Content */}
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

const styles = StyleSheet.create({
  windowContainer: {
    position: "absolute",
    backgroundColor: "#c0c0c0",
    borderWidth: 2,
    borderColor: "#dfdfdf",
    borderTopColor: "#ffffff",
    borderLeftColor: "#ffffff",
    borderRightColor: "#808080",
    borderBottomColor: "#808080",
    minWidth: isMobile ? screenWidth * 0.8 : 320,
    maxWidth: screenWidth,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 0,
    elevation: 8,
  },
  borderContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  borderTopLeft: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 2,
    height: 2,
    backgroundColor: "#ffffff",
  },
  borderTopRight: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 2,
    width: 2,
    backgroundColor: "#ffffff",
  },
  borderBottomLeft: {
    position: "absolute",
    left: 0,
    bottom: 0,
    right: 2,
    height: 2,
    backgroundColor: "#808080",
  },
  borderBottomRight: {
    position: "absolute",
    right: 0,
    bottom: 0,
    top: 2,
    width: 2,
    backgroundColor: "#808080",
  },
  titleBar: {
    backgroundColor: "#ff66b2",
    padding: 4,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#808080",
    minHeight: 24,
  },
  titleBarFullscreen: {
    backgroundColor: "#ff66b2",
  },
  titleIcon: {
    width: 16,
    height: 16,
    marginRight: 6,
    marginLeft: 4,
    flexShrink: 0,
  },
  titleText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "bold",
    flex: 1,
    fontFamily: "MS Sans Serif, System",
    textShadowColor: "#000000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
    userSelect: "none",
    marginRight: 4,
  },
  windowControls: {
    flexDirection: "row",
    flexShrink: 0,
  },
  controlButton: {
    width: isMobile ? 25 : 20,
    height: isMobile ? 24 : 18,
    backgroundColor: "#c0c0c0",
    borderWidth: 1,
    borderColor: "#808080",
    borderTopColor: "#ffffff",
    borderLeftColor: "#ffffff",
    marginLeft: 2,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  controlText: {
    color: "#000000",
    fontSize: 12,
    fontWeight: "bold",
    lineHeight: 14,
    marginTop: -1,
  },
  menuBar: {
    flexDirection: "row",
    backgroundColor: "#c0c0c0",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderBottomWidth: 1,
    borderBottomColor: "#808080",
    minHeight: 20,
  },
  menuItem: {
    fontSize: 11,
    color: "#000000",
    marginRight: 16,
    fontFamily: "MS Sans Serif, System",
    fontWeight: "bold",
    userSelect: "none",
  },
  windowContent: {
    flex: 1,
    minHeight: 80,
  },
  windowContentFullscreen: {
    flex: 1,
  },
  contentArea: {
    flex: 1,
    padding: 8,
    minHeight: 60,
  },
  statusBar: {
    flexDirection: "row",
    backgroundColor: "#c0c0c0",
    padding: 4,
    borderTopWidth: 1,
    borderTopColor: "#808080",
    alignItems: "center",
    minHeight: 20,
  },
  statusText: {
    fontSize: 10,
    color: "#000000",
    fontFamily: "MS Sans Serif, System",
    userSelect: "none",
  },
  statusSeparator: {
    width: 1,
    height: 12,
    backgroundColor: "#808080",
    marginHorizontal: 8,
  },
  resizeHandle: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderWidth: 2,
    borderColor: "#c0c0c0",
    borderRightColor: "#808080",
    borderBottomColor: "#808080",
    borderTopColor: "#dfdfdf",
    borderLeftColor: "#dfdfdf",
  },
  fullscreenHint: {
    backgroundColor: "transparent",
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: "transparent",
    alignItems: "center",
  },
  fullscreenHintText: {
    fontSize: 12,
    color: "#000000FF",
    fontFamily: "MS Sans Serif, System",
    textAlign: "center",
  },
});

export default DraggableWindow;
