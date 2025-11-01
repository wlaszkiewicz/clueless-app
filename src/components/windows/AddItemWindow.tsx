import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  TextInput,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { wardrobeStorage, WardrobeItem } from "../../utils/storage";
import { ImageStorage } from "../../utils/imageStorage";
import { BackgroundRemovalService } from "../../utils/bgremoval";

interface AddItemWindowProps {
  isFullscreen?: boolean;
  isMobile?: boolean;
  onItemAdded?: () => void;
}

const AddItemWindow: React.FC<AddItemWindowProps> = ({
  isFullscreen = false,
  isMobile = false,
  onItemAdded,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("tops");
  const [itemName, setItemName] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const cameraContainerRef = useRef<View>(null);

  const showError = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(null), 3000);
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    if (Platform.OS !== "web") {
      takePhotoNative();
      return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      streamRef.current = mediaStream;
      setShowCamera(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch(console.error);
        }
      }, 100);
    } catch (error) {
      console.error("Error accessing camera:", error);
      showError("Cannot access camera. Please check permissions.");
      takePhotoFallback();
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) return;

    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const imageUrl = URL.createObjectURL(blob);
          setSelectedImage(imageUrl);
          setItemName(`Photo_${Date.now()}`);
          stopCamera();
        }
      },
      "image/jpeg",
      0.8
    );
  };

  const takePhotoFallback = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const imageUrl = URL.createObjectURL(file);
        setSelectedImage(imageUrl);
        setItemName(`Photo_${Date.now()}`);
      }
    };

    input.click();
  };

  const takePhotoNative = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        setItemName(`Photo_${Date.now()}`);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      showError("Failed to take photo");
    }
  };

  // FIXED: Simplified image picking
  const pickImage = async () => {
    try {
      if (Platform.OS === "web") {
        takePhotoFallback();
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        setItemName(`Item_${Date.now()}`);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      showError("Failed to pick image");
    }
  };

  // FIXED: Web camera support
  const takePhoto = async () => {
    if (Platform.OS === "web") {
      startCamera();
    } else {
      takePhotoNative();
    }
  };

  const saveItem = async () => {
    if (!selectedImage) {
      showError("Please select an image first");
      return;
    }

    if (!itemName.trim()) {
      showError("Please give your item a name");
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      console.log("💾 Preparing image for storage...");
      const permanentImageUri = await ImageStorage.prepareImageForStorage(
        selectedImage
      );
      console.log(
        "✅ Image prepared:",
        permanentImageUri.substring(0, 50) + "..."
      );

      const newItem: WardrobeItem = {
        id: Date.now().toString(),
        name: itemName.trim(),
        category: selectedCategory,
        imageUri: permanentImageUri,
        tags: [],
        createdAt: new Date().toISOString(),
        hasBackgroundRemoved: false,
      };

      console.log("💾 Saving item to storage...");
      await wardrobeStorage.saveItem(newItem);
      console.log("✅ Item saved successfully!");

      showSuccess(`"${newItem.name}" added to your wardrobe!`);

      setSelectedImage(null);
      setSelectedCategory("tops");
      setItemName("");

      if (onItemAdded) {
        onItemAdded();
      }
    } catch (error) {
      console.error("❌ Error saving item:", error);
      showError("Failed to save item to wardrobe");
    } finally {
      setIsSaving(false);
    }
  };

  const categories = [
    { id: "tops", label: "Tops", icon: require("../../assets/icons/tops.png") },
    {
      id: "bottoms",
      label: "Bottoms",
      icon: require("../../assets/icons/bottoms.png"),
    },
    {
      id: "shoes",
      label: "Shoes",
      icon: require("../../assets/icons/shoes.png"),
    },
    {
      id: "dresses",
      label: "Dresses",
      icon: require("../../assets/icons/dresses.png"),
    },
    {
      id: "accessories",
      label: "Accessories",
      icon: require("../../assets/icons/jewelry.png"),
    },
    {
      id: "outerwear",
      label: "Outerwear",
      icon: require("../../assets/icons/outerwear.png"),
    },
  ];

  const [isRemovingBackground, setIsRemovingBackground] = useState(false);
  const [hasBackgroundRemoved, setHasBackgroundRemoved] = useState(false);

  const removeBackground = async () => {
    if (!selectedImage) {
      showError("Please select an image first");
      return;
    }

    setIsRemovingBackground(true);
    setErrorMessage(null);

    try {
      console.log("🎨 Removing background...");
      const transparentImageUrl =
        await BackgroundRemovalService.removeBackgroundWithEdges(selectedImage);

      setSelectedImage(transparentImageUrl);
      setHasBackgroundRemoved(true);
      showSuccess("Background removed! Item will be saved with transparency.");
    } catch (error) {
      console.error("Background removal failed:", error);
      showError("Background removal failed. Try with a clearer background.");
    } finally {
      setIsRemovingBackground(false);
    }
  };

  const AddIcon = () => (
    <View style={iconStyles.addIcon}>
      <View style={iconStyles.addHorizontal} />
      <View style={iconStyles.addVertical} />
    </View>
  );

  const CloseIcon = () => (
    <View style={iconStyles.closeIcon}>
      <View style={iconStyles.closeLine1} />
      <View style={iconStyles.closeLine2} />
    </View>
  );

  const mobilePreviewContent = (
    <View style={windowStyles.previewContent}>
      <Image
        source={require("../../assets/icons/add.png")}
        style={windowStyles.previewIcon}
      />
      <Text style={windowStyles.previewTitle}>Add Item</Text>
      <Text style={windowStyles.previewText}>
        Add new items to your wardrobe{"\n"}• Take photos{"\n"}• Upload images
        {"\n"}• Categorize items
      </Text>
      <View style={windowStyles.previewStats}>
        <Text style={windowStyles.statsText}>Camera</Text>
        <Text style={windowStyles.statsText}>Gallery</Text>
      </View>
    </View>
  );

  const WebCameraPreview = () => {
    useEffect(() => {
      if (videoRef.current && streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.play().catch(console.error);
      }
    }, []);

    return (
      <View style={windowStyles.cameraOverlay}>
        <View style={windowStyles.cameraContainer}>
          <Text style={windowStyles.cameraTitle}>Take a Photo</Text>
          <View style={windowStyles.cameraPreview}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                backgroundColor: "#000",
              }}
            />
          </View>
          <View style={windowStyles.cameraControls}>
            <TouchableOpacity
              style={windowStyles.cameraButton}
              onPress={capturePhoto}
            >
              <Text style={windowStyles.cameraButtonText}>📸 Capture</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={windowStyles.cameraButton}
              onPress={stopCamera}
            >
              <Text style={windowStyles.cameraButtonText}>❌ Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };
  // Full functionality
  const fullContent = (
    <View style={windowStyles.fullContent}>
      <Text style={windowStyles.fullSubtitle}>
        Add clothing to your digital wardrobe
      </Text>

      {showCamera && Platform.OS === "web" && <WebCameraPreview />}

      {selectedImage && (
        <View style={windowStyles.imagePreview}>
          <Image
            source={{ uri: selectedImage }}
            style={windowStyles.previewImage}
          />
          <TouchableOpacity
            style={windowStyles.removeImageButton}
            onPress={() => {
              setSelectedImage(null);
              setHasBackgroundRemoved(false);
            }}
          >
            <CloseIcon />
          </TouchableOpacity>
        </View>
      )}

      {!selectedImage && (
        <View style={windowStyles.imagePreview}>
          <Image
            source={require("../../assets/icons/gallery-photo.png")}
            style={[windowStyles.previewImagePlaceholder]} // Black & white effect
          />
          <Text style={windowStyles.placeholderText}>No image selected</Text>
        </View>
      )}

      <View style={windowStyles.uploadSection}>
        <View style={windowStyles.uploadOptions}>
          <TouchableOpacity
            style={windowStyles.uploadButton}
            onPress={takePhoto}
          >
            <Image
              source={require("../../assets/icons/camera.png")}
              style={windowStyles.uploadIcon}
            />
            <Text style={windowStyles.uploadText}>Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={windowStyles.uploadButton}
            onPress={pickImage}
          >
            <Image
              source={require("../../assets/icons/gallery-photo.png")}
              style={windowStyles.uploadIcon}
            />
            <Text style={windowStyles.uploadText}>Choose from Gallery</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Item Name Input - REDESIGNED */}
      {/* <View style={windowStyles.formSection}>
        <Text style={windowStyles.sectionTitle}>Item Name</Text>
        <View style={windowStyles.nameInputContainer}>
          <TextInput
            style={windowStyles.nameInput}
            value={itemName}
            onChangeText={setItemName}
            placeholder="Enter item name..."
            placeholderTextColor="#666"
          />
        </View>
      </View> */}

      {/* Category Selection  */}
      <View style={windowStyles.formSection}>
        <Text style={windowStyles.sectionTitle}>Category</Text>
        <View style={windowStyles.categoryGrid}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                windowStyles.categoryOption,
                selectedCategory === category.id &&
                  windowStyles.categoryOptionSelected,
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Image source={category.icon} style={windowStyles.categoryIcon} />
              <Text
                style={[
                  windowStyles.categoryText,
                  selectedCategory === category.id && windowStyles.categoryText,
                ]}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={windowStyles.tipAndBgRemoveRow}>
        <View style={windowStyles.tipBox}>
          <View style={windowStyles.tipContent}>
            <Text style={windowStyles.tipTitle}>Pro Tip</Text>
            <Text style={windowStyles.tipText}>
              Use the button next to remove backgrounds from your images. It's
              an experimental feature that works best with clear backgrounds.
              For best results, use free tools like remove.bg!
            </Text>
          </View>
        </View>

        {selectedImage && Platform.OS === "web" && (
          <TouchableOpacity
            style={[
              windowStyles.bgRemoveButton,
              hasBackgroundRemoved && windowStyles.bgRemoveButtonDisabled,
            ]}
            onPress={removeBackground}
            disabled={hasBackgroundRemoved || isRemovingBackground}
          >
            {isRemovingBackground ? (
              <Text style={windowStyles.bgRemoveText}>Removing...</Text>
            ) : (
              <View style={windowStyles.bgRemoveContent}>
                <Image
                  source={require("../../assets/icons/magic-wand.png")}
                  style={windowStyles.bgRemoveIcon}
                />
                <Text style={windowStyles.bgRemoveText}>
                  {hasBackgroundRemoved
                    ? "✓ Background Removed"
                    : "Remove Background"}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>

      <View style={windowStyles.actionBar}>
        <TouchableOpacity
          style={[
            windowStyles.actionButton,
            (!selectedImage || !itemName.trim()) &&
              windowStyles.actionButtonDisabled,
          ]}
          onPress={saveItem}
          disabled={!selectedImage || !itemName.trim() || isSaving}
        >
          {isSaving ? (
            <Text style={windowStyles.actionText}>Saving...</Text>
          ) : (
            <>
              <AddIcon />
              <Text style={windowStyles.actionText}>Save to Wardrobe</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return isMobile && !isFullscreen ? mobilePreviewContent : fullContent;
};

const iconStyles = StyleSheet.create({
  addIcon: {
    width: 16,
    height: 16,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  addHorizontal: {
    position: "absolute",
    width: 12,
    height: 2,
    backgroundColor: "#000",
  },
  addVertical: {
    position: "absolute",
    width: 2,
    height: 12,
    backgroundColor: "#000",
  },

  // Close Icon (X mark)
  closeIcon: {
    width: 12,
    height: 12,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  closeLine1: {
    position: "absolute",
    width: 12,
    height: 2,
    backgroundColor: "#000",
    transform: [{ rotate: "45deg" }],
  },
  closeLine2: {
    position: "absolute",
    width: 12,
    height: 2,
    backgroundColor: "#000",
    transform: [{ rotate: "-45deg" }],
  },
});

const windowStyles = StyleSheet.create({
  previewContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  previewIcon: {
    width: 64,
    height: 64,
    marginBottom: 16,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
    fontFamily: "MS Sans Serif, System",
  },
  previewText: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 16,
    marginBottom: 16,
    color: "#666",
    fontFamily: "MS Sans Serif, System",
  },
  previewStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 8,
  },
  statsText: {
    fontSize: 10,
    color: "#888",
    fontFamily: "MS Sans Serif, System",
  },
  fullContent: {
    flex: 1,
    padding: 16,
    backgroundColor: "#c0c0c0",
  },
  fullTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#000",
    fontFamily: "MS Sans Serif, System",
  },
  fullSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    fontFamily: "MS Sans Serif, System",
    alignSelf: "center",
  },
  // Image Preview - REDESIGNED
  imagePreview: {
    alignItems: "center",
    marginBottom: 20,
    position: "relative",
    alignSelf: "center",
  },
  previewImagePlaceholder: {
    width: 120,
    height: 120,
    borderWidth: 2,
    borderColor: "#000",
    borderTopColor: "#ffffff",
    borderLeftColor: "#ffffff",
    borderRightColor: "#808080",
    borderBottomColor: "#808080",
    opacity: 0.2,
  },
  placeholderText: {
    position: "absolute",
    top: "50%",
    fontSize: 10,
    color: "#000",
    fontFamily: "MS Sans Serif, System",
    textAlign: "center",
  },
  previewImage: {
    width: 120,
    height: 120,
    borderWidth: 2,
    borderColor: "#000",
    borderTopColor: "#ffffff",
    borderLeftColor: "#ffffff",
    borderRightColor: "#808080",
    borderBottomColor: "#808080",
  },
  removeImageButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#c0c0c0",
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: "#808080",
    borderTopColor: "#ffffff",
    borderLeftColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
  },
  // Upload Section - REDESIGNED
  uploadSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#000",
    fontFamily: "MS Sans Serif, System",
  },
  uploadOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 20,
  },
  uploadButton: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    backgroundColor: "#c0c0c0",
    borderWidth: 2,
    borderColor: "#dfdfdf",
    borderTopColor: "#ffffff",
    borderLeftColor: "#ffffff",
    borderRightColor: "#808080",
    borderBottomColor: "#808080",
    minHeight: 70,
  },
  uploadIcon: {
    width: 40,
    height: 40,
    marginBottom: 6,
  },
  uploadText: {
    fontSize: 11,
    textAlign: "center",
    fontWeight: "bold",
    fontFamily: "MS Sans Serif, System",
  },
  // Form Sections - REDESIGNED
  formSection: {
    marginBottom: 20,
  },
  nameInputContainer: {
    borderWidth: 2,
    borderColor: "#dfdfdf",
    borderTopColor: "#808080",
    borderLeftColor: "#808080",
    borderRightColor: "#ffffff",
    borderBottomColor: "#ffffff",
    backgroundColor: "white",
    paddingHorizontal: 6,
    paddingVertical: 4,
    minHeight: 24,
  },
  nameInput: {
    fontSize: 12,
    color: "#000000",
    fontFamily: "MS Sans Serif, System",
    padding: 0,
    margin: 0,
  },
  // Category Grid - REDESIGNED
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryOption: {
    flex: 1,
    minWidth: "10%",
    alignItems: "center",
    padding: 8,
    backgroundColor: "#c0c0c0",
    borderWidth: 2,
    borderColor: "#dfdfdf",
    borderTopColor: "#ffffff",
    borderLeftColor: "#ffffff",
    borderRightColor: "#808080",
    borderBottomColor: "#808080",
    shadowColor: "#000",
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 0,
    elevation: 3,
  },
  categoryOptionSelected: {
    borderColor: "#ff66b2",
    borderTopColor: "#808080",
    borderLeftColor: "#808080",
    borderRightColor: "#ffffff",
    borderBottomColor: "#ffffff",
    shadowOffset: {
      width: 1,
      height: 1,
    },
    elevation: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "MS Sans Serif, System",
  },

  tipIcon: {
    width: 16,
    height: 16,
    marginRight: 8,
    marginTop: 1,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 2,
    color: "#000",
    fontFamily: "MS Sans Serif, System",
  },
  tipText: {
    fontSize: 10,
    color: "#000",
    lineHeight: 12,
    fontFamily: "MS Sans Serif, System",
  },
  actionBar: {
    marginTop: "auto",
  },
  actionButton: {
    backgroundColor: "#c0c0c0",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: "#dfdfdf",
    borderTopColor: "#ffffff",
    borderLeftColor: "#ffffff",
    borderRightColor: "#808080",
    borderBottomColor: "#808080",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  actionText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 12,
    fontFamily: "MS Sans Serif, System",
  },
  cameraOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    zIndex: 1000,
    justifyContent: "center",
    alignItems: "center",
  },
  cameraContainer: {
    backgroundColor: "#c0c0c0",
    padding: 20,
    borderWidth: 2,
    borderColor: "#dfdfdf",
    borderTopColor: "#ffffff",
    borderLeftColor: "#ffffff",
    borderRightColor: "#808080",
    borderBottomColor: "#808080",
    width: "80%",
    maxWidth: 400,
  },
  cameraTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    fontFamily: "MS Sans Serif, System",
  },
  cameraPreview: {
    width: "100%",
    height: 300,
    backgroundColor: "#000",
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#000",
  },
  cameraControls: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  cameraButton: {
    backgroundColor: "#c0c0c0",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: "#dfdfdf",
    borderTopColor: "#ffffff",
    borderLeftColor: "#ffffff",
    borderRightColor: "#808080",
    borderBottomColor: "#808080",
  },
  cameraButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    fontFamily: "MS Sans Serif, System",
  },

  // Add these styles to windowStyles:

  // Tip and Background Removal Row
  tipAndBgRemoveRow: {
    flexDirection: "row",
    alignItems: "flex-start", // Align items to the top
    gap: 12,
    marginBottom: 20,
  },
  tipBox: {
    flex: 1,
    backgroundColor: "#ffffcc",
    borderWidth: 1,
    borderColor: "#000",
    padding: 12,
    minHeight: 60,
  },
  bgRemoveButton: {
    backgroundColor: "#c0c0c0",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: "#dfdfdf",
    borderTopColor: "#ffffff",
    borderLeftColor: "#ffffff",
    borderRightColor: "#808080",
    borderBottomColor: "#808080",
    minWidth: 100,
    flexShrink: 0,
  },
  bgRemoveContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  bgRemoveIcon: {
    width: 40,
    height: 40,
    marginBottom: 4,
  },
  bgRemoveText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 10,
    fontFamily: "MS Sans Serif, System",
    textAlign: "center",
  },
  bgRemoveButtonDisabled: {
    opacity: 0.6,
    backgroundColor: "#e0e0e0",
  },
});

export default AddItemWindow;
