import React from "react";
import { View, StyleSheet, Image } from "react-native";

// Icon mapping for different app types
const iconSources = {
  wardrobe: require("../assets/icons/wardrobe.png"),
  outfit: require("../assets/icons/outfit.png"),
  add: require("../assets/icons/add.png"),
  gallery: require("../assets/icons/gallery.png"),
  application: require("../assets/icons/application.png"),
  clueless: require("../assets/icons/application.png"),
  folder: require("../assets/icons/folder.png"), // fallback
};

export const WardrobeIcon = () => (
  <View style={styles.iconContainer}>
    <Image source={iconSources.wardrobe} style={styles.iconImage} />
  </View>
);

export const OutfitIcon = () => (
  <View style={styles.iconContainer}>
    <Image source={iconSources.outfit} style={styles.iconImage} />
  </View>
);

export const AddIcon = () => (
  <View style={styles.iconContainer}>
    <Image source={iconSources.add} style={styles.iconImage} />
  </View>
);

export const GalleryIcon = () => (
  <View style={styles.iconContainer}>
    <Image source={iconSources.gallery} style={styles.iconImage} />
  </View>
);

export const ApplicationIcon = () => (
  <View style={styles.iconContainer}>
    <Image source={iconSources.application} style={styles.iconImage} />
  </View>
);

export const CluelessIcon = () => (
  <View style={styles.iconContainer}>
    <Image source={iconSources.clueless} style={styles.iconImage} />
  </View>
);

// Helper function to get icon by type
export const getIconByType = (iconType: string) => {
  const iconMap = {
    wardrobe: WardrobeIcon,
    outfit: OutfitIcon,
    add: AddIcon,
    gallery: GalleryIcon,
    application: ApplicationIcon,
    clueless: CluelessIcon,
  };
  return iconMap[iconType as keyof typeof iconMap] || ApplicationIcon;
};

const styles = StyleSheet.create({
  iconContainer: {
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  iconImage: {
    width: 50,
    height: 50,
  },
});

export default {
  WardrobeIcon,
  AddIcon,
  GalleryIcon,
  ApplicationIcon,
  OutfitIcon,
  CluelessIcon,
  getIconByType,
};
