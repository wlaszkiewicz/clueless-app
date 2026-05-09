import React from "react";
import { Text, View, Image } from "react-native";
import Draggable from "./Draggable";
import { styles } from "./DesktopIcon.styles";

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

const iconSources = {
  folder: require("../assets/icons/folder.png"),
  add: require("../assets/icons/add.png"),
  gallery: require("../assets/icons/gallery.png"),
  application: require("../assets/icons/application.png"),
  clueless: require("../assets/icons/clueless.png"),
  wardrobe: require("../assets/icons/wardrobe.png"),
  outfit: require("../assets/icons/outfit.png"),
  dressMe: require("../assets/icons/dressMe.png"),
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
        <Text style={styles.label} numberOfLines={2} ellipsizeMode="tail">
          {label}
        </Text>
      </View>
    </Draggable>
  );
};


export default DesktopIcon;
