// Create a new file: utils/WardrobeStorage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface ClothingItem {
  id: string;
  name: string;
  category: string;
  imageUri: string;
  tags: string[];
  createdAt: string;
  isCategorized: boolean;
}

export interface WardrobeState {
  items: ClothingItem[];
  categories: string[];
}

const STORAGE_KEY = "clueless_wardrobe_data";

// Default categories with pixel-art style names
export const DEFAULT_CATEGORIES = [
  "👕 TOPS",
  "👖 BOTTOMS",
  "👗 DRESSES",
  "🧥 OUTERWEAR",
  "👟 SHOES",
  "👜 ACCESSORIES",
  "💎 JEWELRY",
];

export const WardrobeStorage = {
  // Save wardrobe data
  async saveWardrobe(data: WardrobeState): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Failed to save wardrobe:", error);
    }
  },

  // Load wardrobe data
  async loadWardrobe(): Promise<WardrobeState> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error("Failed to load wardrobe:", error);
    }

    // Return default state if no data exists
    return {
      items: [],
      categories: DEFAULT_CATEGORIES,
    };
  },

  // Add new item
  async addItem(item: Omit<ClothingItem, "id" | "createdAt">): Promise<string> {
    const wardrobe = await this.loadWardrobe();
    const newItem: ClothingItem = {
      ...item,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    wardrobe.items.push(newItem);
    await this.saveWardrobe(wardrobe);
    return newItem.id;
  },

  // Update item category
  async updateItemCategory(itemId: string, category: string): Promise<void> {
    const wardrobe = await this.loadWardrobe();
    const itemIndex = wardrobe.items.findIndex((item) => item.id === itemId);

    if (itemIndex !== -1) {
      wardrobe.items[itemIndex].category = category;
      wardrobe.items[itemIndex].isCategorized = true;
      await this.saveWardrobe(wardrobe);
    }
  },

  // Remove item
  async removeItem(itemId: string): Promise<void> {
    const wardrobe = await this.loadWardrobe();
    wardrobe.items = wardrobe.items.filter((item) => item.id !== itemId);
    await this.saveWardrobe(wardrobe);
  },
};
