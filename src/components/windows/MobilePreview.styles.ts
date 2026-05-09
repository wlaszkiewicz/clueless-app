import { StyleSheet } from "react-native";

export const previewStatText = StyleSheet.create({
  base: {
    fontSize: 10,
    color: "#888",
    textAlign: "center",
  },
});

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  icon: {
    width: 64,
    height: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  text: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 16,
    marginBottom: 16,
    color: "#666",
  },
  statsRow: {
    marginTop: 8,
    alignItems: "center",
  },
});
