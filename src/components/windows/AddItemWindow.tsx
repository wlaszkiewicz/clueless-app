import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { wardrobeStorage, WardrobeItem } from "../../utils/storage";
import { ImageStorage } from "../../utils/imageStorage";
import { BackgroundRemovalService } from "../../utils/bgremoval";
import MobilePreview, { previewStatText } from "./MobilePreview";
import { iconStyles, windowStyles } from "./AddItemWindow.styles";

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
            style={windowStyles.previewImagePlaceholder}
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
              <Text style={windowStyles.categoryText}>
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

  if (isMobile && !isFullscreen) {
    return (
      <MobilePreview
        icon={require("../../assets/icons/add.png")}
        title="Add Item"
        text={"Add new items to your wardrobe\n• Take photos\n• Upload images\n• Categorize items"}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-around", width: "100%" }}>
          <Text style={previewStatText.base}>Camera</Text>
          <Text style={previewStatText.base}>Gallery</Text>
        </View>
      </MobilePreview>
    );
  }

  return fullContent;
};



export default AddItemWindow;
