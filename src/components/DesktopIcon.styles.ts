import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  iconContainer: {
    alignItems: "center",
    padding: 8,
    width: 80,
    borderRadius: 2,
  },
  selected: {
    backgroundColor: "rgba(0, 0, 255, 0.3)",
  },
  iconWrapper: {
    width: 70,
    height: 70,
    marginBottom: 2,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  iconImage: {
    width: 70,
    height: 70,
  },
  label: {
    fontFamily: "MS Sans Serif, System",
    fontSize: 12,
    color: "#ffffff",
    textAlign: "center",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
    textShadowColor: "#000000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
    userSelect: "none",
    maxWidth: 70,
    lineHeight: 12,
  },
});
