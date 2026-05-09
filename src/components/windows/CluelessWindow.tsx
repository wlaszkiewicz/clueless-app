import React from "react";
import { View, Text, Image } from "react-native";
import { windowStyles } from "./CluelessWindow.styles";

interface CluelessWindowProps {
  isFullscreen?: boolean;
  isMobile?: boolean;
}


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


export default CluelessWindow;
