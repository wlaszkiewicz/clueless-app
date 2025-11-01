import React from "react";
import { View, Text, StyleSheet, Image, Platform } from "react-native";

interface CluelessWindowProps {
  isFullscreen?: boolean;
  isMobile?: boolean;
}

const isMobile = Platform.OS === "android" || Platform.OS === "ios";

const CluelessWindow: React.FC<CluelessWindowProps> = ({
  isFullscreen = false,
  isMobile = false,
}) => {
  const mobileContent = (
    <View style={windowStyles.content}>
      <Text style={windowStyles.title}>Welcome to Clueless!</Text>
      <Text style={windowStyles.subtitle}>Your digital wardrobe organizer</Text>

      <View style={windowStyles.features}>
        <View style={windowStyles.featureItem}>
          <Image
            source={require("../../assets/icons/wardrobe.png")}
            style={windowStyles.featureIcon}
          />
          <Text style={windowStyles.feature}>Organize your wardrobe</Text>
        </View>
        <View style={windowStyles.featureItem}>
          <Image
            source={require("../../assets/icons/outfit.png")}
            style={windowStyles.featureIcon}
          />
          <Text style={windowStyles.feature}>Create amazing outfits</Text>
        </View>
        <View style={windowStyles.featureItem}>
          <Image
            source={require("../../assets/icons/camera.png")}
            style={windowStyles.featureIcon}
          />
          <Text style={windowStyles.feature}>Virtual try-on</Text>
        </View>
        <View style={windowStyles.featureItem}>
          <Image
            source={require("../../assets/icons/gallery.png")}
            style={windowStyles.featureIcon}
          />
          <Text style={windowStyles.feature}>Style gallery</Text>
        </View>
      </View>
    </View>
  );

  const desktopContent = (
    <View style={windowStyles.content}>
      <Image
        source={require("../../assets/icons/clueless.png")}
        style={windowStyles.logo}
      />
      <Text style={windowStyles.title}>Clueless Wardrobe</Text>
      <Text style={windowStyles.subtitle}>
        Your digital closet and style organizer
      </Text>

      <View style={windowStyles.featureGrid}>
        <View style={windowStyles.featureCard}>
          <Image
            source={require("../../assets/icons/wardrobe.png")}
            style={windowStyles.featureIconDesktop}
          />
          <Text style={windowStyles.featureTitle}>Organize</Text>
          <Text style={windowStyles.featureDesc}>
            Categorize and manage your clothing collection
          </Text>
        </View>

        <View style={windowStyles.featureCard}>
          <Image
            source={require("../../assets/icons/outfit.png")}
            style={windowStyles.featureIconDesktop}
          />
          <Text style={windowStyles.featureTitle}>Create</Text>
          <Text style={windowStyles.featureDesc}>
            Build and save outfit combinations
          </Text>
        </View>

        <View style={windowStyles.featureCard}>
          <Image
            source={require("../../assets/icons/camera.png")}
            style={windowStyles.featureIconDesktop}
          />
          <Text style={windowStyles.featureTitle}>Capture</Text>
          <Text style={windowStyles.featureDesc}>
            Add items using camera or photos
          </Text>
        </View>

        <View style={windowStyles.featureCard}>
          <Image
            source={require("../../assets/icons/gallery.png")}
            style={windowStyles.featureIconDesktop}
          />
          <Text style={windowStyles.featureTitle}>Browse</Text>
          <Text style={windowStyles.featureDesc}>
            View your style gallery and past outfits
          </Text>
        </View>
      </View>

      <Text style={windowStyles.tip}>
        Double-click desktop icons to launch applications and start organizing
      </Text>
    </View>
  );

  return isMobile ? mobileContent : desktopContent;
};

const windowStyles = StyleSheet.create({
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

export default CluelessWindow;
