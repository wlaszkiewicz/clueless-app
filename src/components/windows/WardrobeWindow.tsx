// Replace your WardrobeWindow component with this:
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  Dimensions,
  PanResponder,
  Animated,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import {
  WardrobeStorage,
  ClothingItem,
  DEFAULT_CATEGORIES,
} from "../../utils/WardrobeStorage";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const isMobile = screenWidth < 768;

const WardrobeWindow = () => {
  const [wardrobeItems, setWardrobeItems] = useState<ClothingItem[]>([]);
  const [selectedCategory, setSelectedCategory] =
    useState<string>("uncategorized");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    loadWardrobeData();
  }, []);

  const loadWardrobeData = async () => {
    const wardrobe = await WardrobeStorage.loadWardrobe();
    setWardrobeItems(wardrobe.items);
  };

  const pickImage = async () => {
    setIsUploading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const newItem: Omit<ClothingItem, "id" | "createdAt"> = {
          name: `Item ${wardrobeItems.length + 1}`,
          category: "uncategorized",
          imageUri: result.assets[0].uri,
          tags: [],
          isCategorized: false,
        };

        await WardrobeStorage.addItem(newItem);
        await loadWardrobeData();
      }
    } catch (error) {
      Alert.alert("Error", "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const uncategorizedItems = wardrobeItems.filter(
    (item) => !item.isCategorized
  );
  const categorizedItems = wardrobeItems.filter((item) => item.isCategorized);

  return (
    <View style={wardrobeStyles.container}>
      {/* Header with Upload Button */}
      <View style={wardrobeStyles.header}>
        <TouchableOpacity
          style={wardrobeStyles.uploadButton}
          onPress={pickImage}
          disabled={isUploading}
        >
          <Text style={wardrobeStyles.uploadButtonText}>
            {isUploading ? "UPLOADING..." : "📷 UPLOAD CLOTHES"}
          </Text>
        </TouchableOpacity>
        <Text style={wardrobeStyles.itemCount}>
          {wardrobeItems.length} items in wardrobe
        </Text>
      </View>

      <ScrollView style={wardrobeStyles.content}>
        {/* Categories Shelf - Pixel Art Style */}
        <View style={wardrobeStyles.shelfSection}>
          <Text style={wardrobeStyles.sectionTitle}>🧺 CLOSET SHELVES</Text>
          <View style={wardrobeStyles.categoriesGrid}>
            {DEFAULT_CATEGORIES.map((category) => (
              <CategoryShelf
                key={category}
                category={category}
                items={categorizedItems.filter(
                  (item) => item.category === category
                )}
                onItemDrop={(itemId) =>
                  WardrobeStorage.updateItemCategory(itemId, category).then(
                    loadWardrobeData
                  )
                }
              />
            ))}
          </View>
        </View>

        {/* Uncategorized Items - Laundry Basket */}
        <View style={wardrobeStyles.uncategorizedSection}>
          <Text style={wardrobeStyles.sectionTitle}>
            🧦 LAUNDRY BASKET (Uncategorized)
          </Text>
          <View style={wardrobeStyles.uncategorizedGrid}>
            {uncategorizedItems.map((item) => (
              <DraggableClothingItem
                key={item.id}
                item={item}
                onDragEnd={(position, targetCategory) => {
                  if (targetCategory) {
                    WardrobeStorage.updateItemCategory(
                      item.id,
                      targetCategory
                    ).then(loadWardrobeData);
                  }
                }}
              />
            ))}
            {uncategorizedItems.length === 0 && (
              <Text style={wardrobeStyles.emptyText}>
                Upload some clothes to get started! 📸
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

// Category Shelf Component
const CategoryShelf: React.FC<{
  category: string;
  items: ClothingItem[];
  onItemDrop: (itemId: string) => void;
}> = ({ category, items, onItemDrop }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <View
      style={[wardrobeStyles.shelf, isDragOver && wardrobeStyles.shelfDragOver]}
    >
      {/* Shelf Label with Pixel Art Style */}
      <View style={wardrobeStyles.shelfLabel}>
        <Text style={wardrobeStyles.shelfLabelText}>{category}</Text>
        <Text style={wardrobeStyles.itemCountText}>({items.length})</Text>
      </View>

      {/* Shelf Surface with Wood Grain Pixel Effect */}
      <View style={wardrobeStyles.shelfSurface}>
        {/* Items Grid */}
        <View style={wardrobeStyles.shelfItemsGrid}>
          {items.slice(0, isMobile ? 2 : 3).map((item) => (
            <ClothingItemThumbnail key={item.id} item={item} />
          ))}
          {items.length === 0 && (
            <Text style={wardrobeStyles.emptyShelfText}>Empty</Text>
          )}
        </View>
      </View>

      {/* Drop Zone - Invisible area that accepts drops */}
      <View
        style={wardrobeStyles.dropZone}
        onStartShouldSetResponder={() => true}
        onResponderGrant={() => setIsDragOver(true)}
        onResponderRelease={() => setIsDragOver(false)}
        onResponderTerminate={() => setIsDragOver(false)}
      />
    </View>
  );
};

// Draggable Clothing Item Component
const DraggableClothingItem: React.FC<{
  item: ClothingItem;
  onDragEnd: (
    position: { x: number; y: number },
    targetCategory?: string
  ) => void;
}> = ({ item, onDragEnd }) => {
  const pan = useRef(new Animated.ValueXY()).current;
  const [isDragging, setIsDragging] = useState(false);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      setIsDragging(true);
      pan.setOffset({
        x: (pan.x as any)._value,
        y: (pan.y as any)._value,
      });
    },
    onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
      useNativeDriver: false,
    }),
    onPanResponderRelease: (_, gesture) => {
      setIsDragging(false);
      pan.flattenOffset();

      // Calculate drop position and determine target category
      const dropPosition = { x: gesture.moveX, y: gesture.moveY };

      // Simple category detection based on screen position
      // In a real app, you'd use more sophisticated hit testing
      const targetCategory = findCategoryAtPosition(dropPosition);

      onDragEnd(dropPosition, targetCategory);

      // Return to original position
      Animated.spring(pan, {
        toValue: { x: 0, y: 0 },
        useNativeDriver: false,
      }).start();
    },
  });

  return (
    <Animated.View
      style={[
        wardrobeStyles.draggableItem,
        isDragging && wardrobeStyles.draggingItem,
        { transform: pan.getTranslateTransform() },
      ]}
      {...panResponder.panHandlers}
    >
      <ClothingItemThumbnail item={item} />
    </Animated.View>
  );
};

// Clothing Item Thumbnail Component
const ClothingItemThumbnail: React.FC<{ item: ClothingItem }> = ({ item }) => {
  return (
    <View style={wardrobeStyles.itemThumbnail}>
      <Image
        source={{ uri: item.imageUri }}
        style={wardrobeStyles.itemImage}
        resizeMode="cover"
      />
      <Text style={wardrobeStyles.itemName} numberOfLines={1}>
        {item.name}
      </Text>
    </View>
  );
};

// Helper function to find category at position (simplified)
const findCategoryAtPosition = (position: {
  x: number;
  y: number;
}): string | undefined => {
  // This is a simplified version - you'd need more sophisticated hit testing
  // For now, we'll use a basic approach based on screen sections
  const shelfHeight = 120;
  const categoryIndex = Math.floor(position.y / shelfHeight);

  if (categoryIndex >= 0 && categoryIndex < DEFAULT_CATEGORIES.length) {
    return DEFAULT_CATEGORIES[categoryIndex];
  }

  return undefined;
};

const wardrobeStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffebf3", // Light pink background
    padding: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  uploadButton: {
    backgroundColor: "#ff66b2", // Pink accent
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: "#dfdfdf",
    borderTopColor: "#ffffff",
    borderLeftColor: "#ffffff",
    borderRightColor: "#808080",
    borderBottomColor: "#808080",
  },
  uploadButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 12,
    fontFamily: "MS Sans Serif, System",
    textShadowColor: "#000000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  itemCount: {
    fontSize: 11,
    color: "#000000",
    fontFamily: "MS Sans Serif, System",
  },
  content: {
    flex: 1,
  },
  shelfSection: {
    marginBottom: 24,
  },
  uncategorizedSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000000",
    fontFamily: "MS Sans Serif, System",
    marginBottom: 8,
    backgroundColor: "#ffccdd",
    padding: 8,
    borderWidth: 1,
    borderColor: "#ff66b2",
    textAlign: "center",
  },
  categoriesGrid: {
    flexDirection: "column",
    gap: 4,
  },
  shelf: {
    backgroundColor: "#8b4513", // Wood brown
    marginVertical: 2,
    borderWidth: 2,
    borderColor: "#a0522d",
    borderTopColor: "#deb887",
    borderLeftColor: "#deb887",
    borderRightColor: "#654321",
    borderBottomColor: "#654321",
    position: "relative",
    minHeight: 100,
  },
  shelfDragOver: {
    backgroundColor: "#9d6b3d",
  },
  shelfLabel: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: "#ff66b2",
  },
  shelfLabelText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "bold",
    fontFamily: "MS Sans Serif, System",
    textShadowColor: "#000000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  itemCountText: {
    color: "#ffffff",
    fontSize: 10,
    fontFamily: "MS Sans Serif, System",
  },
  shelfSurface: {
    padding: 8,
    minHeight: 80,
  },
  shelfItemsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  emptyShelfText: {
    fontSize: 10,
    color: "#666666",
    fontStyle: "italic",
    fontFamily: "MS Sans Serif, System",
    textAlign: "center",
    width: "100%",
    marginTop: 20,
  },
  dropZone: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  uncategorizedGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "center",
    padding: 8,
    backgroundColor: "#e6f2ff",
    borderWidth: 2,
    borderColor: "#dfdfdf",
    borderTopColor: "#ffffff",
    borderLeftColor: "#ffffff",
    borderRightColor: "#808080",
    borderBottomColor: "#808080",
    minHeight: 120,
  },
  draggableItem: {
    alignItems: "center",
  },
  draggingItem: {
    zIndex: 1000,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 8,
  },
  itemThumbnail: {
    alignItems: "center",
    width: 80,
  },
  itemImage: {
    width: 70,
    height: 70,
    borderWidth: 2,
    borderColor: "#ffffff",
    borderTopColor: "#808080",
    borderLeftColor: "#808080",
    borderRightColor: "#dfdfdf",
    borderBottomColor: "#dfdfdf",
  },
  itemName: {
    fontSize: 10,
    color: "#000000",
    fontFamily: "MS Sans Serif, System",
    marginTop: 4,
    textAlign: "center",
    maxWidth: 70,
  },
  emptyText: {
    fontSize: 12,
    color: "#666666",
    fontStyle: "italic",
    fontFamily: "MS Sans Serif, System",
    textAlign: "center",
    marginTop: 40,
  },
});

export default WardrobeWindow;
