import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  Platform,
} from "react-native";
import AddItemWindow from "./components/windows/AddItemWindow";
import WardrobeWindow from "./components/windows/WardrobeWindow";
import CreateOutfitWindow from "./components/windows/CreateOutfitWindow";
import GalleryWindow from "./components/windows/GalleryWindow";
import DressMeWindow from "./components/windows/DressMeWindow";
import CluelessWindow from "./components/windows/CluelessWindow";

import DraggableWindow from "./components/DraggableWindow";
import DesktopIcon from "./components/DesktopIcon";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const isMobile = Platform.OS === "ios" || Platform.OS === "android";
const isTablet = screenWidth >= 768 && screenWidth < 1024;

const WindowsDesktop = () => {
  const [currentTime, setCurrentTime] = useState("");
  const [openWindows, setOpenWindows] = useState<string[]>(["clueless"]);
  const [minimizedWindows, setMinimizedWindows] = useState<string[]>([]);
  const [iconPositions, setIconPositions] = useState<{
    [key: string]: { x: number; y: number };
  }>({});
  const [windowPositions, setWindowPositions] = useState<{
    [key: string]: { x: number; y: number };
  }>({});
  const [focusedWindow, setFocusedWindow] = useState<string | null>("clueless"); // Track focused window
  const [showStartMenu, setShowStartMenu] = useState(false);
  const [showProgramsMenu, setShowProgramsMenu] = useState(false);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Toggle Programs submenu
  const toggleProgramsMenu = () => {
    setShowProgramsMenu(!showProgramsMenu);
  };

  // Close both menus when clicking outside or opening a window
  const closeAllMenus = () => {
    setShowStartMenu(false);
    setShowProgramsMenu(false);
  };

  const getIconPositions = () => {
    if (isMobile) {
      const iconWidth = 90;
      const iconHeight = 110;
      const horizontalSpacing = (screenWidth - 3 * iconWidth) / 4;
      const verticalSpacing = 20;

      return [
        { x: horizontalSpacing, y: 30 }, // Row 1 - Col 1
        { x: horizontalSpacing * 2 + iconWidth, y: 30 }, // Row 1 - Col 2
        { x: horizontalSpacing * 3 + iconWidth * 2, y: 30 }, // Row 1 - Col 3
        { x: horizontalSpacing, y: 30 + iconHeight + verticalSpacing }, // Row 2 - Col 1 (FIXED: start from left)
        {
          x: horizontalSpacing * 2 + iconWidth,
          y: 30 + iconHeight + verticalSpacing,
        }, // Row 2 - Col 2
      ];
    } else if (isTablet) {
      return [
        { x: 30, y: 30 },
        { x: 30, y: 150 },
        { x: 30, y: 270 },
        { x: 30, y: 410 },
        { x: 30, y: 550 },
      ];
    } else {
      // Desktop: Larger spacing for bigger screens
      return [
        { x: 40, y: 30 },
        { x: 40, y: 150 },
        { x: 40, y: 270 },
        { x: 40, y: 410 },
        { x: 40, y: 550 },
      ];
    }
  };

  const iconPositionsArray = getIconPositions();

  // Updated desktop icons with "Dress Me" functionality
  const desktopIcons = [
    {
      id: "wardrobe",
      iconType: "wardrobe" as const,
      label: "My Wardrobe",
    },
    {
      id: "outfits",
      iconType: "outfit" as const,
      label: "Create Outfit",
    },
    {
      id: "addItem",
      iconType: "add" as const,
      label: "Add Item",
    },
    {
      id: "gallery",
      iconType: "gallery" as const,
      label: "Style Gallery",
    },
    {
      id: "dressMe",
      iconType: "dressMe" as const,
      label: "Dress Me",
    },
  ].map((icon, index) => ({
    ...icon,
    initialX: iconPositionsArray[index]?.x || 40,
    initialY: iconPositionsArray[index]?.y || 40 + index * 140,
  }));

  // Start menu categories and items
  const startMenuCategories = [
    {
      id: "programs",
      label: "Programs",
      icon: "programs",
      hasSubmenu: true,
      items: [
        { id: "wardrobe", label: "My Wardrobe", icon: "wardrobe" },
        { id: "outfits", label: "Create Outfit", icon: "outfit" },
        { id: "addItem", label: "Add Item", icon: "add" },
        { id: "gallery", label: "Style Gallery", icon: "gallery" },
        { id: "dressMe", label: "Dress Me", icon: "dressMe" },
      ],
    },
    {
      id: "documents",
      label: "Documents",
      icon: "documents",
      hasSubmenu: false,
    },
    {
      id: "settings",
      label: "Settings",
      icon: "settings",
      hasSubmenu: false,
    },
    {
      id: "find",
      label: "Find",
      icon: "find",
      hasSubmenu: false,
    },
    {
      id: "help",
      label: "Help",
      icon: "help",
      hasSubmenu: false,
    },
  ];

  const startMenuFooterItems = [
    {
      id: "wallpaper",
      label: "Change Wallpaper",
      icon: "wallpaper",
    },
    {
      id: "shutdown",
      label: "Shut Down...",
      icon: "shutdown",
    },
  ];

  const openWindow = (windowId: string) => {
    if (!openWindows.includes(windowId)) {
      setOpenWindows([...openWindows, windowId]);
      setMinimizedWindows(minimizedWindows.filter((id) => id !== windowId));
      setFocusedWindow(windowId); // Focus the new window
      closeAllMenus();

      if (!windowPositions[windowId]) {
        const windowCount = openWindows.length;

        if (isMobile) {
          // Mobile: Start from bottom of icons area, cascade slightly
          const iconBottom =
            Math.max(
              ...desktopIcons.map((icon) => getIconPosition(icon.id).y)
            ) + 120;
          const baseX = 10;
          const baseY = iconBottom + 10;
          const offset = 15;

          setWindowPositions((prev) => ({
            ...prev,
            [windowId]: {
              x: baseX + ((windowCount * offset) % (screenWidth * 0.5)),
              y: baseY + ((windowCount * offset) % 100),
            },
          }));
        } else {
          // Desktop: Classic cascade effect
          const baseX = 100;
          const baseY = 50;
          const offset = 30;

          setWindowPositions((prev) => ({
            ...prev,
            [windowId]: {
              x: baseX + windowCount * offset,
              y: baseY + windowCount * offset,
            },
          }));
        }
      }
    } else if (minimizedWindows.includes(windowId)) {
      setMinimizedWindows(minimizedWindows.filter((id) => id !== windowId));
      setFocusedWindow(windowId); // Focus when restoring
      closeAllMenus();
    } else {
      setFocusedWindow(windowId); // Focus when clicking already open window
    }
  };

  const focusWindow = (windowId: string) => {
    setFocusedWindow(windowId);
  };

  const closeWindow = (windowId: string) => {
    setOpenWindows(openWindows.filter((id) => id !== windowId));
    setMinimizedWindows(minimizedWindows.filter((id) => id !== windowId));
    if (focusedWindow === windowId) {
      // Focus the next window in stack, or null if none left
      const remainingWindows = openWindows.filter((id) => id !== windowId);
      setFocusedWindow(
        remainingWindows.length > 0
          ? remainingWindows[remainingWindows.length - 1]
          : null
      );
    }
  };
  const minimizeWindow = (windowId: string) => {
    setMinimizedWindows([...minimizedWindows, windowId]);
  };

  const handleIconDrag = (
    iconId: string,
    position: { x: number; y: number }
  ) => {
    setIconPositions((prev) => ({
      ...prev,
      [iconId]: position,
    }));
  };

  const handleWindowDrag = (
    windowId: string,
    position: { x: number; y: number }
  ) => {
    setWindowPositions((prev) => ({
      ...prev,
      [windowId]: position,
    }));
  };

  const getIconPosition = (iconId: string) => {
    return (
      iconPositions[iconId] || {
        x: desktopIcons.find((icon) => icon.id === iconId)?.initialX || 40,
        y: desktopIcons.find((icon) => icon.id === iconId)?.initialY || 40,
      }
    );
  };

  const getWindowPosition = (windowId: string) => {
    return (
      windowPositions[windowId] || {
        x: isMobile ? 20 : 100,
        y: isMobile ? 50 : 50,
      }
    );
  };

  // Updated taskbar icon sources
  const taskbarIconSources = {
    wardrobe: require("./assets/icons/wardrobe.png"),
    outfit: require("./assets/icons/outfit.png"),
    add: require("./assets/icons/add.png"),
    gallery: require("./assets/icons/gallery.png"),
    dressMe: require("./assets/icons/dressMe.png"),
    clueless: require("./assets/icons/clueless.png"),
    programs: require("./assets/icons/programs.png"),
    documents: require("./assets/icons/documents.png"),
    settings: require("./assets/icons/settings.png"),
    find: require("./assets/icons/find.png"),
    help: require("./assets/icons/help.png"),
    wallpaper: require("./assets/icons/wallpaper.png"),
    shutdown: require("./assets/icons/application.png"),
  };

  const handleShutDown = () => {
    // Add your shutdown logic here
    console.log("Shutting down...");
    closeAllMenus();
  };

  const handleChangeWallpaper = () => {
    // Add wallpaper change logic here
    console.log("Changing wallpaper...");
    closeAllMenus();
  };

  const renderWindowContent = (windowId: string) => {
    switch (windowId) {
      case "wardrobe":
        return <WardrobeWindow />;
      case "outfits":
        return <CreateOutfitWindow />;
      case "addItem":
        return <AddItemWindow />;
      case "gallery":
        return <GalleryWindow />;
      case "dressMe":
        return <DressMeWindow />;
      case "clueless":
        return <CluelessWindow />;
      default:
        return (
          <Text style={styles.windowText}>
            Welcome to{" "}
            {desktopIcons.find((icon) => icon.id === windowId)?.label}!
          </Text>
        );
    }
  };

  return (
    <View style={styles.container}>
      {/* Light Blue Desktop Background */}
      <View style={styles.desktop}>
        {/* Your Clueless Logo Image (replaces the welcome text) */}
        {!isMobile && (
          <View style={styles.logoContainer}>
            <Image
              source={require("./assets/clueless-logo.png")} // Your custom logo
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
        )}
        {/* Draggable Desktop Icons */}
        {desktopIcons.map((icon) => (
          <DesktopIcon
            key={icon.id}
            iconType={icon.iconType}
            label={icon.label}
            initialPosition={getIconPosition(icon.id)}
            onDoubleClick={() => openWindow(icon.id)}
            onDrag={(position) => handleIconDrag(icon.id, position)}
          />
        ))}
        {/* Draggable Windows */}
        {openWindows
          .filter((windowId) => !minimizedWindows.includes(windowId))
          .map((windowId) => {
            const icon = desktopIcons.find((icon) => icon.id === windowId);
            return (
              <DraggableWindow
                key={windowId}
                title={icon?.label || "Clueless"}
                iconType={icon?.iconType || "clueless"}
                initialPosition={getWindowPosition(windowId)}
                onClose={() => closeWindow(windowId)}
                onMinimize={() => minimizeWindow(windowId)}
                onFullscreen={() => {}}
                onFocus={() => focusWindow(windowId)}
                onDrag={(position) => handleWindowDrag(windowId, position)}
                width={isMobile ? screenWidth * 0.9 : 500}
                height={isMobile ? 300 : 400} //
                isFocused={focusedWindow === windowId}
              >
                {renderWindowContent(windowId)}
              </DraggableWindow>
            );
          })}
        {/* Start Menu */}
        {showStartMenu && (
          <View style={[styles.startMenu, isMobile && styles.mobileStartMenu]}>
            <View style={styles.startMenuHeader}>
              <Image
                source={require("./assets/icons/clueless.png")}
                style={styles.startMenuLogo}
              />
              <Text style={styles.startMenuTitle}>Clueless</Text>
            </View>

            <View style={styles.startMenuContent}>
              {/* Main Menu Items */}
              <View style={styles.mainMenu}>
                {startMenuCategories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={styles.menuItem}
                    onPress={() => {
                      if (category.hasSubmenu) {
                        toggleProgramsMenu();
                      } else {
                        // Handle other menu items
                        closeAllMenus();
                      }
                    }}
                  >
                    <Image
                      source={
                        taskbarIconSources[
                          category.icon as keyof typeof taskbarIconSources
                        ]
                      }
                      style={styles.menuIcon}
                    />
                    <Text style={styles.menuText}>{category.label}</Text>
                    {category.hasSubmenu && (
                      <Text style={styles.submenuArrow}>&gt;</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Separator Line */}
            <View style={styles.menuSeparator} />

            {/* Footer Items */}
            <View style={styles.startMenuFooter}>
              {startMenuFooterItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.footerItem}
                  onPress={() => {
                    if (item.id === "shutdown") {
                      handleShutDown();
                    } else if (item.id === "wallpaper") {
                      handleChangeWallpaper();
                    }
                  }}
                >
                  <Image
                    source={
                      taskbarIconSources[
                        item.icon as keyof typeof taskbarIconSources
                      ]
                    }
                    style={styles.footerIcon}
                  />
                  <Text style={styles.footerText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
        {/* Programs Submenu - Now positioned next to Start Menu without title */}
        {showProgramsMenu && (
          <View
            style={[
              styles.programsSubmenu,
              isMobile && styles.mobileProgramsSubmenu,
            ]}
          >
            <View style={styles.submenuItems}>
              {startMenuCategories
                .find((cat) => cat.id === "programs")
                ?.items?.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.submenuItem}
                    onPress={() => openWindow(item.id)}
                  >
                    <Image
                      source={
                        taskbarIconSources[
                          item.icon as keyof typeof taskbarIconSources
                        ]
                      }
                      style={styles.submenuIcon}
                    />
                    <Text style={styles.submenuText}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
            </View>
          </View>
        )}
      </View>

      {/* Taskbar */}
      <View style={[styles.taskbar, isMobile && styles.mobileTaskbar]}>
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => {
            setShowStartMenu(!showStartMenu);
            // Close programs menu when start menu is toggled
            if (showProgramsMenu) {
              setShowProgramsMenu(false);
            }
          }}
        >
          {!isMobile && (
            <Image
              source={require("./assets/icons/clueless.png")}
              style={styles.startLogo}
            />
          )}
          <Text style={styles.startText}>Start</Text>
        </TouchableOpacity>

        <View style={styles.taskbarPrograms}>
          {openWindows.map((windowId) => {
            const icon = desktopIcons.find((icon) => icon.id === windowId);
            const isMinimized = minimizedWindows.includes(windowId);
            const taskbarIconSource =
              taskbarIconSources[
                icon?.iconType as keyof typeof taskbarIconSources
              ] || taskbarIconSources.clueless;

            return (
              <TouchableOpacity
                key={windowId}
                style={[
                  styles.taskbarProgram,
                  isMobile && styles.mobileTaskbarProgram,
                  isMinimized && styles.minimizedProgram,
                ]}
                onPress={() => openWindow(windowId)}
              >
                <Image
                  source={taskbarIconSource}
                  style={[
                    styles.taskbarIcon,
                    isMobile && styles.mobileTaskbarIcon,
                  ]}
                />
                {!isMobile && (
                  <Text style={styles.taskbarProgramText}>
                    {icon?.label ?? "Clueless"}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.systemTray}>
          {!isMobile && (
            <View style={styles.trayIcons}>
              <Image
                source={require("./assets/icons/sound.png")}
                style={styles.trayIconImage}
              />
              <Image
                source={require("./assets/icons/network.png")}
                style={styles.trayIconImage}
              />
            </View>
          )}
          <View style={[styles.clock, isMobile && styles.mobileClock]}>
            <Text style={styles.clockText}>{currentTime}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#87ceeb", // Light blue background
  },
  desktop: {
    flex: 1,
  },
  // Logo container for your Clueless image
  logoContainer: {
    position: "absolute",
    bottom: 120,
    right: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  logoImage: {
    width: 250,
    height: 100,
  },
  // Start Menu Styles
  startMenu: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: 320,
    backgroundColor: "#c0c0c0",
    borderWidth: 2,
    borderColor: "#dfdfdf",
    borderTopColor: "#ffffff",
    borderLeftColor: "#ffffff",
    borderRightColor: "#808080",
    borderBottomColor: "#808080",
    zIndex: 1000,
  },
  mobileStartMenu: {
    width: 280,
    bottom: 0,
  },
  startMenuHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#32328AFF",
  },
  startMenuLogo: {
    width: 32,
    height: 32,
    marginRight: 12,
  },
  startMenuTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  startMenuContent: {
    minHeight: 200,
  },
  mainMenu: {
    flex: 1,
    padding: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#dfdfdf",
  },
  menuIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  menuText: {
    fontSize: 13,
    color: "#000000",
    fontFamily: "MS Sans Serif, System",
    flex: 1,
  },
  submenuArrow: {
    fontSize: 12,
    color: "#444444FA",
    fontWeight: "bold",
    marginLeft: 8,
  },
  // Programs Submenu - Now positioned next to Start Menu without title
  programsSubmenu: {
    position: "absolute",
    bottom: 100, // Aligned with start menu bottom
    left: 320, // Position to the right of the start menu
    width: 200,
    backgroundColor: "#c0c0c0",
    borderWidth: 2,
    borderColor: "#dfdfdf",
    borderTopColor: "#ffffff",
    borderLeftColor: "#ffffff",
    borderRightColor: "#808080",
    borderBottomColor: "#808080",
    zIndex: 1001, // Higher than start menu
  },
  mobileProgramsSubmenu: {
    left: 280, // Position to the right of mobile start menu
    bottom: 40,
    width: 180,
  },
  submenuItems: {
    padding: 8,
  },
  submenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#dfdfdf",
  },
  submenuIcon: {
    width: 18,
    height: 18,
    marginRight: 10,
  },
  submenuText: {
    fontSize: 12,
    color: "#000000",
    fontFamily: "MS Sans Serif, System",
  },
  menuSeparator: {
    height: 1,
    backgroundColor: "#808080",
    marginHorizontal: 8,
  },
  startMenuFooter: {
    padding: 12,
  },
  footerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  footerIcon: {
    width: 18,
    height: 18,
    marginRight: 10,
  },
  footerText: {
    fontSize: 12,
    color: "#000000",
    fontFamily: "MS Sans Serif, System",
  },
  // Taskbar Styles
  taskbar: {
    height: isMobile ? 70 : 40,
    backgroundColor: "#c0c0c0",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    borderTopWidth: 2,
    borderTopColor: "#dfdfdf",
    minHeight: 40,
    paddingBottom: isMobile ? 15 : 0, // Prevents accidental app close
  },
  mobileTaskbar: {
    height: 60,
    paddingHorizontal: 6,
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    justifyContent: "center",
    paddingVertical: 6,
    backgroundColor: "#c0c0c0",
    borderWidth: 2,
    borderTopColor: "#ffffff",
    borderLeftColor: "#ffffff",
    borderRightColor: "#808080",
    borderBottomColor: "#808080",
    marginRight: 8,
    minWidth: 60,
  },
  startLogo: {
    width: 16,
    height: 16,
    marginRight: 6,
  },
  startText: {
    fontWeight: "bold",
    fontSize: 13,
    color: "#000000",
    fontFamily: "MS Sans Serif, System",
  },
  taskbarPrograms: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  taskbarProgram: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center", // Center content
    paddingHorizontal: 10,
    paddingVertical: 2,
    backgroundColor: "#c0c0c0",
    borderWidth: 1,
    borderTopColor: "#ffffff",
    borderLeftColor: "#ffffff",
    borderRightColor: "#808080",
    borderBottomColor: "#808080",
    marginRight: 6,
    marginBottom: 2,
    minWidth: 60,
  },
  mobileTaskbarProgram: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginRight: 4,
    minWidth: 50,
  },
  minimizedProgram: {
    opacity: 0.6,
  },
  taskbarIcon: {
    width: isMobile ? 22 : 20, // Larger icons on mobile
    height: 24,
    marginRight: 0, // Remove right margin since we're stacking
    marginBottom: 2, // Small space between icon and text
  },
  mobileTaskbarIcon: {
    width: 18,
    height: 18,
  },
  taskbarProgramText: {
    fontSize: 11,
    color: "#000000",
    fontFamily: "MS Sans Serif, System",
    alignItems: "center",
  },
  systemTray: {
    flexDirection: "row",
    alignItems: "center",
  },
  trayIcons: {
    flexDirection: "row",
    marginRight: isMobile ? 0 : 8,
  },
  trayIconImage: {
    width: 16,
    height: 16,
    marginLeft: 6,
  },
  clock: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "#c0c0c0",
    borderWidth: 1,
    borderTopColor: "#808080",
    borderLeftColor: "#808080",
    borderRightColor: "#ffffff",
    borderBottomColor: "#ffffff",
    minWidth: 70,
  },
  mobileClock: {
    paddingHorizontal: 8,
    minWidth: 60,
  },
  clockText: {
    fontSize: 11,
    color: "#000000",
    fontFamily: "MS Sans Serif, System",
    textAlign: "center",
  },
  windowText: {
    fontSize: 12,
    color: "#000000",
    lineHeight: 16,
    fontFamily: "MS Sans Serif, System",
    textAlign: "center",
  },
});

export default WindowsDesktop;
