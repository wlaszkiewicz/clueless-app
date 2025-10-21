import React from "react";
import { Text, StyleSheet, View, Image } from "react-native";
import Draggable from "./Draggable";

interface DesktopIconProps {
  iconType:
    | "folder"
    | "add"
    | "gallery"
    | "application"
    | "clueless"
    | "wardrobe"
    | "outfit"
    | "dressMe";
  label: string;
  onDoubleClick: () => void;
  onDrag: (position: { x: number; y: number }) => void;
  initialPosition: { x: number; y: number };
  isSelected?: boolean;
}

// Icon mapping - update these paths to match your downloaded icons
// Add to your iconSources in DesktopIcon component
const iconSources = {
  folder: require("../assets/icons/folder.png"),
  add: require("../assets/icons/add.png"),
  gallery: require("../assets/icons/gallery.png"),
  application: require("../assets/icons/application.png"),
  clueless: require("../assets/icons/clueless.png"),
  wardrobe: require("../assets/icons/wardrobe.png"),
  outfit: require("../assets/icons/outfit.png"),
  dressMe: require("../assets/icons/dressMe.png"), // Add this
};

const DesktopIcon: React.FC<DesktopIconProps> = ({
  iconType,
  label,
  onDoubleClick,
  onDrag,
  initialPosition,
  isSelected,
}) => {
  const renderIcon = () => {
    const iconSource = iconSources[iconType] || iconSources.application;

    return (
      <Image
        source={iconSource}
        style={styles.iconImage}
        resizeMode="contain"
      />
    );
  };

  return (
    <Draggable
      initialPosition={initialPosition}
      onDrag={onDrag}
      onDoubleClick={onDoubleClick}
    >
      <View style={[styles.iconContainer, isSelected && styles.selected]}>
        <View style={styles.iconWrapper}>{renderIcon()}</View>
        <Text
          style={styles.label}
          numberOfLines={2} // Limit to 2 lines
          ellipsizeMode="tail" // Add ... if too long
        >
          {label}
        </Text>
      </View>
    </Draggable>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: "center",
    padding: 8,
    width: 80, // Fixed width for consistent layout
    borderRadius: 2,
  },
  selected: {
    backgroundColor: "rgba(0, 0, 255, 0.3)",
  },
  iconWrapper: {
    width: 70,
    height: 70,
    marginBottom: 2, // Reduced margin
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  iconImage: {
    width: 70, // Slightly smaller to fit better
    height: 70,
  },
  label: {
    fontFamily: "MS Sans Serif, System",
    fontSize: 12, // Smaller font for mobile
    color: "#ffffff",
    textAlign: "center",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
    textShadowColor: "#000000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
    userSelect: "none",
    // Ensure text doesn't wrap to too many lines
    maxWidth: 70,
    lineHeight: 12,
  },
});

export default DesktopIcon;
