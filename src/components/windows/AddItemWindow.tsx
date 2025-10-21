import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useWardrobeStorage } from "../../hooks/useWardrobeStorage";
import { WardrobeItem } from "../../types/wardrobe";

const AddItemWindow = () => {
  const { wardrobe, saveWardrobe } = useWardrobeStorage();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [itemName, setItemName] = useState("");

  const pickImage = async () => {
    // ... keep the same image picker logic from before ...
  };

  const takePhoto = async () => {
    // ... keep the same camera logic from before ...
  };

  const addToWardrobe = () => {
    // ... keep the same add logic from before ...
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add New Clothing Item</Text>

      {/* Image Preview */}
      <View style={styles.imageSection}>
        {selectedImage ? (
          <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>No image selected</Text>
          </View>
        )}

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.button} onPress={pickImage}>
            <Text style={styles.buttonText}>Choose Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={takePhoto}>
            <Text style={styles.buttonText}>Take Photo</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Item Name Input */}
      <View style={styles.inputSection}>
        <Text style={styles.label}>Item Name (optional):</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.input}>{itemName || "Enter item name..."}</Text>
        </View>
      </View>

      {/* Add Button */}
      <TouchableOpacity style={styles.addButton} onPress={addToWardrobe}>
        <Text style={styles.addButtonText}>Add to Wardrobe</Text>
      </TouchableOpacity>

      <Text style={styles.hint}>
        After adding, go to "My Wardrobe" to categorize your items!
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#c0c0c0", // Windows gray
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 20,
    textAlign: "center",
    fontFamily: "MS Sans Serif, System",
  },
  imageSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  imagePreview: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderColor: "#dfdfdf",
    borderTopColor: "#ffffff",
    borderLeftColor: "#ffffff",
    borderRightColor: "#808080",
    borderBottomColor: "#808080",
    marginBottom: 15,
  },
  placeholder: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderColor: "#dfdfdf",
    borderTopColor: "#ffffff",
    borderLeftColor: "#ffffff",
    borderRightColor: "#808080",
    borderBottomColor: "#808080",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    backgroundColor: "#ffffff",
  },
  placeholderText: {
    color: "#808080",
    fontSize: 12,
    fontFamily: "MS Sans Serif, System",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  button: {
    backgroundColor: "#c0c0c0",
    padding: 12,
    borderWidth: 2,
    borderColor: "#dfdfdf",
    borderTopColor: "#ffffff",
    borderLeftColor: "#ffffff",
    borderRightColor: "#808080",
    borderBottomColor: "#808080",
    flex: 1,
    marginHorizontal: 5,
  },
  buttonText: {
    color: "#000000",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 12,
    fontFamily: "MS Sans Serif, System",
  },
  inputSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    color: "#000000",
    marginBottom: 8,
    fontWeight: "bold",
    fontFamily: "MS Sans Serif, System",
  },
  inputContainer: {
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "#dfdfdf",
    borderTopColor: "#ffffff",
    borderLeftColor: "#ffffff",
    borderRightColor: "#808080",
    borderBottomColor: "#808080",
    padding: 8,
    minHeight: 32,
    justifyContent: "center",
  },
  input: {
    fontSize: 12,
    color: "#000000",
    fontFamily: "MS Sans Serif, System",
  },
  addButton: {
    backgroundColor: "#c0c0c0",
    padding: 12,
    borderWidth: 2,
    borderColor: "#dfdfdf",
    borderTopColor: "#ffffff",
    borderLeftColor: "#ffffff",
    borderRightColor: "#808080",
    borderBottomColor: "#808080",
    alignItems: "center",
    marginBottom: 15,
  },
  addButtonText: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "bold",
    fontFamily: "MS Sans Serif, System",
  },
  hint: {
    fontSize: 11,
    color: "#000000",
    textAlign: "center",
    fontStyle: "italic",
    fontFamily: "MS Sans Serif, System",
  },
});

export default AddItemWindow;
