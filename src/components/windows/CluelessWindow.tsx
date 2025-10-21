import React from "react";
import { View, Text, StyleSheet } from "react-native";

const CluelessWindow = () => (
  <View style={styles.content}>
    <Text style={styles.title}>Clueless</Text>
    <Text style={styles.text}>Welcome to the Clueless app!</Text>
    <Text style={styles.text}>✨ Features:</Text>
    <Text style={styles.text}>• Add clothing items</Text>
    <Text style={styles.text}>• Organize by category</Text>
    <Text style={styles.text}>• Create outfits (coming soon)</Text>
    <Text style={styles.text}>• Virtual try-on (coming soon)</Text>
  </View>
);

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  text: {
    fontSize: 14,
    textAlign: "center",
  },
});

export default CluelessWindow;
