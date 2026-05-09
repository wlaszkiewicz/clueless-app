import React, { useState, useEffect } from "react";
import {
  View,
  Text,
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
import { styles } from "./WindowsDesktop.styles";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const isMobile = Platform.OS === "ios" || Platform.OS === "android";
const isTablet = screenWidth >= 768 && screenWidth < 1024;

const WINDOW_SIZES: Record<string, { width: number; height: number }> = {
  wardrobe: { width: 700, height: 600 },
  outfits: { width: 1000, height: 700 },
  gallery: { width: 650, height: 700 },
  dressMe: { width: 650, height: 700 },
  addItem: { width: 600, height: 700 },
  clueless: { width: 600, height: 600 },
};
const WINDOW_DEFAULT_SIZE = { width: 600, height: 500 };

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
  const [focusedWindow, setFocusedWindow] = useState<string | null>("clueless");
  const [showStartMenu, setShowStartMenu] = useState(false);
  const [showProgramsMenu, setShowProgramsMenu] = useState(false);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      );
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleProgramsMenu = () => {
    setShowProgramsMenu(!showProgramsMenu);
  };

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
        { x: horizontalSpacing, y: 30 },
        { x: horizontalSpacing * 2 + iconWidth, y: 30 },
        { x: horizontalSpacing * 3 + iconWidth * 2, y: 30 },
        { x: horizontalSpacing, y: 30 + iconHeight + verticalSpacing },
        { x: horizontalSpacing * 2 + iconWidth, y: 30 + iconHeight + verticalSpacing },
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
      setFocusedWindow(windowId);
      closeAllMenus();

      if (!windowPositions[windowId]) {
        const windowCount = openWindows.length;

        if (isMobile) {
          const iconBottom =
            Math.max(
              ...desktopIcons.map((icon) => getIconPosition(icon.id).y),
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
          const baseX = 300;
          const baseY = 70;
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
      setFocusedWindow(windowId);
      closeAllMenus();
    } else {
      setFocusedWindow(windowId);
    }
  };

  const focusWindow = (windowId: string) => {
    setFocusedWindow(windowId);
  };

  const closeWindow = (windowId: string) => {
    setOpenWindows(openWindows.filter((id) => id !== windowId));
    setMinimizedWindows(minimizedWindows.filter((id) => id !== windowId));
    if (focusedWindow === windowId) {
      const remainingWindows = openWindows.filter((id) => id !== windowId);
      setFocusedWindow(
        remainingWindows.length > 0
          ? remainingWindows[remainingWindows.length - 1]
          : null,
      );
    }
  };
  const minimizeWindow = (windowId: string) => {
    setMinimizedWindows([...minimizedWindows, windowId]);
  };

  const handleIconDrag = (
    iconId: string,
    position: { x: number; y: number },
  ) => {
    setIconPositions((prev) => ({
      ...prev,
      [iconId]: position,
    }));
  };

  const handleWindowDrag = (
    windowId: string,
    position: { x: number; y: number },
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
        x: isMobile ? 20 : 300,
        y: isMobile ? 280 : 100,
      }
    );
  };

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
    console.log("Shutting down...");
    closeAllMenus();
  };

  const handleChangeWallpaper = () => {
    console.log("Changing wallpaper...");
    closeAllMenus();
  };

  const [fullscreenStates, setFullscreenStates] = useState<{
    [key: string]: boolean;
  }>({});

  const handleFullscreen = (windowId: string, isFullscreen: boolean) => {
    setFullscreenStates((prev) => ({
      ...prev,
      [windowId]: isFullscreen,
    }));
  };

  const [wardrobeRefreshTrigger, setWardrobeRefreshTrigger] = useState(0);

  const refreshWardrobe = () => {
    setWardrobeRefreshTrigger((prev) => prev + 1);
  };

  const renderWindowContent = (windowId: string) => {
    const isFullscreen = fullscreenStates[windowId] || false;

    switch (windowId) {
      case "outfits":
        return (
          <CreateOutfitWindow isFullscreen={isFullscreen} isMobile={isMobile} />
        );
      case "addItem":
        return (
          <AddItemWindow
            isFullscreen={isFullscreen}
            isMobile={isMobile}
            onItemAdded={refreshWardrobe}
          />
        );
      case "wardrobe":
        return (
          <WardrobeWindow
            isFullscreen={isFullscreen}
            isMobile={isMobile}
            key={wardrobeRefreshTrigger}
          />
        );
      case "gallery":
        return (
          <GalleryWindow isFullscreen={isFullscreen} isMobile={isMobile} />
        );
      case "dressMe":
        return (
          <DressMeWindow isFullscreen={isFullscreen} isMobile={isMobile} />
        );
      case "clueless":
        return (
          <CluelessWindow isFullscreen={isFullscreen} isMobile={isMobile} />
        );
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
      <View style={styles.desktop}>
        {!isMobile && (
          <View style={styles.logoContainer}>
            <Image
              source={require("./assets/clueless-logo.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
        )}
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
        {openWindows
          .filter((windowId) => !minimizedWindows.includes(windowId))
          .map((windowId) => {
            const icon = desktopIcons.find((icon) => icon.id === windowId);
            const { width: desktopWidth, height: desktopHeight } =
              WINDOW_SIZES[windowId] ?? WINDOW_DEFAULT_SIZE;
            return (
              <DraggableWindow
                key={windowId}
                title={icon?.label || "Clueless"}
                iconType={icon?.iconType || "clueless"}
                initialPosition={getWindowPosition(windowId)}
                onClose={() => closeWindow(windowId)}
                onMinimize={() => minimizeWindow(windowId)}
                onFullscreen={(isFullscreen) =>
                  handleFullscreen(windowId, isFullscreen)
                }
                onFocus={() => focusWindow(windowId)}
                onDrag={(position) => handleWindowDrag(windowId, position)}
                width={isMobile ? screenWidth * 0.9 : desktopWidth}
                height={isMobile ? 300 : desktopHeight}
                isFocused={focusedWindow === windowId}
                isMobile={isMobile}
              >
                {renderWindowContent(windowId)}
              </DraggableWindow>
            );
          })}
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
              <View style={styles.mainMenu}>
                {startMenuCategories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={styles.menuItem}
                    onPress={() => {
                      if (category.hasSubmenu) {
                        toggleProgramsMenu();
                      } else {
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

            <View style={styles.menuSeparator} />

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

      <View style={[styles.taskbar, isMobile && styles.mobileTaskbar]}>
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => {
            setShowStartMenu(!showStartMenu);
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


export default WindowsDesktop;
