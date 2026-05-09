import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  Modal,
} from "react-native";
import { wardrobeStorage, WardrobeItem } from "../../utils/storage";
import Draggable from "./../Draggable";
import MobilePreview, { previewStatText } from "./MobilePreview";
import { resizeStyles, windowStyles, styles } from "./WardrobeWindow.styles";

const { width: screenWidth } = Dimensions.get("window");

interface WardrobeWindowProps {
  isFullscreen?: boolean;
  isMobile?: boolean;
}

type FurnitureType = "wardrobe" | "hanger" | "shoeShelf" | "jewelryBox" | "floor";

type ItemSizes = {
  [key: string]: { width: number; height: number };
};

const ITEM_SCALE_INCREASE = 1.2;
const ITEM_SCALE_DECREASE = 0.8;
const ITEM_MAX_SIZE_MOBILE = 120;
const ITEM_MAX_SIZE_DESKTOP = 150;
const ITEM_MIN_SIZE_MOBILE = 15;
const ITEM_MIN_SIZE_DESKTOP = 20;

const FURNITURE_TITLES: Partial<Record<FurnitureType, string>> = {
  wardrobe: "Wardrobe",
  hanger: "Hanger Rack",
  shoeShelf: "Shoe Rack",
  jewelryBox: "Jewelry Box",
};

const FURNITURE_BACKGROUNDS = {
  wardrobe: require("../../assets/furniture/wardrobe-open.png"),
  hanger: require("../../assets/furniture/hanger-rack.png"),
  shoeShelf: require("../../assets/furniture/shoe-rack-open.png"),
  jewelryBox: require("../../assets/furniture/jewelry-box-open.png"),
};

const FURNITURE_DEFAULT_ITEM_POSITIONS: Partial<
  Record<FurnitureType, { x: number; y: number }>
> = {
  wardrobe: { x: 50, y: 50 },
  hanger: { x: 50, y: 80 },
  shoeShelf: { x: 50, y: 50 },
  jewelryBox: { x: 50, y: 50 },
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
    setRoomBounds({ width, height });
  };

  const handleFloorLayout = (e: any) => {
    const { x, y } = e.nativeEvent.layout;
    setFloorOffset({ x, y });
    setIsLayoutMeasured(true);
  };

  const handleFurnitureRowLayout = (e: any) => {
    if (roomLayoutRef.current) {
      roomLayoutRef.current.measure(() => {
        const { x, y } = e.nativeEvent.layout;
        setFurnitureRowOffset({ x, y });
      });
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

      setWardrobeItems(items);

      const initialPositions: { [key: string]: { x: number; y: number } } = {};
      const initialSizes: ItemSizes = {};

      const FLOOR_ITEM_SPACING = isMobile ? 60 : 70;
      const FLOOR_SPAWN_Y_OFFSET = isMobile ? 50 : 200;
      const STATUSBAR_HEIGHT = isMobile ? 40 : 0;

      items.forEach((item) => {
        if (item.position) {
          initialPositions[item.id] = item.position;
        } else if (!item.placedIn || item.placedIn === "floor") {
          const floorItemCount = Object.keys(initialPositions).filter(
            (id) =>
              !items.find((i) => i.id === id)?.placedIn ||
              items.find((i) => i.id === id)?.placedIn === "floor"
          ).length;

          const cols = isMobile ? 4 : 6;

          let baseFloorY;
          if (isFullscreen && isMobile) {
            baseFloorY = STATUSBAR_HEIGHT + 100;
          } else {
            baseFloorY =
              floorOffset.y > 0
                ? floorOffset.y + FLOOR_SPAWN_Y_OFFSET
                : isMobile
                ? 250
                : 350;
          }

          initialPositions[item.id] = {
            x: 20 + (floorItemCount % cols) * FLOOR_ITEM_SPACING,
            y: baseFloorY + Math.floor(floorItemCount / cols) * 75,
          };
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
      clampedPosition = { x: position.x, y: position.y };
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
    const scaleFactor =
      direction === "increase" ? ITEM_SCALE_INCREASE : ITEM_SCALE_DECREASE;

    const maxSize = isMobile ? ITEM_MAX_SIZE_MOBILE : ITEM_MAX_SIZE_DESKTOP;
    const minSize = isMobile ? ITEM_MIN_SIZE_MOBILE : ITEM_MIN_SIZE_DESKTOP;

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

    setItemSizes((prev) => ({ ...prev, [itemId]: newSize }));

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

  const renderResizeControls = (itemId: string) => {
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
    setIsDeleteMode((prev) => !prev);
    setSelectedItem(null);
  };

  const handleTakeItemOut = async (itemId: string) => {
    const item = wardrobeItems.find((i) => i.id === itemId);
    if (!item) return;

    const floorItemCount = wardrobeItems.filter(
      (i) => !i.placedIn || i.placedIn === "floor"
    ).length;

    const FLOOR_ITEM_SPACING = isMobile ? 60 : 70;
    const SPAWN_Y_OFFSET = isMobile ? 80 : 100;
    const cols = isMobile ? 4 : 5;

    const baseFloorY =
      floorOffset.y > 0
        ? floorOffset.y + SPAWN_Y_OFFSET
        : isMobile
        ? 150
        : 200;

    const newPosition = {
      x: 20 + (floorItemCount % cols) * FLOOR_ITEM_SPACING,
      y: baseFloorY + Math.floor(floorItemCount / cols) * 75,
    };

    const updatedItems = wardrobeItems.map((i) =>
      i.id === itemId
        ? { ...i, placedIn: "floor" as FurnitureType, position: newPosition }
        : i
    );

    setWardrobeItems(updatedItems);
    await wardrobeStorage.updateItems(updatedItems);
    setItemPositions((prev) => ({ ...prev, [itemId]: newPosition }));
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

  const renderFurnitureView = (furnitureType: FurnitureType) => {
    const defaultPosition =
      FURNITURE_DEFAULT_ITEM_POSITIONS[furnitureType] ?? { x: 50, y: 50 };
    const backgroundSource =
      FURNITURE_BACKGROUNDS[furnitureType as keyof typeof FURNITURE_BACKGROUNDS];
    const backgroundStyle =
      furnitureType === "hanger"
        ? styles.hangerRackImage
        : styles.furnitureBackground;

    return (
      <View style={styles.furnitureView}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setCurrentView(null)}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.viewTitle}>
            {FURNITURE_TITLES[furnitureType]}
          </Text>
          <View style={styles.placeholder} />
        </View>

        <View
          style={styles.furnitureInterior}
          onLayout={(e) => handleContainerLayout(furnitureType, e)}
        >
          <Image source={backgroundSource} style={backgroundStyle} />

          {getItemsForFurniture(furnitureType).map((item) => {
            const currentSize =
              itemSizes[item.id] || getDefaultSizeForContainer(furnitureType);
            const position = itemPositions[item.id] || defaultPosition;
            return (
              <Draggable
                key={item.id}
                initialPosition={position}
                onDrag={(pos) => handleItemDrag(item.id, pos, furnitureType)}
              >
                <TouchableOpacity
                  onPress={() => handleItemSelect(item.id)}
                  onLongPress={() => handleTakeItemOut(item.id)}
                  delayLongPress={500}
                >
                  <Image
                    source={{ uri: item.imageUri }}
                    style={[
                      styles.furnitureItemImage,
                      { width: currentSize.width, height: currentSize.height },
                    ]}
                  />
                </TouchableOpacity>
                {renderResizeControls(item.id)}
              </Draggable>
            );
          })}
        </View>
      </View>
    );
  };

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
        renderFurnitureView(currentView)
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
                {renderResizeControls(item.id)}
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

  if (isMobile && !isFullscreen) {
    return (
      <MobilePreview
        icon={require("../../assets/icons/wardrobe.png")}
        title="My Room"
        text={"Organize your clothes in furniture\nClick furniture to see inside!"}
      >
        <Text style={previewStatText.base}>Items: {wardrobeItems.length}</Text>
      </MobilePreview>
    );
  }

  return fullContent;
};




export default WardrobeWindow;
