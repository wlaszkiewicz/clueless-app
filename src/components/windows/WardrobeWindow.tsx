import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Modal,
  LayoutRectangle,
} from "react-native";
import { wardrobeStorage, WardrobeItem } from "../../utils/storage";
import Draggable from "./../Draggable";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface WardrobeWindowProps {
  isFullscreen?: boolean;
  isMobile?: boolean;
}

type FurnitureType =
  | "wardrobe"
  | "hanger"
  | "shoeShelf"
  | "jewelryBox"
  | "floor";

type ItemSizes = {
  [key: string]: { width: number; height: number };
};

const WardrobeWindow: React.FC<WardrobeWindowProps> = ({
  isFullscreen = false,
  isMobile = false,
}) => {
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([]);
  const [itemPositions, setItemPositions] = useState<{
    [key: string]: { x: number; y: number };
  }>({});
  const [itemSizes, setItemSizes] = useState<ItemSizes>({});
  const [currentView, setCurrentView] = useState<FurnitureType | null>(null);
  const [furnitureBounds, setFurnitureBounds] = useState<{
    [key: string]: { x: number; y: number; width: number; height: number };
  }>({});
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const [roomBounds, setRoomBounds] = useState({
    width: isMobile ? screenWidth - 32 : 650,
    height: isMobile ? 500 : 400,
  });

  const [containerBounds, setContainerBounds] = useState<{
    [key: string]: { width: number; height: number };
  }>({
    wardrobe: { width: isMobile ? 280 : 300, height: isMobile ? 320 : 350 },
    shoeShelf: { width: isMobile ? 220 : 250, height: isMobile ? 180 : 200 },
    jewelryBox: { width: isMobile ? 180 : 200, height: isMobile ? 130 : 150 },
    hanger: { width: isMobile ? 250 : 280, height: isMobile ? 280 : 300 },
  });

  const [floorOffset, setFloorOffset] = useState({ x: 0, y: 0 });
  const [furnitureRowOffset, setFurnitureRowOffset] = useState({ x: 0, y: 0 });

  const [isLayoutMeasured, setIsLayoutMeasured] = useState(false);

  // Refs
  const roomLayoutRef = useRef<View>(null);
  const floorAreaRef = useRef<View>(null);
  const furnitureRowRef = useRef<View>(null);

  useEffect(() => {
    setTimeout(() => {
      loadWardrobeItems();
    }, 200);
  }, [currentView, isLayoutMeasured, JSON.stringify(floorOffset)]);

  useEffect(() => {
    if (!currentView) {
      setSelectedItem(null);
    }
  }, [currentView]);

  const handleRoomLayout = (e: any) => {
    const { width, height } = e.nativeEvent.layout;
    console.log("📐 Room Layout:", { width, height });
    setRoomBounds({ width, height });
  };

  const handleFloorLayout = (e: any) => {
    const { x, y } = e.nativeEvent.layout;
    console.log("📐 Floor Offset:", { x, y });
    setFloorOffset({ x, y });
    setIsLayoutMeasured(true);
  };

  const handleFurnitureRowLayout = (e: any) => {
    if (roomLayoutRef.current) {
      roomLayoutRef.current.measure(
        (rx, ry, rwidth, rheight, rpageX, rpageY) => {
          const { x, y } = e.nativeEvent.layout;
          const offsetX = x;
          const offsetY = y;
          console.log("📐 FurnitureRow Offset:", { offsetX, offsetY });
          setFurnitureRowOffset({ x: offsetX, y: offsetY });
        }
      );
    }
  };

  const handleFurnitureLayout = (furnitureType: string, e: any) => {
    const { x, y, width, height } = e.nativeEvent.layout;
    const adjustedX = x + furnitureRowOffset.x;
    const adjustedY = y + furnitureRowOffset.y;
    setFurnitureBounds((prev) => ({
      ...prev,
      [furnitureType]: { x: adjustedX, y: adjustedY, width, height },
    }));
    console.log(`📐 ${furnitureType} Bounds:`, {
      x: adjustedX,
      y: adjustedY,
      width,
      height,
    });
  };

  const handleContainerLayout = (container: string, e: any) => {
    const { width, height } = e.nativeEvent.layout;
    setContainerBounds((prev) => ({
      ...prev,
      [container]: { width, height },
    }));
  };

  const loadWardrobeItems = async () => {
    try {
      const items = await wardrobeStorage.getItems();
      console.log("🔄 Loaded items:", items.length);
      console.log("📐 Current floorOffset:", floorOffset);

      setWardrobeItems(items);

      const initialPositions: { [key: string]: { x: number; y: number } } = {};
      const initialSizes: ItemSizes = {};

      items.forEach((item) => {
        if (item.position) {
          initialPositions[item.id] = item.position;
        } else if (!item.placedIn || item.placedIn === "floor") {
          const floorItemCount = Object.keys(initialPositions).filter(
            (id) =>
              !items.find((i) => i.id === id)?.placedIn ||
              items.find((i) => i.id === id)?.placedIn === "floor"
          ).length;

          const MOBILE_SPACING = isMobile ? 60 : 70;
          const SPAWN_Y_OFFSET = isMobile ? 50 : 200;
          const STATUSBAR_HEIGHT = isMobile ? 40 : 0;

          let baseFloorY;
          if (isFullscreen && isMobile) {
            baseFloorY = STATUSBAR_HEIGHT + 100;
          } else {
            baseFloorY =
              floorOffset.y > 0
                ? floorOffset.y + SPAWN_Y_OFFSET
                : isMobile
                ? 250
                : 350;
          }
          initialPositions[item.id] = {
            x: 20 + (floorItemCount % (isMobile ? 4 : 6)) * MOBILE_SPACING,
            y:
              baseFloorY + Math.floor(floorItemCount / (isMobile ? 4 : 6)) * 75,
          };

          initialPositions[item.id] = {
            x: 20 + (floorItemCount % (isMobile ? 4 : 6)) * MOBILE_SPACING,
            y:
              baseFloorY + Math.floor(floorItemCount / (isMobile ? 4 : 6)) * 75,
          };

          console.log(
            `📍 Item ${item.id} position:`,
            initialPositions[item.id]
          );
        }

        if (item.customSize) {
          initialSizes[item.id] = item.customSize;
        } else {
          const container =
            (item.placedIn as FurnitureType | undefined) ?? "floor";
          initialSizes[item.id] = getDefaultSizeForContainer(container);
        }
      });

      setItemPositions(initialPositions);
      setItemSizes(initialSizes);
    } catch (error) {
      console.error("❌ Failed to load items:", error);
    }
  };

  const getDefaultSizeForContainer = (container: FurnitureType) => {
    const defaultSizes = {
      floor: isMobile ? { width: 50, height: 50 } : { width: 60, height: 60 },
      wardrobe: isMobile
        ? { width: 50, height: 50 }
        : { width: 60, height: 60 },
      shoeShelf: isMobile
        ? { width: 45, height: 45 }
        : { width: 50, height: 50 },
      jewelryBox: isMobile
        ? { width: 35, height: 35 }
        : { width: 40, height: 40 },
      hanger: isMobile ? { width: 50, height: 70 } : { width: 60, height: 80 },
    };
    return defaultSizes[container];
  };

  const handleItemDrag = async (
    itemId: string,
    position: { x: number; y: number },
    container: FurnitureType = "floor"
  ) => {
    const item = wardrobeItems.find((i) => i.id === itemId);
    if (!item) return;

    const currentSize =
      itemSizes[item.id] || getDefaultSizeForContainer(container);
    const { width: itemWidth, height: itemHeight } = currentSize;

    let clampedPosition = position;
    let placedIn: FurnitureType = container;

    if (container === "floor") {
      // MOBILE FIX: Better bounds checking for mobile
      clampedPosition = {
        x: Math.max(0, Math.min(position.x, roomBounds.width - itemWidth)),
        y: Math.max(0, Math.min(position.y, roomBounds.height - itemHeight)),
      };

      Object.entries(furnitureBounds).forEach(
        ([furnitureType, furnitureRect]) => {
          if (
            clampedPosition.x >= furnitureRect.x &&
            clampedPosition.x <= furnitureRect.x + furnitureRect.width &&
            clampedPosition.y >= furnitureRect.y &&
            clampedPosition.y <= furnitureRect.y + furnitureRect.height
          ) {
            placedIn = furnitureType as FurnitureType;

            const furnitureInteriorBounds = containerBounds[placedIn];
            if (furnitureInteriorBounds) {
              clampedPosition = {
                x: Math.max(0, (furnitureInteriorBounds.width - itemWidth) / 2),
                y: Math.max(
                  0,
                  (furnitureInteriorBounds.height - itemHeight) / 2
                ),
              };
            }
          }
        }
      );
    } else {
      clampedPosition = {
        x: position.x,
        y: position.y,
      };
    }

    const updatedItems = wardrobeItems.map((i) =>
      i.id === itemId ? { ...i, placedIn, position: clampedPosition } : i
    );

    setWardrobeItems(updatedItems);
    await wardrobeStorage.updateItems(updatedItems);

    setItemPositions((prev) => ({
      ...prev,
      [itemId]: clampedPosition,
    }));
  };

  const handleResizeItem = async (
    itemId: string,
    direction: "increase" | "decrease"
  ) => {
    const currentSize =
      itemSizes[itemId] || getDefaultSizeForContainer("floor");
    const scaleFactor = direction === "increase" ? 1.2 : 0.8;

    const maxSize = isMobile ? 120 : 150;
    const minSize = isMobile ? 15 : 20;

    const newSize = {
      width: Math.max(
        minSize,
        Math.min(maxSize, currentSize.width * scaleFactor)
      ),
      height: Math.max(
        minSize,
        Math.min(maxSize, currentSize.height * scaleFactor)
      ),
    };

    setItemSizes((prev) => ({
      ...prev,
      [itemId]: newSize,
    }));

    const updatedItems = wardrobeItems.map((item) =>
      item.id === itemId ? { ...item, customSize: newSize } : item
    );

    setWardrobeItems(updatedItems);
    await wardrobeStorage.updateItems(updatedItems);
  };

  const handleItemSelect = (itemId: string) => {
    if (isDeleteMode) {
      setItemToDelete(itemId);
      setDeleteModalVisible(true);
      setIsDeleteMode(false);
    } else {
      setSelectedItem(itemId === selectedItem ? null : itemId);
    }
  };

  const renderResizeControls = (
    itemId: string,
    position: { x: number; y: number }
  ) => {
    if (selectedItem !== itemId) return null;

    return (
      <View style={resizeStyles.resizeControls} pointerEvents="box-none">
        <TouchableOpacity
          style={[resizeStyles.resizeButton, resizeStyles.decreaseButton]}
          onPress={() => handleResizeItem(itemId, "decrease")}
        >
          <Text style={resizeStyles.resizeButtonText}>-</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[resizeStyles.resizeButton, resizeStyles.increaseButton]}
          onPress={() => handleResizeItem(itemId, "increase")}
        >
          <Text style={resizeStyles.resizeButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const handleFurniturePress = (furnitureType: FurnitureType) => {
    setCurrentView(furnitureType);
    setSelectedItem(null);
  };

  const handleTrashBinPress = () => {
    if (!isDeleteMode) {
      setIsDeleteMode(true);
      setSelectedItem(null);
    } else {
      setIsDeleteMode(false);
    }
  };

  const handleTakeItemOut = async (itemId: string) => {
    const item = wardrobeItems.find((i) => i.id === itemId);
    if (item) {
      const floorItemCount = wardrobeItems.filter(
        (i) => !i.placedIn || i.placedIn === "floor"
      ).length;

      const MOBILE_SPACING = isMobile ? 60 : 70;
      const SPAWN_Y_OFFSET = isMobile ? 80 : 100;

      const baseFloorY =
        floorOffset.y > 0
          ? floorOffset.y + SPAWN_Y_OFFSET
          : isMobile
          ? 150
          : 200;

      const newPosition = {
        x: 20 + (floorItemCount % (isMobile ? 4 : 5)) * MOBILE_SPACING,
        y: baseFloorY + Math.floor(floorItemCount / (isMobile ? 4 : 5)) * 75,
      };

      const updatedItems = wardrobeItems.map((i) =>
        i.id === itemId
          ? { ...i, placedIn: "floor" as FurnitureType, position: newPosition }
          : i
      );

      setWardrobeItems(updatedItems);
      await wardrobeStorage.updateItems(updatedItems);
      setItemPositions((prev) => ({
        ...prev,
        [itemId]: newPosition,
      }));
    }
  };

  const handleItemLongPress = (itemId: string) => {
    handleTakeItemOut(itemId);
  };

  const getItemsForFurniture = (furnitureType: FurnitureType) => {
    return wardrobeItems.filter((item) => item.placedIn === furnitureType);
  };

  const getFloorItems = () => {
    return wardrobeItems.filter(
      (item) =>
        (!item.placedIn || item.placedIn === "floor") && itemPositions[item.id]
    );
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      await wardrobeStorage.deleteItem(itemToDelete);
      await loadWardrobeItems();
    }
    setDeleteModalVisible(false);
    setItemToDelete(null);
  };

  const cancelDelete = () => {
    setDeleteModalVisible(false);
    setItemToDelete(null);
  };

  const renderWardrobeView = () => (
    <View style={styles.furnitureView}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentView(null)}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.viewTitle}>Wardrobe</Text>
        <View style={styles.placeholder} />
      </View>

      <View
        style={styles.wardrobeInterior}
        onLayout={(e) => handleContainerLayout("wardrobe", e)}
      >
        <Image
          source={require("../../assets/furniture/wardrobe-open.png")}
          style={styles.furnitureBackground}
        />

        {getItemsForFurniture("wardrobe").map((item) => {
          const currentSize =
            itemSizes[item.id] || getDefaultSizeForContainer("wardrobe");
          return (
            <Draggable
              key={item.id}
              initialPosition={itemPositions[item.id] || { x: 50, y: 50 }}
              onDrag={(position) =>
                handleItemDrag(item.id, position, "wardrobe")
              }
            >
              <TouchableOpacity
                onPress={() => handleItemSelect(item.id)}
                onLongPress={() => handleItemLongPress(item.id)}
                delayLongPress={500}
              >
                <Image
                  source={{ uri: item.imageUri }}
                  style={[
                    styles.wardrobeItemImage,
                    { width: currentSize.width, height: currentSize.height },
                  ]}
                />
              </TouchableOpacity>
              {renderResizeControls(
                item.id,
                itemPositions[item.id] || { x: 50, y: 50 }
              )}
            </Draggable>
          );
        })}
      </View>
    </View>
  );

  const renderHangerView = () => (
    <View style={styles.furnitureView}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentView(null)}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.viewTitle}>Hanger Rack</Text>
        <View style={styles.placeholder} />
      </View>

      <View
        style={styles.hangerInterior}
        onLayout={(e) => handleContainerLayout("hanger", e)}
      >
        <Image
          source={require("../../assets/furniture/hanger-rack.png")}
          style={styles.hangerRackImage}
        />

        {getItemsForFurniture("hanger").map((item) => {
          const currentSize =
            itemSizes[item.id] || getDefaultSizeForContainer("hanger");
          return (
            <Draggable
              key={item.id}
              initialPosition={itemPositions[item.id] || { x: 50, y: 80 }}
              onDrag={(position) => handleItemDrag(item.id, position, "hanger")}
            >
              <TouchableOpacity
                onPress={() => handleItemSelect(item.id)}
                onLongPress={() => handleItemLongPress(item.id)}
                delayLongPress={500}
              >
                <Image
                  source={{ uri: item.imageUri }}
                  style={[
                    styles.hangerItemImage,
                    { width: currentSize.width, height: currentSize.height },
                  ]}
                />
              </TouchableOpacity>
              {renderResizeControls(
                item.id,
                itemPositions[item.id] || { x: 50, y: 80 }
              )}
            </Draggable>
          );
        })}
      </View>
    </View>
  );

  const renderShoeShelfView = () => (
    <View style={styles.furnitureView}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentView(null)}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.viewTitle}>Shoe Rack</Text>
        <View style={styles.placeholder} />
      </View>

      <View
        style={styles.shoeRackInterior}
        onLayout={(e) => handleContainerLayout("shoeShelf", e)}
      >
        <Image
          source={require("../../assets/furniture/shoe-rack-open.png")}
          style={styles.furnitureBackground}
        />

        {getItemsForFurniture("shoeShelf").map((item) => {
          const currentSize =
            itemSizes[item.id] || getDefaultSizeForContainer("shoeShelf");
          return (
            <Draggable
              key={item.id}
              initialPosition={itemPositions[item.id] || { x: 50, y: 50 }}
              onDrag={(position) =>
                handleItemDrag(item.id, position, "shoeShelf")
              }
            >
              <TouchableOpacity
                onPress={() => handleItemSelect(item.id)}
                onLongPress={() => handleItemLongPress(item.id)}
                delayLongPress={500}
              >
                <Image
                  source={{ uri: item.imageUri }}
                  style={[
                    styles.shoeItemImage,
                    { width: currentSize.width, height: currentSize.height },
                  ]}
                />
              </TouchableOpacity>
              {renderResizeControls(
                item.id,
                itemPositions[item.id] || { x: 50, y: 50 }
              )}
            </Draggable>
          );
        })}
      </View>
    </View>
  );

  const renderJewelryBoxView = () => (
    <View style={styles.furnitureView}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentView(null)}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.viewTitle}>Jewelry Box</Text>
        <View style={styles.placeholder} />
      </View>

      <View
        style={styles.jewelryBoxInterior}
        onLayout={(e) => handleContainerLayout("jewelryBox", e)}
      >
        <Image
          source={require("../../assets/furniture/jewelry-box-open.png")}
          style={styles.furnitureBackground}
        />

        {getItemsForFurniture("jewelryBox").map((item) => {
          const currentSize =
            itemSizes[item.id] || getDefaultSizeForContainer("jewelryBox");
          return (
            <Draggable
              key={item.id}
              initialPosition={itemPositions[item.id] || { x: 50, y: 50 }}
              onDrag={(position) =>
                handleItemDrag(item.id, position, "jewelryBox")
              }
            >
              <TouchableOpacity
                onPress={() => handleItemSelect(item.id)}
                onLongPress={() => handleItemLongPress(item.id)}
                delayLongPress={500}
              >
                <Image
                  source={{ uri: item.imageUri }}
                  style={[
                    styles.jewelryItemImage,
                    { width: currentSize.width, height: currentSize.height },
                  ]}
                />
              </TouchableOpacity>
              {renderResizeControls(
                item.id,
                itemPositions[item.id] || { x: 50, y: 50 }
              )}
            </Draggable>
          );
        })}
      </View>
    </View>
  );

  const mobilePreviewContent = (
    <View style={windowStyles.previewContent}>
      <Image
        source={require("../../assets/icons/wardrobe.png")}
        style={windowStyles.previewIcon}
      />
      <Text style={windowStyles.previewTitle}>My Room</Text>
      <Text style={windowStyles.previewText}>
        Organize your clothes in furniture{"\n"}Click furniture to see inside!
      </Text>
      <View style={windowStyles.previewStats}>
        <Text style={windowStyles.statsText}>
          Items: {wardrobeItems.length}
        </Text>
      </View>
    </View>
  );

  const fullContent = (
    <View style={windowStyles.fullContent}>
      <Text style={windowStyles.fullSubtitle}>
        Drag items onto furniture to store them.
        {!currentView && !isDeleteMode && " Click furniture to see inside."}
        {isDeleteMode && " Click an item to delete it."}
        {currentView &&
          " Click items to select and resize them. Long press to take out."}
      </Text>

      {currentView ? (
        <>
          {currentView === "wardrobe" && renderWardrobeView()}
          {currentView === "hanger" && renderHangerView()}
          {currentView === "shoeShelf" && renderShoeShelfView()}
          {currentView === "jewelryBox" && renderJewelryBoxView()}
        </>
      ) : (
        <View
          style={windowStyles.roomLayout}
          ref={roomLayoutRef}
          onLayout={handleRoomLayout}
        >
          <TouchableOpacity
            style={windowStyles.trashBin}
            onPress={handleTrashBinPress}
          >
            <Image
              source={require("../../assets/icons/trash-icon.png")}
              style={windowStyles.trashBinIcon}
            />
          </TouchableOpacity>

          <View
            style={[
              windowStyles.furnitureRow,
              isMobile && windowStyles.furnitureRowMobile,
            ]}
            ref={furnitureRowRef}
            onLayout={handleFurnitureRowLayout}
          >
            <View onLayout={(e) => handleFurnitureLayout("wardrobe", e)}>
              <TouchableOpacity
                onPress={() => handleFurniturePress("wardrobe")}
              >
                <Image
                  source={require("../../assets/furniture/wardrobe-closed.png")}
                  style={[
                    windowStyles.furnitureImage,
                    windowStyles.wardrobeSize,
                    isMobile && windowStyles.wardrobeSizeMobile,
                  ]}
                />
              </TouchableOpacity>
            </View>

            <View onLayout={(e) => handleFurnitureLayout("jewelryBox", e)}>
              <TouchableOpacity
                onPress={() => handleFurniturePress("jewelryBox")}
              >
                <Image
                  source={require("../../assets/furniture/jewelry-box-closed.png")}
                  style={[
                    windowStyles.furnitureImage,
                    windowStyles.jewelryBoxSize,
                    isMobile && windowStyles.jewelryBoxSizeMobile,
                  ]}
                />
              </TouchableOpacity>
            </View>

            <View onLayout={(e) => handleFurnitureLayout("hanger", e)}>
              <TouchableOpacity onPress={() => handleFurniturePress("hanger")}>
                <Image
                  source={require("../../assets/furniture/hanger-closed.png")}
                  style={[
                    windowStyles.furnitureImage,
                    windowStyles.hangerSize,
                    isMobile && windowStyles.hangerSizeMobile,
                  ]}
                />
              </TouchableOpacity>
            </View>

            <View onLayout={(e) => handleFurnitureLayout("shoeShelf", e)}>
              <TouchableOpacity
                onPress={() => handleFurniturePress("shoeShelf")}
              >
                <Image
                  source={require("../../assets/furniture/shoe-rack-closed.png")}
                  style={[
                    windowStyles.furnitureImage,
                    windowStyles.shoeShelfSize,
                    isMobile && windowStyles.shoeShelfSizeMobile,
                  ]}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View
            style={[
              windowStyles.floorArea,
              isMobile && windowStyles.floorAreaMobile,
            ]}
            ref={floorAreaRef}
            onLayout={handleFloorLayout}
          >
            <Image
              source={require("../../assets/floor-texture.png")}
              style={windowStyles.floorTexture}
              resizeMode="repeat"
            />

            {wardrobeItems.length === 0 && (
              <View style={windowStyles.emptyFloor}>
                <Text style={windowStyles.emptyText}>No items yet</Text>
                <Text style={windowStyles.emptySubtext}>
                  To add items go to the Add Items window! Have fun!
                </Text>
              </View>
            )}
          </View>

          {getFloorItems().map((item) => {
            const currentSize =
              itemSizes[item.id] || getDefaultSizeForContainer("floor");
            return (
              <Draggable
                key={item.id}
                initialPosition={itemPositions[item.id] || { x: 50, y: 150 }}
                onDrag={(position) =>
                  handleItemDrag(item.id, position, "floor")
                }
              >
                <TouchableOpacity
                  style={[
                    windowStyles.draggableItem,
                    { width: currentSize.width, height: currentSize.height },
                  ]}
                  onPress={() => handleItemSelect(item.id)}
                >
                  <Image
                    source={{ uri: item.imageUri }}
                    style={[
                      windowStyles.itemImage,
                      { width: currentSize.width, height: currentSize.height },
                    ]}
                  />
                </TouchableOpacity>
                {renderResizeControls(
                  item.id,
                  itemPositions[item.id] || { x: 50, y: 150 }
                )}
              </Draggable>
            );
          })}
        </View>
      )}

      <Modal
        visible={deleteModalVisible}
        transparent={true}
        animationType="fade"
      >
        <View style={windowStyles.modalOverlay}>
          <View
            style={[
              windowStyles.modalContent,
              isMobile && windowStyles.modalContentMobile,
            ]}
          >
            <Text style={windowStyles.modalTitle}>Delete Item</Text>
            <Text style={windowStyles.modalText}>
              Are you sure you want to delete this item?
            </Text>
            <View style={windowStyles.modalButtons}>
              <TouchableOpacity
                style={[windowStyles.modalButton, windowStyles.cancelButton]}
                onPress={cancelDelete}
              >
                <Text style={windowStyles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[windowStyles.modalButton, windowStyles.deleteButton]}
                onPress={confirmDelete}
              >
                <Text style={windowStyles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );

  return isMobile && !isFullscreen ? mobilePreviewContent : fullContent;
};

const resizeStyles = StyleSheet.create({
  resizeControls: {
    position: "absolute",
    top: -30,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  resizeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
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
    fontSize: 14,
    lineHeight: 18,
  },
});

const windowStyles = StyleSheet.create({
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
    backgroundColor: "transparent",
  },
  fullSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
    textAlign: "center",
  },
  roomLayout: {
    flex: 1,
    position: "relative",
  },
  furnitureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 10,
    height: 150,
    paddingHorizontal: 10,
    marginTop: 10,
  },
  furnitureRowMobile: {
    height: 120,
    marginBottom: 5,
    paddingHorizontal: 5,
  },
  furnitureImage: {
    resizeMode: "contain",
  },
  wardrobeSize: {
    width: 180,
    height: 160,
  },
  wardrobeSizeMobile: {
    width: 140,
    height: 120,
  },
  jewelryBoxSize: {
    width: 100,
    height: 80,
  },
  jewelryBoxSizeMobile: {
    width: 80,
    height: 60,
  },
  hangerSize: {
    width: 130,
    height: 100,
  },
  hangerSizeMobile: {
    width: 100,
    height: 80,
  },
  shoeShelfSize: {
    width: 90,
    height: 70,
  },
  shoeShelfSizeMobile: {
    width: 70,
    height: 50,
  },
  floorArea: {
    flex: 1,
    backgroundColor: "transparent",
    marginTop: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    minHeight: 300,
  },
  floorAreaMobile: {
    minHeight: 250,
    marginTop: 5,
  },
  floorTexture: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
    opacity: 0.3,
  },
  draggableItem: {
    position: "absolute",
    alignItems: "center",
    padding: 0,
    backgroundColor: "transparent",
    borderRadius: 0,
    borderWidth: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
    zIndex: 10,
  },
  itemImage: {
    borderRadius: 0,
    backgroundColor: "transparent",
  },
  emptyFloor: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#666",
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  trashBin: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "transparent",
    borderRadius: 0,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  },
  trashBinIcon: {
    width: 40,
    height: 40,
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
    maxWidth: 300,
    borderWidth: 2,
    borderColor: "#c0c0c0",
    borderTopColor: "#ffffff",
    borderLeftColor: "#ffffff",
    borderRightColor: "#808080",
    borderBottomColor: "#808080",
  },
  modalContentMobile: {
    width: "90%",
    marginHorizontal: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  modalText: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
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
    backgroundColor: "#ff4444",
    borderWidth: 2,
    borderTopColor: "#ffffff",
    borderLeftColor: "#ffffff",
    borderRightColor: "#cc0000",
    borderBottomColor: "#cc0000",
  },
  cancelButtonText: {
    color: "#000",
    fontWeight: "bold",
  },
  deleteButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

const styles = StyleSheet.create({
  furnitureView: {
    flex: 1,
    padding: 16,
    backgroundColor: "transparent",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#ccc",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: "#c0c0c0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 2,
    borderTopColor: "#ffffff",
    borderLeftColor: "#ffffff",
    borderRightColor: "#808080",
    borderBottomColor: "#808080",
  },
  backButtonText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 12,
  },
  viewTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
  },
  placeholder: {
    width: 60,
  },
  furnitureBackground: {
    width: "100%",
    height: "100%",
    position: "absolute",
    resizeMode: "contain",
  },
  wardrobeInterior: {
    flex: 1,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 200,
  },
  shoeRackInterior: {
    flex: 1,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 200,
  },
  jewelryBoxInterior: {
    flex: 1,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 200,
  },
  hangerInterior: {
    flex: 1,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 200,
  },
  hangerRackImage: {
    width: "100%",
    height: "100%",
    position: "relative",
    resizeMode: "contain",
  },
  wardrobeItemImage: {
    backgroundColor: "transparent",
  },
  shoeItemImage: {
    backgroundColor: "transparent",
  },
  jewelryItemImage: {
    backgroundColor: "transparent",
  },
  hangerItemImage: {
    backgroundColor: "transparent",
  },
});

export default WardrobeWindow;
