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
import { wardrobeStorage, Outfit, WardrobeItem } from "../../utils/storage";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface StyleGalleryWindowProps {
  isFullscreen?: boolean;
  isMobile?: boolean;
}

const StyleGalleryWindow: React.FC<StyleGalleryWindowProps> = ({
  isFullscreen = false,
  isMobile = false,
}) => {
  const [savedOutfits, setSavedOutfits] = useState<Outfit[]>([]);
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [outfitToDelete, setOutfitToDelete] = useState<string | null>(null);
  const [editingOutfit, setEditingOutfit] = useState<Outfit | null>(null);
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [currentOutfitIndex, setCurrentOutfitIndex] = useState(0);

  const categories = [
    {
      id: "all",
      label: "All Outfits",
      icon: require("../../assets/icons/outfit.png"),
    },
    {
      id: "casual",
      label: "Casual",
      icon: require("../../assets/icons/tops.png"),
    },
    {
      id: "formal",
      label: "Formal",
      icon: require("../../assets/icons/dresses.png"),
    },
    {
      id: "work",
      label: "Work",
      icon: require("../../assets/icons/outerwear.png"),
    },
    {
      id: "party",
      label: "Party",
      icon: require("../../assets/icons/jewelry.png"),
    },
    {
      id: "sport",
      label: "Sport",
      icon: require("../../assets/icons/shoes.png"),
    },
    {
      id: "uncategorized",
      label: "Uncategorized",
      icon: require("../../assets/icons/outfit.png"),
    },
  ];

  useEffect(() => {
    loadSavedOutfits();
    loadWardrobeItems();
  }, []);

  const loadSavedOutfits = async () => {
    try {
      const outfits = await wardrobeStorage.getOutfits();
      setSavedOutfits(outfits);
    } catch (error) {
      console.error("❌ Failed to load outfits:", error);
    }
  };

  const loadWardrobeItems = async () => {
    try {
      const items = await wardrobeStorage.getItems();
      setWardrobeItems(items);
    } catch (error) {
      console.error("❌ Failed to load items:", error);
    }
  };

  const getFilteredOutfits = () => {
    if (selectedCategory === "all") {
      return savedOutfits;
    }
    return savedOutfits.filter(
      (outfit) => outfit.category === selectedCategory
    );
  };

  const getCurrentOutfit = (): Outfit | null => {
    const filteredOutfits = getFilteredOutfits();
    return filteredOutfits[currentOutfitIndex] || null;
  };

  const getItemById = (itemId: string): WardrobeItem | null => {
    return wardrobeItems.find((item) => item.id === itemId) || null;
  };

  const goToNextOutfit = () => {
    const filteredOutfits = getFilteredOutfits();
    if (filteredOutfits.length === 0) return;

    setCurrentOutfitIndex((prev) =>
      prev >= filteredOutfits.length - 1 ? 0 : prev + 1
    );
  };

  const goToPreviousOutfit = () => {
    const filteredOutfits = getFilteredOutfits();
    if (filteredOutfits.length === 0) return;

    setCurrentOutfitIndex((prev) =>
      prev <= 0 ? filteredOutfits.length - 1 : prev - 1
    );
  };

  const deleteOutfit = async () => {
    if (!outfitToDelete) return;

    try {
      await wardrobeStorage.deleteOutfit(outfitToDelete);
      await loadSavedOutfits();
      setShowDeleteModal(false);
      setOutfitToDelete(null);

      const filteredOutfits = getFilteredOutfits();
      if (currentOutfitIndex >= filteredOutfits.length) {
        setCurrentOutfitIndex(Math.max(0, filteredOutfits.length - 1));
      }
    } catch (error) {
      console.error("Error deleting outfit:", error);
    }
  };

  const updateOutfit = async () => {
    if (!editingOutfit) return;

    const updatedOutfit: Outfit = {
      ...editingOutfit,
      name: editName.trim(),
      category: editCategory,
    };

    try {
      await wardrobeStorage.saveOutfit(updatedOutfit);
      await loadSavedOutfits();
      setShowEditModal(false);
      setEditingOutfit(null);
      setEditName("");
      setEditCategory("");
    } catch (error) {
      console.error("Error updating outfit:", error);
    }
  };

  const startEditOutfit = (outfit: Outfit) => {
    setEditingOutfit(outfit);
    setEditName(outfit.name);
    setEditCategory(outfit.category || "uncategorized");
    setShowEditModal(true);
  };

  const startDeleteOutfit = (outfitId: string) => {
    setOutfitToDelete(outfitId);
    setShowDeleteModal(true);
  };

  const organizeOutfitItems = (outfit: Outfit) => {
    const items = outfit.items
      .map((outfitItem) => ({
        ...outfitItem,
        item: getItemById(outfitItem.itemId),
      }))
      .filter((item) => item.item !== null);

    return items.sort((a, b) => {
      const categoryOrder = {
        bottoms: 1,
        shoes: 2,
        tops: 3,
        dresses: 3,
        outerwear: 4,
        accessories: 5,
      };

      const orderA =
        categoryOrder[a.item!.category as keyof typeof categoryOrder] || 6;
      const orderB =
        categoryOrder[b.item!.category as keyof typeof categoryOrder] || 6;

      return orderA - orderB;
    });
  };

  const renderOutfitView = (outfit: Outfit) => {
    const organizedItems = organizeOutfitItems(outfit);
    const filteredOutfits = getFilteredOutfits();
    const currentNumber =
      filteredOutfits.length > 0 ? currentOutfitIndex + 1 : 0;
    const totalNumber = filteredOutfits.length;

    const getItemPosition = (item: WardrobeItem, index: number) => {
      const category = item.category;
      const canvasWidth = screenWidth * 0.3;
      const centerX = canvasWidth / 2;

      switch (category) {
        case "tops":
          return { top: 30, left: centerX - 50, zIndex: 3 }; // Centered
        case "dresses":
          return { top: 40, left: centerX - 60, zIndex: 3 }; // Centered, slightly higher
        case "bottoms":
          return { top: 170, left: centerX - 50, zIndex: 2 }; // Centered below tops
        case "shoes":
          return { top: 300, left: centerX - 40, zIndex: 1 }; // Centered at bottom
        case "outerwear":
          return { top: 45, left: centerX - 50, zIndex: 4 }; // Centered, slightly over tops
        case "accessories":
          return { top: 70, left: centerX + 60, zIndex: 5 }; // To the right of center
        default:
          return { top: 100, left: centerX - 50, zIndex: index + 1 }; // Centered fallback
      }
    };

    const getItemSize = (item: WardrobeItem) => {
      const category = item.category;

      switch (category) {
        case "dresses":
          return { width: 120, height: 200 };
        case "tops":
        case "outerwear":
          return { width: 100, height: 120 };
        case "bottoms":
          return { width: 100, height: 100 };
        case "shoes":
          return { width: 80, height: 60 };
        case "accessories":
          return { width: 60, height: 60 };
        default:
          return { width: 100, height: 100 };
      }
    };

    return (
      <View style={styles.outfitView}>
        <View
          style={[
            styles.outfitCanvas,
            { backgroundColor: outfit.backgroundColor },
          ]}
        >
          {organizedItems.map((outfitItem, index) => {
            const item = outfitItem.item!;
            const position = getItemPosition(item, index);
            const size = getItemSize(item);

            return (
              <View
                key={outfitItem.itemId}
                style={[
                  styles.outfitItem,
                  {
                    top: position.top,
                    left: position.left,
                    width: size.width,
                    height: size.height,
                    zIndex: position.zIndex,
                  },
                ]}
              >
                <Image
                  source={{ uri: item.imageUri }}
                  style={[
                    styles.outfitItemImage,
                    { width: size.width, height: size.height },
                  ]}
                />
              </View>
            );
          })}

          {organizedItems.length === 0 && (
            <View style={styles.emptyOutfit}>
              <Image
                source={require("../../assets/icons/outfit.png")}
                style={styles.emptyOutfitIcon}
              />
              <Text style={styles.emptyOutfitText}>
                No items in this outfit
              </Text>
            </View>
          )}
        </View>

        {/* Outfit Info and Controls */}
        <View style={styles.outfitInfo}>
          <View style={styles.outfitHeader}>
            <Text style={styles.outfitName} numberOfLines={1}>
              {outfit.name}
            </Text>
            <Text style={styles.outfitCounter}>
              {currentNumber}/{totalNumber}
            </Text>
          </View>

          <Text style={styles.outfitMeta}>
            {organizedItems.length} items •{" "}
            {new Date(outfit.createdAt).toLocaleDateString()}
          </Text>

          {outfit.category && outfit.category !== "uncategorized" && (
            <View style={styles.categoryTag}>
              <Text style={styles.categoryTagText}>
                {categories.find((c) => c.id === outfit.category)?.label}
              </Text>
            </View>
          )}

          <View style={styles.outfitActions}>
            <TouchableOpacity
              style={styles.navButton}
              onPress={goToPreviousOutfit}
              disabled={totalNumber <= 1}
            >
              <Text style={styles.navButtonText}>‹</Text>
            </TouchableOpacity>

            <View style={styles.mainActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => startEditOutfit(outfit)}
              >
                <Image
                  source={require("../../assets/icons/settings.png")}
                  style={styles.actionIcon}
                />
                <Text style={styles.actionText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.deleteAction]}
                onPress={() => startDeleteOutfit(outfit.id)}
              >
                <Image
                  source={require("../../assets/icons/trash-icon.png")}
                  style={styles.actionIcon}
                />
                <Text style={styles.actionText}>Delete</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.navButton}
              onPress={goToNextOutfit}
              disabled={totalNumber <= 1}
            >
              <Text style={styles.navButtonText}>›</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const mobilePreviewContent = (
    <View style={styles.previewContent}>
      <Image
        source={require("../../assets/icons/gallery.png")}
        style={styles.previewIcon}
      />
      <Text style={styles.previewTitle}>Style Gallery</Text>
      <Text style={styles.previewText}>
        Browse and manage your{"\n"}favorited outfits
      </Text>
      <View style={styles.previewStats}>
        <Text style={styles.statsText}>Outfits: {savedOutfits.length}</Text>
      </View>
    </View>
  );

  const fullContent = (
    <View style={styles.fullContent}>
      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory === category.id && styles.categoryButtonSelected,
            ]}
            onPress={() => {
              setSelectedCategory(category.id);
              setCurrentOutfitIndex(0);
            }}
          >
            <Image source={category.icon} style={styles.categoryIcon} />
            <Text style={styles.categoryText}>{category.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Single Outfit View */}
      <View style={styles.outfitContainer}>
        {getFilteredOutfits().length === 0 ? (
          <View style={styles.emptyState}>
            <Image
              source={require("../../assets/icons/gallery.png")}
              style={styles.emptyIcon}
            />
            <Text style={styles.emptyTitle}>
              {selectedCategory === "all"
                ? "No Outfits Yet"
                : `No ${
                    categories.find((c) => c.id === selectedCategory)?.label
                  } Outfits`}
            </Text>
            <Text style={styles.emptyText}>
              {selectedCategory === "all"
                ? "Favorite some outfits in the Dress Me window to see them here!"
                : "No outfits in this category yet. Try favoriting some outfits first!"}
            </Text>
          </View>
        ) : (
          getCurrentOutfit() && renderOutfitView(getCurrentOutfit()!)
        )}
      </View>

      {/* Delete Confirmation Modal */}
      <Modal visible={showDeleteModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete Outfit</Text>
            <Text style={styles.modalText}>
              Are you sure you want to delete "{getCurrentOutfit()?.name}"? This
              action cannot be undone.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton]}
                onPress={deleteOutfit}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Outfit Modal */}
      <Modal visible={showEditModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Outfit</Text>

            <Text style={styles.inputLabel}>Outfit Name</Text>
            <View style={styles.nameInputContainer}>
              <TextInput
                style={styles.nameInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="Enter outfit name..."
                placeholderTextColor="#666"
              />
            </View>

            <Text style={styles.inputLabel}>Category</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryScrollModal}
            >
              {categories
                .filter((c) => c.id !== "all")
                .map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryOptionModal,
                      editCategory === category.id &&
                        styles.categoryOptionSelectedModal,
                    ]}
                    onPress={() => setEditCategory(category.id)}
                  >
                    <Image
                      source={category.icon}
                      style={styles.categoryIconModal}
                    />
                    <Text style={styles.categoryTextModal}>
                      {category.label}
                    </Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={updateOutfit}
                disabled={!editName.trim()}
              >
                <Text style={styles.saveButtonText}>Save Changes</Text>
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
  },
  fullContent: {
    flex: 1,
    padding: 10,
    backgroundColor: "#c0c0c0",
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
  },
  categoryScroll: {
    marginBottom: 10,
    maxHeight: 60,
  },
  categoryButton: {
    alignItems: "center",
    padding: 8,
    backgroundColor: "#c0c0c0",
    borderWidth: 2,
    borderColor: "#dfdfdf",
    borderTopColor: "#ffffff",
    borderLeftColor: "#ffffff",
    borderRightColor: "#808080",
    borderBottomColor: "#808080",
    marginRight: 8,
    minWidth: 80,
  },
  categoryButtonSelected: {
    borderColor: "#000",
    backgroundColor: "#ffffcc",
  },
  categoryIcon: {
    width: 20,
    height: 20,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
  },
  outfitContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#666",
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 18,
  },
  outfitView: {
    flex: 1,
  },
  outfitCanvas: {
    flex: 2,
    position: "relative",
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: "#000",
    marginBottom: 16,
    minHeight: 380,
  },
  outfitItem: {
    position: "absolute",
  },
  outfitItemImage: {
    borderRadius: 4,
  },
  emptyOutfit: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyOutfitIcon: {
    width: 64,
    height: 64,
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyOutfitText: {
    fontSize: 14,
    color: "#666",
  },
  outfitInfo: {
    flex: 1,
    backgroundColor: "#c0c0c0",
    borderWidth: 2,
    borderColor: "#dfdfdf",
    borderTopColor: "#ffffff",
    borderLeftColor: "#ffffff",
    borderRightColor: "#808080",
    borderBottomColor: "#808080",
    padding: 16,
  },
  outfitHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  outfitName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    flex: 1,
  },
  outfitCounter: {
    fontSize: 14,
    color: "#666",
    fontWeight: "bold",
  },
  outfitMeta: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  categoryTag: {
    alignSelf: "flex-start",
    backgroundColor: "#ffffcc",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 12,
  },
  categoryTagText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#000",
  },
  outfitActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  navButton: {
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
  navButtonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },
  mainActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#c0c0c0",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: "#dfdfdf",
    borderTopColor: "#ffffff",
    borderLeftColor: "#ffffff",
    borderRightColor: "#808080",
    borderBottomColor: "#808080",
    gap: 6,
  },
  deleteAction: {
    backgroundColor: "#ffcccc",
  },
  actionIcon: {
    width: 16,
    height: 16,
  },
  actionText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#000",
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
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  modalText: {
    fontSize: 14,
    marginBottom: 15,
    textAlign: "center",
    color: "#333",
    lineHeight: 18,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#000",
  },
  nameInputContainer: {
    borderWidth: 2,
    borderColor: "#dfdfdf",
    borderTopColor: "#808080",
    borderLeftColor: "#808080",
    borderRightColor: "#ffffff",
    borderBottomColor: "#ffffff",
    backgroundColor: "white",
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginBottom: 15,
  },
  nameInput: {
    fontSize: 14,
    color: "#000000",
    padding: 0,
    margin: 0,
  },
  categoryScrollModal: {
    marginBottom: 15,
    maxHeight: 60,
  },
  categoryOptionModal: {
    alignItems: "center",
    padding: 6,
    backgroundColor: "#c0c0c0",
    borderWidth: 2,
    borderColor: "#dfdfdf",
    borderTopColor: "#ffffff",
    borderLeftColor: "#ffffff",
    borderRightColor: "#808080",
    borderBottomColor: "#808080",
    marginRight: 6,
    minWidth: 70,
  },
  categoryOptionSelectedModal: {
    borderColor: "#000",
    backgroundColor: "#ffffcc",
  },
  categoryIconModal: {
    width: 20,
    height: 20,
    marginBottom: 2,
  },
  categoryTextModal: {
    fontSize: 9,
    fontWeight: "bold",
    textAlign: "center",
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
  },
  cancelButton: {
    backgroundColor: "#c0c0c0",
    borderWidth: 2,
    borderTopColor: "#ffffff",
    borderLeftColor: "#ffffff",
    borderRightColor: "#808080",
    borderBottomColor: "#808080",
  },
  deleteButton: {
    backgroundColor: "#ffcccc",
    borderWidth: 2,
    borderTopColor: "#ffffff",
    borderLeftColor: "#ffffff",
    borderRightColor: "#808080",
    borderBottomColor: "#808080",
  },
  saveButton: {
    backgroundColor: "#ffffcc",
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
  deleteButtonText: {
    color: "#000",
    fontWeight: "bold",
  },
  saveButtonText: {
    color: "#000",
    fontWeight: "bold",
  },
});

export default StyleGalleryWindow;
