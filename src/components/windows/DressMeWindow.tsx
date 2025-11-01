import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
  Modal,
  TextInput,
} from "react-native";
import { wardrobeStorage, WardrobeItem, Outfit } from "../../utils/storage";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface DressMeWindowProps {
  isFullscreen?: boolean;
  isMobile?: boolean;
  onOpenStyleGallery?: () => void;
}

interface CurrentOutfit {
  top: WardrobeItem | null;
  bottom: WardrobeItem | null;
  shoes: WardrobeItem | null;
  accessories: WardrobeItem | null;
  outerwear: WardrobeItem | null;
  dress: WardrobeItem | null;
}

const DressMeWindow: React.FC<DressMeWindowProps> = ({
  isFullscreen = false,
  isMobile = false,
  onOpenStyleGallery,
}) => {
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([]);
  const [currentOutfit, setCurrentOutfit] = useState<CurrentOutfit>({
    top: null,
    bottom: null,
    shoes: null,
    accessories: null,
    outerwear: null,
    dress: null,
  });
  const [savedOutfits, setSavedOutfits] = useState<Outfit[]>([]);
  const [showFavoriteModal, setShowFavoriteModal] = useState(false);
  const [categoryIndices, setCategoryIndices] = useState({
    tops: 0,
    bottoms: 0,
    shoes: 0,
    accessories: 0,
    outerwear: 0,
    dresses: 0,
  });
  const [isDressMode, setIsDressMode] = useState(false);

  const categories = [
    { id: "tops", label: "Tops", icon: require("../../assets/icons/tops.png") },
    {
      id: "bottoms",
      label: "Bottoms",
      icon: require("../../assets/icons/bottoms.png"),
    },
    {
      id: "dresses",
      label: "Dresses",
      icon: require("../../assets/icons/dresses.png"),
    },
    {
      id: "shoes",
      label: "Shoes",
      icon: require("../../assets/icons/shoes.png"),
    },
    {
      id: "accessories",
      label: "Accessories",
      icon: require("../../assets/icons/jewelry.png"),
    },
    {
      id: "outerwear",
      label: "Outerwear",
      icon: require("../../assets/icons/outerwear.png"),
    },
  ];

  useEffect(() => {
    loadWardrobeItems();
    loadSavedOutfits();
  }, []);

  const loadWardrobeItems = async () => {
    try {
      const items = await wardrobeStorage.getItems();
      setWardrobeItems(items);
    } catch (error) {
      console.error("❌ Failed to load items:", error);
    }
  };

  const loadSavedOutfits = async () => {
    try {
      const outfits = await wardrobeStorage.getOutfits();
      setSavedOutfits(outfits);
    } catch (error) {
      console.error("❌ Failed to load outfits:", error);
    }
  };

  const getItemsByCategory = (category: string) => {
    return wardrobeItems.filter((item) => item.category === category);
  };

  const getCurrentItem = (category: string): WardrobeItem | null => {
    const items = getItemsByCategory(category);
    const index = categoryIndices[category as keyof typeof categoryIndices];
    return items[index] || null;
  };

  const navigateItem = (category: string, direction: "prev" | "next") => {
    const items = getItemsByCategory(category);
    if (items.length === 0) return;

    setCategoryIndices((prev) => {
      const currentIndex = prev[category as keyof typeof categoryIndices];
      let newIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;

      if (newIndex >= items.length) newIndex = 0;
      if (newIndex < 0) newIndex = items.length - 1;

      const newItem = items[newIndex];
      setCurrentOutfit((prevOutfit) => ({
        ...prevOutfit,
        [category]: newItem,
      }));

      return {
        ...prev,
        [category]: newIndex,
      };
    });
  };

  const toggleDressMode = () => {
    setIsDressMode(!isDressMode);
    if (!isDressMode) {
      setCurrentOutfit((prev) => ({
        ...prev,
        top: null,
        bottom: null,
        dress: getCurrentItem("dresses"),
      }));
    } else {
      setCurrentOutfit((prev) => ({
        ...prev,
        dress: null,
        top: getCurrentItem("tops"),
        bottom: getCurrentItem("bottoms"),
      }));
    }
  };

  const favoriteOutfit = async () => {
    const outfitItems = Object.entries(currentOutfit)
      .filter(([category, item]) => {
        if (!item) return false;
        if (isDressMode && (category === "top" || category === "bottom"))
          return false;
        if (!isDressMode && category === "dress") return false;
        return true;
      })
      .map(([category, item]) => ({
        itemId: item!.id,
        position: { x: 0, y: 0 },
        size: {
          width: category === "dress" ? 120 : 100,
          height: category === "dress" ? 160 : 100,
        },
      }));

    if (outfitItems.length === 0) {
      alert("Please select at least one item for your outfit!");
      return;
    }

    const defaultName = `Outfit ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;

    const newOutfit: Outfit = {
      id: Date.now().toString(),
      name: defaultName,
      items: outfitItems,
      backgroundColor: "#FFFFFF",
      createdAt: new Date().toISOString(),
      category: "uncategorized",
    };

    try {
      await wardrobeStorage.saveOutfit(newOutfit);
      await loadSavedOutfits();
      setShowFavoriteModal(false);
    } catch (error) {
      console.error("Error saving outfit:", error);
    }
  };

  const clearOutfit = () => {
    setCurrentOutfit({
      top: null,
      bottom: null,
      shoes: null,
      accessories: null,
      outerwear: null,
      dress: null,
    });
  };

  const renderCategorySection = (category: string) => {
    if (isDressMode && (category === "tops" || category === "bottoms")) {
      return null;
    }
    if (!isDressMode && category === "dresses") {
      return null;
    }

    const items = getItemsByCategory(category);
    const currentItem = getCurrentItem(category);
    const categoryConfig = categories.find((c) => c.id === category);

    const imageSize =
      category === "dresses"
        ? { width: 120, height: 254 }
        : { width: 80, height: 80 };

    return (
      <View style={styles.categorySection}>
        <View style={styles.categoryHeader}>
          <Image source={categoryConfig?.icon} style={styles.categoryIcon} />
          <Text style={styles.categoryTitle}>{categoryConfig?.label}</Text>
        </View>

        <View style={styles.itemsContainer}>
          <TouchableOpacity
            style={styles.arrowButton}
            onPress={() => navigateItem(category, "prev")}
            disabled={items.length === 0}
          >
            <Text style={styles.arrowText}>‹</Text>
          </TouchableOpacity>

          <View
            style={[
              styles.itemDisplay,
              category === "dresses" && styles.dressItemDisplay,
            ]}
          >
            {currentItem ? (
              <Image
                source={{ uri: currentItem.imageUri }}
                style={[styles.itemImage, imageSize]}
              />
            ) : (
              <View style={[styles.placeholderImage, imageSize]}>
                <Text style={styles.placeholderText}>No {category}</Text>
              </View>
            )}
            <Text style={styles.itemsCount}>
              {items.length > 0
                ? `${
                    categoryIndices[category as keyof typeof categoryIndices] +
                    1
                  }/${items.length}`
                : "0/0"}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.arrowButton}
            onPress={() => navigateItem(category, "next")}
            disabled={items.length === 0}
          >
            <Text style={styles.arrowText}>›</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const mobilePreviewContent = (
    <View style={styles.previewContent}>
      <Image
        source={require("../../assets/icons/outfit.png")}
        style={styles.previewIcon}
      />
      <Text style={styles.previewTitle}>Dress Me</Text>
      <Text style={styles.previewText}>
        Create outfits by browsing{"\n"}through your clothes
      </Text>
      <View style={styles.previewStats}>
        <Text style={styles.statsText}>Items: {wardrobeItems.length}</Text>
        <Text style={styles.statsText}>Outfits: {savedOutfits.length}</Text>
      </View>
    </View>
  );

  const fullContent = (
    <View style={styles.fullContent}>
      <View style={styles.header}>
        <Text style={styles.subtitle}>
          Browse your wardrobe and create stylish outfits
        </Text>

        <View style={styles.controls}>
          {/* Dress Mode Toggle */}
          <TouchableOpacity
            style={[
              styles.controlButton,
              isDressMode && styles.dressModeActive,
            ]}
            onPress={toggleDressMode}
          >
            <Image
              source={require("../../assets/icons/dresses.png")}
              style={styles.controlIcon}
            />
            <Text style={styles.controlButtonText}>
              {isDressMode ? "Dress Mode" : "Top/Bottom Mode"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setShowFavoriteModal(true)}
          >
            <Image
              source={require("../../assets/icons/heart.png")}
              style={styles.controlIcon}
            />
            <Text style={styles.controlButtonText}>Favorite</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={onOpenStyleGallery}
          >
            <Image
              source={require("../../assets/icons/gallery.png")}
              style={styles.controlIcon}
            />
            <Text style={styles.controlButtonText}>
              Style Gallery ({savedOutfits.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Category Sections */}
      <View style={styles.categoriesLayout}>
        <View style={styles.leftColumn}>
          {renderCategorySection("tops")}
          {renderCategorySection("bottoms")}
          {renderCategorySection("dresses")}
          {renderCategorySection("shoes")}
        </View>

        <View style={styles.rightColumn}>
          {renderCategorySection("outerwear")}
          {renderCategorySection("accessories")}
        </View>
      </View>

      {/* Favorite Modal */}
      <Modal
        visible={showFavoriteModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowFavoriteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Image
                source={require("../../assets/icons/heart.png")}
                style={styles.modalIcon}
              />
              <Text style={styles.modalTitle}>Favorite This Outfit</Text>
            </View>
            <Text style={styles.modalText}>
              This outfit will be saved to your Style Gallery with a default
              name. You can rename and categorize it later in the Style Gallery.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowFavoriteModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.favoriteButton]}
                onPress={favoriteOutfit}
              >
                <Image
                  source={require("../../assets/icons/heart.png")}
                  style={styles.buttonIcon}
                />
                <Text style={styles.favoriteButtonText}>Favorite</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );

  return isMobile && !isFullscreen ? mobilePreviewContent : fullContent;
};

const styles = StyleSheet.create({
  previewContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  previewIcon: {
    width: 64,
    height: 64,
    marginBottom: 16,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  previewText: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 16,
    marginBottom: 16,
    color: "#666",
  },
  previewStats: {
    marginTop: 8,
  },
  statsText: {
    fontSize: 10,
    color: "#888",
    textAlign: "center",
  },
  fullContent: {
    flex: 1,
    padding: 16,
    backgroundColor: "#c0c0c0",
  },
  header: {
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  controls: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  controlButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#c0c0c0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 2,
    borderColor: "#dfdfdf",
    borderTopColor: "#ffffff",
    borderLeftColor: "#ffffff",
    borderRightColor: "#808080",
    borderBottomColor: "#808080",
    gap: 6,
  },
  dressModeActive: {
    backgroundColor: "#ff66b2",
    borderColor: "#ff3385",
    borderTopColor: "#ff99cc",
    borderLeftColor: "#ff99cc",
    borderRightColor: "#e60073",
    borderBottomColor: "#e60073",
  },
  controlIcon: {
    width: 16,
    height: 16,
  },
  controlButtonText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#000",
  },
  categoriesLayout: {
    flex: 1,
    flexDirection: "row",
    gap: 12,
  },
  leftColumn: {
    flex: 2,
    gap: 12,
  },
  rightColumn: {
    flex: 1,
    gap: 12,
  },
  categorySection: {
    backgroundColor: "#c0c0c0",
    borderWidth: 2,
    borderColor: "#dfdfdf",
    borderTopColor: "#ffffff",
    borderLeftColor: "#ffffff",
    borderRightColor: "#808080",
    borderBottomColor: "#808080",
    padding: 12,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    gap: 8,
  },
  categoryIcon: {
    width: 20,
    height: 20,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  itemsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  arrowButton: {
    backgroundColor: "#c0c0c0",
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#dfdfdf",
    borderTopColor: "#ffffff",
    borderLeftColor: "#ffffff",
    borderRightColor: "#808080",
    borderBottomColor: "#808080",
  },
  arrowText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },
  itemDisplay: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 3,
  },
  dressItemDisplay: {
    // Additional styling for dress items if needed
  },
  itemImage: {
    marginBottom: 8,
  },
  placeholderImage: {
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 12,
    color: "#666",
  },
  itemsCount: {
    fontSize: 10,
    color: "#666",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 8,
    width: "80%",
    maxWidth: 400,
    borderWidth: 2,
    borderColor: "#c0c0c0",
    borderTopColor: "#ffffff",
    borderLeftColor: "#ffffff",
    borderRightColor: "#808080",
    borderBottomColor: "#808080",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    gap: 8,
  },
  modalIcon: {
    width: 20,
    height: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    fontSize: 14,
    marginBottom: 15,
    textAlign: "center",
    color: "#333",
    lineHeight: 18,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 4,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  cancelButton: {
    backgroundColor: "#c0c0c0",
    borderWidth: 2,
    borderTopColor: "#ffffff",
    borderLeftColor: "#ffffff",
    borderRightColor: "#808080",
    borderBottomColor: "#808080",
  },
  favoriteButton: {
    backgroundColor: "#ffcccc",
    borderWidth: 2,
    borderTopColor: "#ffffff",
    borderLeftColor: "#ffffff",
    borderRightColor: "#808080",
    borderBottomColor: "#808080",
  },
  cancelButtonText: {
    color: "#000",
    fontWeight: "bold",
  },
  favoriteButtonText: {
    color: "#000",
    fontWeight: "bold",
  },
  buttonIcon: {
    width: 16,
    height: 16,
  },
});

export default DressMeWindow;
