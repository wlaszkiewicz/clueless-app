import { StyleSheet, Platform } from "react-native";

const isMobile = Platform.OS === "android" || Platform.OS === "ios";

export const windowStyles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#c0c0c0",
  },
  logo: {
    width: 64,
    height: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
    textAlign: "center",
    fontFamily: "MS Sans Serif, System",
    color: "#000",
  },
  subtitle: {
    fontSize: 14,
    color: "#000",
    marginBottom: isMobile ? 20 : 30,
    textAlign: "center",
    fontFamily: "MS Sans Serif, System",
  },
  features: {
    alignItems: "flex-start",
    marginBottom: 0,
    maxWidth: 400,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 7,
  },
  featureIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  feature: {
    fontSize: 14,
    fontFamily: "MS Sans Serif, System",
    color: "#000",
  },
  featureGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 30,
    maxWidth: 500,
  },
  featureIconDesktop: {
    width: 40,
    height: 40,
    marginBottom: 8,
  },
  featureCard: {
    width: "48%",
    alignItems: "center",
    padding: 16,
    marginBottom: 10,
    backgroundColor: "#c0c0c0",
    borderWidth: 2,
    borderColor: "#dfdfdf",
    borderTopColor: "#ffffff",
    borderLeftColor: "#ffffff",
    borderRightColor: "#808080",
    borderBottomColor: "#808080",
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
    fontFamily: "MS Sans Serif, System",
    textAlign: "center",
    color: "#000",
  },
  featureDesc: {
    fontSize: 12,
    fontFamily: "MS Sans Serif, System",
    textAlign: "center",
    color: "#000",
    lineHeight: 14,
  },
  tip: {
    fontSize: 12,
    color: "#000",
    textAlign: "center",
    fontFamily: "MS Sans Serif, System",
    maxWidth: 400,
    lineHeight: 16,
  },
});
