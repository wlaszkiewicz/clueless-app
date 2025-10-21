import React from "react";
import { View, Text, StyleSheet } from "react-native";

const DressMeWindow = () => (
  <View style={styles.content}>
    <Text style={styles.title}>Dress Me</Text>
    <Text style={styles.text}>Virtual try-on feature coming soon!</Text>
    <Text style={styles.comingSoon}>👚 Coming Soon! 👕</Text>
  </View>
);

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffe6f2",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#d40078",
  },
  text: {
    fontSize: 14,
    textAlign: "center",
    color: "#d40078",
  },
  comingSoon: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ff3385",
    marginTop: 20,
  },
});

export default DressMeWindow;
