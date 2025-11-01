import React, { useState, useEffect, useRef } from "react";
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
  Platform,
} from "react-native";
import { captureRef } from "react-native-view-shot";
import { wardrobeStorage, WardrobeItem } from "../../utils/storage";
import Draggable from "./../Draggable";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface CreateOutfitWindowProps {
  isFullscreen?: boolean;
  isMobile?: boolean;
}

interface CanvasOutfitItem {
  id: string;
  item: WardrobeItem;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

const CreateOutfitWindow: React.FC<CreateOutfitWindowProps> = ({
  isFullscreen = false,
  isMobile = false,
}) => {
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([]);
  const [outfitItems, setOutfitItems] = useState<CanvasOutfitItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [canvasSize, setCanvasSize] = useState({ width: 400, height: 400 });
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");
  const [showBackgroundPicker, setShowBackgroundPicker] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showControls, setShowControls] = useState(true);
  const canvasRef = useRef<View>(null);

  const backgroundColors = [
    "#FFFFFF",
    "#F0F0F0",
    "#F8F8F8",
    "#E8E8E8",
    "#000000",
    "#333333",
    "#666666",
    "#999999",
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEAA7",
    "#DDA0DD",
    "#98D8C8",
    "#F7DC6F",
    "#BB8FCE",
    "#85C1E9",
    "#F8C471",
    "#82E0AA",
  ];

  const categories = [
    {
      id: "all",
      label: "All Items",
      icon: require("../../assets/icons/outfit.png"),
    },
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
    measureCanvas();
  }, []);

  const showAlert = (title: string, message: string) => {
    setAlertMessage(`${title}\n\n${message}`);
    setShowAlertModal(true);
  };

  const loadWardrobeItems = async () => {
    try {
      const items = await wardrobeStorage.getItems();
      setWardrobeItems(items);
    } catch (error) {
      console.error("❌ Failed to load items:", error);
      showAlert("Error", "Failed to load wardrobe items");
    }
  };

  const measureCanvas = () => {
    setTimeout(() => {
      if (canvasRef.current) {
        canvasRef.current.measure((x, y, width, height) => {
          if (width > 0 && height > 0) {
            setCanvasSize({ width, height });
          }
        });
      }
    }, 100);
  };

  const getFilteredItems = () => {
    if (selectedCategory === "all") {
      return wardrobeItems;
    }
    return wardrobeItems.filter((item) => item.category === selectedCategory);
  };

  const addItemToCanvas = (item: WardrobeItem) => {
    const newOutfitItem: CanvasOutfitItem = {
      id: `${item.id}-${Date.now()}`,
      item,
      position: {
        x: Math.random() * (canvasSize.width - 80),
        y: Math.random() * (canvasSize.height - 80),
      },
      size: { width: 80, height: 80 },
    };
    setOutfitItems((prev) => [...prev, newOutfitItem]);
  };

  const handleCanvasItemDrag = (
    itemId: string,
    position: { x: number; y: number }
  ) => {
    setOutfitItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, position } : item))
    );
  };

  const handleCanvasItemResize = (
    itemId: string,
    direction: "increase" | "decrease"
  ) => {
    setOutfitItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const scaleFactor = direction === "increase" ? 1.2 : 0.8;
          const newSize = {
            width: Math.max(40, Math.min(200, item.size.width * scaleFactor)),
            height: Math.max(40, Math.min(200, item.size.height * scaleFactor)),
          };
          return { ...item, size: newSize };
        }
        return item;
      })
    );
  };

  const removeItemFromCanvas = (itemId: string) => {
    setOutfitItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const clearCanvas = () => {
    setOutfitItems([]);
    setBackgroundColor("#FFFFFF");
  };

  const captureWebScreenshot = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (Platform.OS === "web") {
        import("html2canvas")
          .then((html2canvas) => {
            const canvasElement = document.getElementById("outfit-canvas");
            if (canvasElement) {
              setShowControls(false);

              setTimeout(() => {
                html2canvas
                  .default(canvasElement, {
                    backgroundColor: backgroundColor,
                    scale: 2,
                    useCORS: true,
                    allowTaint: true,
                  })
                  .then((canvas) => {
                    setShowControls(true);
                    resolve(canvas.toDataURL("image/png"));
                  })
                  .catch((error) => {
                    setShowControls(true);
                    reject(error);
                  });
              }, 100);
            } else {
              reject(new Error("Canvas element not found"));
            }
          })
          .catch(reject);
      } else {
        reject(new Error("Web capture only available on web platform"));
      }
    });
  };

  const captureNativeScreenshot = async (): Promise<string> => {
    try {
      setShowControls(false);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const uri = await captureRef(canvasRef, {
        format: "png",
        quality: 1.0,
      });

      setShowControls(true);
      return uri;
    } catch (error) {
      setShowControls(true);
      throw new Error(`Native capture failed: ${error}`);
    }
  };

  const saveOutfitAsImage = async () => {
    if (outfitItems.length === 0) {
      showAlert("No Items", "Add some items to the canvas first!");
      return;
    }

    try {
      let imageUri: string;

      if (Platform.OS === "web") {
        imageUri = await captureWebScreenshot();

        const link = document.createElement("a");
        link.download = `outfit-${Date.now()}.png`;
        link.href = imageUri;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showAlert("Success!", "Outfit image downloaded! 📸");
      } else {
        imageUri = await captureNativeScreenshot();
        showAlert(
          "Outfit Captured! 📸",
          `Image saved successfully!\n\nIn a production app, this would save to your photo gallery.`
        );
      }
    } catch (error) {
      console.error("Error saving outfit image:", error);

      if (Platform.OS === "web") {
        showAlert(
          "Feature Not Available",
          "Image download requires additional setup. For now, you can take a screenshot manually or try the native app version."
        );
      } else {
        showAlert("Error", "Failed to save outfit image. Please try again.");
      }
    }
  };

  const mobilePreviewContent = (
    <View style={windowStyles.previewContent}>
      <Image
        source={require("../../assets/icons/outfit.png")}
        style={windowStyles.previewIcon}
      />
      <Text style={windowStyles.previewTitle}>Create Outfit</Text>
      <Text style={windowStyles.previewText}>
        Mix and match your clothes{"\n"}Create stylish combinations
      </Text>
      <View style={windowStyles.previewStats}>
        <Text style={windowStyles.statsText}>
          Items: {wardrobeItems.length}
        </Text>
      </View>
    </View>
  );

  const renderCanvasItem = (outfitItem: CanvasOutfitItem) => (
    <Draggable
      key={outfitItem.id}
      initialPosition={outfitItem.position}
      onDrag={(position) => handleCanvasItemDrag(outfitItem.id, position)}
    >
      <View
        style={[
          windowStyles.canvasItem,
          {
            width: outfitItem.size.width,
            height: outfitItem.size.height,
          },
        ]}
      >
        <Image
          source={{ uri: outfitItem.item.imageUri }}
          style={[
            windowStyles.canvasItemImage,
            {
              width: outfitItem.size.width,
              height: outfitItem.size.height,
            },
          ]}
        />

        {showControls && (
          <TouchableOpacity
            style={windowStyles.removeItemButton}
            onPress={() => removeItemFromCanvas(outfitItem.id)}
          >
            <Text style={windowStyles.removeItemText}>×</Text>
          </TouchableOpacity>
        )}

        {showControls && (
          <View style={windowStyles.resizeControls} pointerEvents="box-none">
            <TouchableOpacity
              style={[windowStyles.resizeButton, windowStyles.decreaseButton]}
              onPress={() => handleCanvasItemResize(outfitItem.id, "decrease")}
            >
              <Text style={windowStyles.resizeButtonText}>-</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[windowStyles.resizeButton, windowStyles.increaseButton]}
              onPress={() => handleCanvasItemResize(outfitItem.id, "increase")}
            >
              <Text style={windowStyles.resizeButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Draggable>
  );

  const ToolbarButton = ({
    icon,
    label,
    onPress,
    style = {},
  }: {
    icon: any;
    label: string;
    onPress: () => void;
    style?: any;
  }) => (
    <TouchableOpacity
      style={[windowStyles.toolbarButton, style]}
      onPress={onPress}
    >
      <View style={windowStyles.toolbarButtonContent}>
        <Image source={icon} style={windowStyles.toolbarIcon} />
        <Text style={windowStyles.toolbarText}>{label}</Text>
      </View>
    </TouchableOpacity>
  );

  const mobileFullContent = (
    <View style={windowStyles.mobileFullContent}>
      <Text style={windowStyles.fullTitle}>Create Outfit</Text>

      <View style={windowStyles.mobileToolbar}>
        <ToolbarButton
          icon={require("../../assets/icons/palette.png")}
          label="Background"
          onPress={() => setShowBackgroundPicker(true)}
        />
        <ToolbarButton
          icon={require("../../assets/icons/trash-icon.png")}
          label="Clear"
          onPress={clearCanvas}
        />
        <ToolbarButton
          icon={require("../../assets/icons/camera.png")}
          label="Save Image"
          onPress={saveOutfitAsImage}
          style={windowStyles.pinkButton}
        />
      </View>

      <View style={windowStyles.mobileCanvasSection}>
        <View
          ref={canvasRef}
          id="outfit-canvas"
          style={windowStyles.mobileCanvas}
          onLayout={measureCanvas}
          collapsable={false}
        >
          <View style={[windowStyles.canvasBackground, { backgroundColor }]} />
          {outfitItems.map(renderCanvasItem)}

          {outfitItems.length === 0 && (
            <View style={windowStyles.emptyCanvas}>
              <Image
                source={require("../../assets/icons/outfit.png")}
                style={windowStyles.emptyCanvasIcon}
              />
              <Text style={windowStyles.emptyCanvasText}>
                Tap items below to add them!
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={windowStyles.mobileBottomSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={windowStyles.mobileCategoryScroll}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                windowStyles.mobileCategoryButton,
                selectedCategory === category.id &&
                  windowStyles.categoryButtonSelected,
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Image
                source={category.icon}
                style={windowStyles.mobileCategoryIcon}
              />
              <Text style={windowStyles.mobileCategoryText}>
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView style={windowStyles.mobileItemsGrid}>
          {getFilteredItems().map((item) => (
            <TouchableOpacity
              key={item.id}
              style={windowStyles.mobileWardrobeItem}
              onPress={() => addItemToCanvas(item)}
            >
              <Image
                source={{ uri: item.imageUri }}
                style={windowStyles.mobileWardrobeItemImage}
              />
              <Text
                style={windowStyles.mobileWardrobeItemName}
                numberOfLines={1}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}

          {getFilteredItems().length === 0 && (
            <View style={windowStyles.emptyWardrobe}>
              <Text style={windowStyles.emptyWardrobeText}>
                No items in{" "}
                {selectedCategory === "all" ? "your wardrobe" : "this category"}
              </Text>
            </View>
          )}
        </ScrollView>
      </View>

      <Modal visible={showBackgroundPicker} transparent animationType="fade">
        <View style={windowStyles.modalOverlay}>
          <View
            style={[windowStyles.modalContent, windowStyles.colorModalContent]}
          >
            <Text style={windowStyles.modalTitle}>Choose Background Color</Text>
            <View style={windowStyles.colorGrid}>
              {backgroundColors.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    windowStyles.colorOption,
                    { backgroundColor: color },
                    backgroundColor === color &&
                      windowStyles.colorOptionSelected,
                  ]}
                  onPress={() => {
                    setBackgroundColor(color);
                    setShowBackgroundPicker(false);
                  }}
                />
              ))}
            </View>
            <TouchableOpacity
              style={[windowStyles.modalButton, windowStyles.cancelButton]}
              onPress={() => setShowBackgroundPicker(false)}
            >
              <Text style={windowStyles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showAlertModal} transparent animationType="fade">
        <View style={windowStyles.modalOverlay}>
          <View style={windowStyles.modalContent}>
            <Text style={windowStyles.modalTitle}>Alert</Text>
            <Text style={windowStyles.modalText}>{alertMessage}</Text>
            <TouchableOpacity
              style={[windowStyles.modalButton, windowStyles.saveButton]}
              onPress={() => setShowAlertModal(false)}
            >
              <Text style={windowStyles.saveButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );

  const desktopFullContent = (
    <View style={windowStyles.fullContent}>
      <Text style={windowStyles.fullSubtitle}>
        Drag items from your wardrobe to the canvas to create outfits
      </Text>

      <View style={windowStyles.desktopToolbar}>
        <ToolbarButton
          icon={require("../../assets/icons/palette.png")}
          label="Background"
          onPress={() => setShowBackgroundPicker(true)}
        />
        <ToolbarButton
          icon={require("../../assets/icons/trash-icon.png")}
          label="Clear Canvas"
          onPress={clearCanvas}
        />
        <ToolbarButton
          icon={require("../../assets/icons/camera.png")}
          label="Save as Image"
          onPress={saveOutfitAsImage}
          style={windowStyles.pinkButton}
        />
      </View>

      <View style={windowStyles.mainLayout}>
        <View style={windowStyles.canvasSection}>
          <View
            ref={canvasRef}
            id="outfit-canvas"
            style={windowStyles.canvas}
            onLayout={measureCanvas}
            collapsable={false}
          >
            <View
              style={[windowStyles.canvasBackground, { backgroundColor }]}
            />
            {outfitItems.map(renderCanvasItem)}

            {outfitItems.length === 0 && (
              <View style={windowStyles.emptyCanvas}>
                <Image
                  source={require("../../assets/icons/outfit.png")}
                  style={windowStyles.emptyCanvasIcon}
                />
                <Text style={windowStyles.emptyCanvasText}>
                  Drag items from your wardrobe to start creating!
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={windowStyles.rightSection}>
          <View style={windowStyles.wardrobeSection}>
            <Text style={windowStyles.sectionTitle}>Your Wardrobe</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={windowStyles.categoryScroll}
            >
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    windowStyles.categoryButton,
                    selectedCategory === category.id &&
                      windowStyles.categoryButtonSelected,
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <Image
                    source={category.icon}
                    style={windowStyles.categoryIcon}
                  />
                  <Text style={windowStyles.categoryText}>
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <ScrollView style={windowStyles.itemsGrid}>
              {getFilteredItems().map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={windowStyles.wardrobeItem}
                  onPress={() => addItemToCanvas(item)}
                >
                  <Image
                    source={{ uri: item.imageUri }}
                    style={windowStyles.wardrobeItemImage}
                  />
                </TouchableOpacity>
              ))}

              {getFilteredItems().length === 0 && (
                <View style={windowStyles.emptyWardrobe}>
                  <Text style={windowStyles.emptyWardrobeText}>
                    No items in{" "}
                    {selectedCategory === "all"
                      ? "your wardrobe"
                      : "this category"}
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </View>

      {/* Modals for desktop */}
      <Modal visible={showBackgroundPicker} transparent animationType="fade">
        <View style={windowStyles.modalOverlay}>
          <View
            style={[windowStyles.modalContent, windowStyles.colorModalContent]}
          >
            <Text style={windowStyles.modalTitle}>Choose Background Color</Text>
            <View style={windowStyles.colorGrid}>
              {backgroundColors.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    windowStyles.colorOption,
                    { backgroundColor: color },
                    backgroundColor === color &&
                      windowStyles.colorOptionSelected,
                  ]}
                  onPress={() => {
                    setBackgroundColor(color);
                    setShowBackgroundPicker(false);
                  }}
                />
              ))}
            </View>
            <TouchableOpacity
              style={[windowStyles.modalButton, windowStyles.cancelButton]}
              onPress={() => setShowBackgroundPicker(false)}
            >
              <Text style={windowStyles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showAlertModal} transparent animationType="fade">
        <View style={windowStyles.modalOverlay}>
          <View style={windowStyles.modalContent}>
            <Text style={windowStyles.modalTitle}>Alert</Text>
            <Text style={windowStyles.modalText}>{alertMessage}</Text>
            <TouchableOpacity
              style={[windowStyles.modalButton, windowStyles.saveButton]}
              onPress={() => setShowAlertModal(false)}
            >
              <Text style={windowStyles.saveButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );

  const fullContent = isMobile ? mobileFullContent : desktopFullContent;

  return isMobile && !isFullscreen ? mobilePreviewContent : fullContent;
};

const windowStyles = StyleSheet.create({
  desktopToolbar: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  mobileToolbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  toolbarButton: {
    backgroundColor: "#c0c0c0",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: "#dfdfdf",
    borderTopColor: "#ffffff",
    borderLeftColor: "#ffffff",
    borderRightColor: "#808080",
    borderBottomColor: "#808080",
    alignItems: "center",
    minWidth: 100,
  },
  toolbarButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  toolbarIcon: {
    width: 20,
    height: 20,
  },
  toolbarText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
  },
  pinkButton: {
    backgroundColor: "#CB78A3FFFF",
    borderColor: "#ff3385",
    borderTopColor: "#ff99cc",
    borderLeftColor: "#ff99cc",
    borderRightColor: "#e60073",
    borderBottomColor: "#e60073",
  },

  mobileCanvasSection: {
    flex: 2,
    backgroundColor: "#c0c0c0",
    borderWidth: 2,
    borderColor: "#dfdfdf",
    borderTopColor: "#ffffff",
    borderLeftColor: "#ffffff",
    borderRightColor: "#808080",
    borderBottomColor: "#808080",
    padding: 8,
    marginBottom: 12,
  },

  canvasHeader: {
    display: "none",
  },

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
    padding: 16,
    backgroundColor: "#c0c0c0",
  },
  fullTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#000",
  },
  fullSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  mainLayout: {
    flex: 1,
    flexDirection: "row",
    gap: 16,
  },
  canvasSection: {
    flex: 2,
    backgroundColor: "#c0c0c0",
    borderWidth: 2,
    borderColor: "#dfdfdf",
    borderTopColor: "#ffffff",
    borderLeftColor: "#ffffff",
    borderRightColor: "#808080",
    borderBottomColor: "#808080",
    padding: 12,
  },
  rightSection: {
    flex: 1,
    gap: 16,
    minWidth: 280,
  },
  wardrobeSection: {
    flex: 1,
    backgroundColor: "#c0c0c0",
    borderWidth: 2,
    borderColor: "#dfdfdf",
    borderTopColor: "#ffffff",
    borderLeftColor: "#ffffff",
    borderRightColor: "#808080",
    borderBottomColor: "#808080",
    padding: 12,
    minHeight: 300,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
  },
  canvasControls: {
    display: "none",
  },
  canvasButton: {
    display: "none",
  },
  saveImageButton: {
    display: "none",
  },
  canvasButtonText: {
    display: "none",
  },
  canvas: {
    flex: 1,
    backgroundColor: "transparent",
    position: "relative",
    minHeight: 400,
  },
  canvasBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#000",
  },
  canvasItem: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  canvasItemImage: {
    borderRadius: 4,
  },
  removeItemButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#ff4444",
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#000",
  },
  removeItemText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
    lineHeight: 16,
  },
  resizeControls: {
    position: "absolute",
    bottom: -30,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  resizeButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333",
  },
  increaseButton: {
    backgroundColor: "#4CAF50",
  },
  decreaseButton: {
    backgroundColor: "#f44336",
  },
  resizeButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
  emptyCanvas: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  emptyCanvasIcon: {
    width: 64,
    height: 64,
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyCanvasText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  categoryScroll: {
    marginBottom: 12,
    maxHeight: 80,
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
    minWidth: 70,
  },
  categoryButtonSelected: {
    borderColor: "#000",
    backgroundColor: "#ffffcc",
  },
  categoryIcon: {
    width: 32,
    height: 32,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
  },
  itemsGrid: {
    flex: 1,
  },
  wardrobeItem: {
    alignItems: "center",
    padding: 8,
    backgroundColor: "#c0c0c0",
    borderWidth: 2,
    borderColor: "#dfdfdf",
    borderTopColor: "#ffffff",
    borderLeftColor: "#ffffff",
    borderRightColor: "#808080",
    borderBottomColor: "#808080",
    marginBottom: 8,
  },
  wardrobeItemImage: {
    width: 60,
    height: 60,
    marginBottom: 4,
  },
  wardrobeItemName: {
    fontSize: 10,
    textAlign: "center",
    color: "#000",
    maxWidth: 80,
  },
  emptyWardrobe: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  emptyWardrobeText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
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
  colorModalContent: {
    maxWidth: 500,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  modalText: {
    fontSize: 14,
    marginBottom: 15,
    textAlign: "center",
    color: "#333",
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
  saveButtonText: {
    color: "#000",
    fontWeight: "bold",
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginBottom: 15,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderWidth: 2,
    borderColor: "#000",
  },
  colorOptionSelected: {
    borderWidth: 4,
    borderColor: "#ff0000",
  },

  // Mobile-specific styles
  mobileFullContent: {
    flex: 1,
    padding: 12,
    backgroundColor: "#c0c0c0",
  },
  mobileCanvas: {
    flex: 1,
    backgroundColor: "transparent",
    position: "relative",
    minHeight: 300,
  },
  mobileBottomSection: {
    flex: 1,
    backgroundColor: "#c0c0c0",
    borderWidth: 2,
    borderColor: "#dfdfdf",
    borderTopColor: "#ffffff",
    borderLeftColor: "#ffffff",
    borderRightColor: "#808080",
    borderBottomColor: "#808080",
    padding: 8,
  },
  mobileCanvasControls: {
    display: "none",
  },
  mobileCategoryScroll: {
    marginBottom: 8,
    maxHeight: 60,
  },
  mobileCategoryButton: {
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
    minWidth: 60,
  },
  mobileCategoryIcon: {
    width: 24,
    height: 24,
    marginBottom: 2,
  },
  mobileCategoryText: {
    fontSize: 8,
    fontWeight: "bold",
    textAlign: "center",
  },
  mobileItemsGrid: {
    flex: 1,
  },
  mobileWardrobeItem: {
    alignItems: "center",
    padding: 6,
    backgroundColor: "#c0c0c0",
    borderWidth: 2,
    borderColor: "#dfdfdf",
    borderTopColor: "#ffffff",
    borderLeftColor: "#ffffff",
    borderRightColor: "#808080",
    borderBottomColor: "#808080",
    marginBottom: 6,
    marginRight: 6,
    width: 70,
  },
  mobileWardrobeItemImage: {
    width: 40,
    height: 40,
    marginBottom: 2,
  },
  mobileWardrobeItemName: {
    fontSize: 8,
    textAlign: "center",
    color: "#000",
    maxWidth: 60,
  },
});

export default CreateOutfitWindow;
