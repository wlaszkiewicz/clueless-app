import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
} from "react-native";
import { wardrobeStorage, WardrobeItem, Outfit } from "../../utils/storage";
import MobilePreview, { previewStatText } from "./MobilePreview";
import { styles } from "./DressMeWindow.styles";

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


  const fullContent = (
    <View style={styles.fullContent}>
      <View style={styles.header}>
        <Text style={styles.subtitle}>
          Browse your wardrobe and create stylish outfits
        </Text>

        <View style={styles.controls}>
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

  if (isMobile && !isFullscreen) {
    return (
      <MobilePreview
        icon={require("../../assets/icons/outfit.png")}
        title="Dress Me"
        text={"Create outfits by browsing\nthrough your clothes"}
      >
        <Text style={previewStatText.base}>Items: {wardrobeItems.length}</Text>
        <Text style={previewStatText.base}>Outfits: {savedOutfits.length}</Text>
      </MobilePreview>
    );
  }

  return fullContent;
};


export default DressMeWindow;
