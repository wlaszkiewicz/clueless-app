import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
} from "react-native";
import DesktopIcon from "../components/DesktopIcon";
import DraggableWindow from "../components/DraggableWindow";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const isMobile = screenWidth < 768;
const isTablet = screenWidth >= 768 && screenWidth < 1024;

const WindowsDesktop = () => {
  const [currentTime, setCurrentTime] = useState("");
  const [openWindows, setOpenWindows] = useState<string[]>([]);
  const [minimizedWindows, setMinimizedWindows] = useState<string[]>([]);
  const [iconPositions, setIconPositions] = useState<{
    [key: string]: { x: number; y: number };
  }>({});
  const [windowPositions, setWindowPositions] = useState<{
    [key: string]: { x: number; y: number };
  }>({});

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

  // Responsive icon positioning
  const getIconPositions = () => {
    if (isMobile) {
      // Mobile: 3 icons in first row, 2 in second row
      const iconWidth = 90;
      const iconHeight = 110;
      const horizontalSpacing = (screenWidth - 3 * iconWidth) / 4;
      const verticalSpacing = 20;

      return [
        { x: horizontalSpacing, y: 30 }, // Row 1 - Col 1
        { x: horizontalSpacing * 2 + iconWidth, y: 30 }, // Row 1 - Col 2
        { x: horizontalSpacing * 3 + iconWidth * 2, y: 30 }, // Row 1 - Col 3
        {
          x: horizontalSpacing + iconWidth / 2,
          y: 30 + iconHeight + verticalSpacing,
        }, // Row 2 - Col 1
        {
          x: horizontalSpacing * 2 + iconWidth * 1.5,
          y: 30 + iconHeight + verticalSpacing,
        }, // Row 2 - Col 2
      ];
    } else if (isTablet) {
      // Tablet: Icons on left with good spacing
      return [
        { x: 30, y: 30 },
        { x: 30, y: 170 },
        { x: 30, y: 310 },
        { x: 30, y: 450 },
        { x: 30, y: 590 },
      ];
    } else {
      // Desktop: Icons on left with generous spacing
      return [
        { x: 30, y: 20 },
        { x: 30, y: 150 },
        { x: 30, y: 280 },
        { x: 30, y: 410 },
        { x: 30, y: 540 },
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
      id: "clueless",
      iconType: "clueless" as const,
      label: "Clueless",
    },
  ].map((icon, index) => ({
    ...icon,
    initialX: iconPositionsArray[index]?.x || 40,
    initialY: iconPositionsArray[index]?.y || 40 + index * 140,
  }));

  const openWindow = (windowId: string) => {
    if (!openWindows.includes(windowId)) {
      setOpenWindows([...openWindows, windowId]);
      setMinimizedWindows(minimizedWindows.filter((id) => id !== windowId));

      if (!windowPositions[windowId]) {
        // Responsive window positioning
        const windowIndex = openWindows.length;
        const baseX = isMobile ? 20 : 150;
        const baseY = isMobile ? 250 : 100;
        const offsetX = isMobile ? 10 : 25;
        const offsetY = isMobile ? 80 : 20; // More offset on mobile for better visibility

        setWindowPositions((prev) => ({
          ...prev,
          [windowId]: {
            x: baseX + windowIndex * offsetX,
            y: baseY + windowIndex * offsetY,
          },
        }));
      }
    } else if (minimizedWindows.includes(windowId)) {
      // Restore minimized window
      setMinimizedWindows(minimizedWindows.filter((id) => id !== windowId));
    }
  };

  const closeWindow = (windowId: string) => {
    setOpenWindows(openWindows.filter((id) => id !== windowId));
    setMinimizedWindows(minimizedWindows.filter((id) => id !== windowId));
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
        x: isMobile ? 20 : 150,
        y: isMobile ? 250 : 100,
      }
    );
  };

  // Taskbar icon sources
  const taskbarIconSources = {
    wardrobe: require("../assets/icons/wardrobe.png"),
    outfit: require("../assets/icons/outfit.png"),
    add: require("../assets/icons/add.png"),
    gallery: require("../assets/icons/gallery.png"),
    clueless: require("../assets/icons/application.png"),
  };

  return (
    <View style={styles.container}>
      {/* Light Blue Desktop Background */}
      <View style={styles.desktop}>
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

        {/* Draggable Windows (only non-minimized ones) */}
        {openWindows
          .filter((windowId) => !minimizedWindows.includes(windowId))
          .map((windowId) => {
            const icon = desktopIcons.find((icon) => icon.id === windowId);
            return (
              <DraggableWindow
                key={windowId}
                title={icon?.label || "Window"}
                iconType={icon?.iconType}
                initialPosition={getWindowPosition(windowId)}
                onClose={() => closeWindow(windowId)}
                onMinimize={() => minimizeWindow(windowId)}
                onDrag={(position) => handleWindowDrag(windowId, position)}
              >
                <Text style={styles.windowText}>
                  {windowId === "clueless"
                    ? "Welcome to Clueless! 💎\n\nDrag me around the desktop!\nDrag the icons too!"
                    : `This is the ${icon?.label} window.\n\nDrag me anywhere!`}
                </Text>
              </DraggableWindow>
            );
          })}

        {/* Welcome Text - Only show on larger screens */}
        {!isMobile && (
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>Clueless Fashion Studio</Text>
            <Text style={styles.welcomeSubtitle}>
              Drag icons and windows anywhere!
            </Text>
          </View>
        )}
      </View>

      {/* Responsive Taskbar */}
      <View style={[styles.taskbar, isMobile && styles.mobileTaskbar]}>
        <TouchableOpacity style={styles.startButton}>
          <Text style={styles.startLogo}>🎀</Text>
          {!isMobile && <Text style={styles.startText}>Start</Text>}
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
                  <Text style={styles.taskbarProgramText}>{icon?.label}</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.systemTray}>
          {!isMobile && (
            <View style={styles.trayIcons}>
              <Text style={styles.trayIcon}>🔊</Text>
              <Text style={styles.trayIcon}>📶</Text>
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
    backgroundColor: "#87ceeb",
  },
  desktop: {
    flex: 1,
    padding: 16,
  },
  welcomeContainer: {
    position: "absolute",
    bottom: 120,
    right: 40,
  },
  welcomeText: {
    fontSize: 24,
    color: "#ffffff",
    fontWeight: "bold",
    textShadowColor: "#000080",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 2,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: "#34495e",
    fontStyle: "italic",
  },
  windowText: {
    fontSize: 12,
    color: "#000000",
    lineHeight: 16,
    fontFamily: "MS Sans Serif, System",
    textAlign: "center",
  },
  taskbar: {
    height: 40,
    backgroundColor: "#c0c0c0",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    borderTopWidth: 2,
    borderTopColor: "#dfdfdf",
    minHeight: 40, // Minimum height
  },
  mobileTaskbar: {
    height: 50, // Taller on mobile for easier tapping
    paddingHorizontal: 6,
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#c0c0c0",
    borderWidth: 2,
    borderTopColor: "#ffffff",
    borderLeftColor: "#ffffff",
    borderRightColor: "#808080",
    borderBottomColor: "#808080",
    marginRight: 8,
    minWidth: 60, // Minimum width
  },
  startLogo: {
    fontSize: 14,
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
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "#c0c0c0",
    borderWidth: 1,
    borderTopColor: "#ffffff",
    borderLeftColor: "#ffffff",
    borderRightColor: "#808080",
    borderBottomColor: "#808080",
    marginRight: 6,
    marginBottom: 2,
    minWidth: 60, // Minimum width
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
    width: 16,
    height: 16,
    marginRight: 6,
  },
  mobileTaskbarIcon: {
    width: 18,
    height: 18,
    marginRight: 4,
  },
  taskbarProgramText: {
    fontSize: 11,
    color: "#000000",
    fontFamily: "MS Sans Serif, System",
  },
  systemTray: {
    flexDirection: "row",
    alignItems: "center",
  },
  trayIcons: {
    flexDirection: "row",
    marginRight: 8,
  },
  trayIcon: {
    fontSize: 14,
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
    minWidth: 70, // Minimum width
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
});

export default WindowsDesktop;
