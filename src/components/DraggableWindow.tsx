import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from "react-native";
import Draggable from "./Draggable";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const isMobile = screenWidth < 768;

interface DraggableWindowProps {
  title: string;
  children: React.ReactNode;
  onClose?: () => void;
  onMinimize?: () => void;
  onDrag: (position: { x: number; y: number }) => void;
  initialPosition: { x: number; y: number };
  iconType?: string;
}

// Icon mapping for window title bars
const windowIconSources = {
  wardrobe: require("../assets/icons/wardrobe.png"),
  outfit: require("../assets/icons/outfit.png"),
  add: require("../assets/icons/add.png"),
  gallery: require("../assets/icons/gallery.png"),
  application: require("../assets/icons/application.png"),
  clueless: require("../assets/icons/application.png"),
  folder: require("../assets/icons/folder.png"),
};

const DraggableWindow: React.FC<DraggableWindowProps> = ({
  title,
  children,
  onClose,
  onMinimize,
  onDrag,
  initialPosition,
  iconType = "folder",
}) => {
  const windowIconSource =
    windowIconSources[iconType as keyof typeof windowIconSources] ||
    windowIconSources.folder;

  return (
    <Draggable initialPosition={initialPosition} onDrag={onDrag}>
      <View style={styles.window}>
        {/* Classic 3D Border - Now scales properly */}
        <View style={styles.borderContainer}>
          <View style={styles.borderTopLeft} />
          <View style={styles.borderTopRight} />
          <View style={styles.borderBottomLeft} />
          <View style={styles.borderBottomRight} />
        </View>

        {/* Pink Title Bar */}
        <View style={styles.titleBar}>
          <Image source={windowIconSource} style={styles.titleIcon} />
          <Text style={styles.titleText} numberOfLines={1} ellipsizeMode="tail">
            {title}
          </Text>
          <View style={styles.windowControls}>
            <TouchableOpacity style={styles.controlButton} onPress={onMinimize}>
              <Text style={styles.controlText}>_</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton} onPress={onClose}>
              <Text style={styles.controlText}>×</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Menu Bar */}
        <View style={styles.menuBar}>
          <Text style={styles.menuItem}>File</Text>
          <Text style={styles.menuItem}>Edit</Text>
          <Text style={styles.menuItem}>View</Text>
          <Text style={styles.menuItem}>Help</Text>
        </View>

        {/* Window Content */}
        <View style={styles.windowContent}>
          <View style={styles.contentArea}>{children}</View>

          {/* Status Bar */}
          <View style={styles.statusBar}>
            <Text style={styles.statusText}>Ready</Text>
            <View style={styles.statusSeparator} />
            <Text style={styles.statusText}>Windows 2000</Text>
          </View>
        </View>

        {/* Resize Handle */}
        <View style={styles.resizeHandle} />
      </View>
    </Draggable>
  );
};

const styles = StyleSheet.create({
  window: {
    backgroundColor: "#c0c0c0",
    borderWidth: 2,
    borderColor: "#dfdfdf",
    borderTopColor: "#ffffff",
    borderLeftColor: "#ffffff",
    borderRightColor: "#808080",
    borderBottomColor: "#808080",
    width: isMobile ? screenWidth * 0.85 : 320, // Responsive width
    minWidth: isMobile ? 280 : 320,
    minHeight: isMobile ? 200 : 240,
    maxWidth: screenWidth * 0.95,
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
  titleIcon: {
    width: 16,
    height: 16,
    marginRight: 6,
    marginLeft: 4,
    flexShrink: 0, // Prevent icon from shrinking
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
    marginRight: 4, // Add some margin so text doesn't touch controls
  },
  windowControls: {
    flexDirection: "row",
    flexShrink: 0, // Prevent controls from shrinking
  },
  controlButton: {
    width: 18,
    height: 16,
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
    fontSize: 10,
    fontWeight: "bold",
    lineHeight: 12,
    marginTop: -2,
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
    minHeight: 120,
  },
  contentArea: {
    flex: 1,
    padding: 12,
    minHeight: 100,
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
});

export default DraggableWindow;
