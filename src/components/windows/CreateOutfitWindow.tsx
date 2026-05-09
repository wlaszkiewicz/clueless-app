import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  Platform,
} from "react-native";
import MobilePreview, { previewStatText } from "./MobilePreview";
import { captureRef } from "react-native-view-shot";
import { wardrobeStorage, WardrobeItem } from "../../utils/storage";
import Draggable from "./../Draggable";
import { windowStyles } from "./CreateOutfitWindow.styles";


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

  if (isMobile && !isFullscreen) {
    return (
      <MobilePreview
        icon={require("../../assets/icons/outfit.png")}
        title="Create Outfit"
        text={"Mix and match your clothes\nCreate stylish combinations"}
      >
        <Text style={previewStatText.base}>Items: {wardrobeItems.length}</Text>
      </MobilePreview>
    );
  }

  return fullContent;
};


export default CreateOutfitWindow;
