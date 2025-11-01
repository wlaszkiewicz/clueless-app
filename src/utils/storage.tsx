import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
export interface WardrobeItem {
  id: string;
  name: string;
  category: string;
  imageUri: string;
  tags: string[];
  createdAt: string;
  hasBackgroundRemoved?: boolean;
  placedIn?: string; // 'wardrobe', 'hanger', 'shoeShelf', 'jewelryBox', 'floor'
  position?: { x: number; y: number };
  isVisible?: boolean;
  customSize?: { width: number; height: number };
}

const OUTFITS_KEY = "clueless_outfits";

export interface Outfit {
  id: string;
  name: string;
  items: OutfitItem[];
  backgroundColor: string;
  createdAt: string;
  category?: string;
}

export interface OutfitItem {
  itemId: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

class WardrobeStorage {
  private readonly STORAGE_KEY = "clueless_wardrobe";

  async saveItem(item: WardrobeItem): Promise<void> {
    try {
      console.log("💾 Saving item:", item.name);
      const existing = await this.getItems();
      const updated = [...existing, item];
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
      console.log("✅ Item saved successfully! Total items:", updated.length);
    } catch (error) {
      console.error("❌ Failed to save item:", error);
      throw error;
    }
  }

  async getItems(): Promise<WardrobeItem[]> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEY);
      const items = data ? JSON.parse(data) : [];
      console.log("📂 Loaded items from storage:", items.length);
      return items;
    } catch (error) {
      console.error("❌ Failed to get items:", error);
      return [];
    }
  }

  async deleteItem(itemId: string): Promise<void> {
    try {
      const existing = await this.getItems();
      const updated = existing.filter((item) => item.id !== itemId);
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
      console.log("🗑️ Item deleted:", itemId);
    } catch (error) {
      console.error("❌ Failed to delete item:", error);
      throw error;
    }
  }

  async updateItemCategory(itemId: string, category: string): Promise<void> {
    try {
      const existing = await this.getItems();
      const updated = existing.map((item) =>
        item.id === itemId ? { ...item, category } : item
      );
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
      console.log("🔄 Item category updated:", itemId, "->", category);
    } catch (error) {
      console.error("❌ Failed to update item category:", error);
      throw error;
    }
  }

  async updateItems(items: WardrobeItem[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
      console.log("💾 All items updated. Total:", items.length);
    } catch (error) {
      console.error("❌ Failed to update items:", error);
      throw error;
    }
  }

  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.STORAGE_KEY);
      console.log("🧹 All wardrobe data cleared");
    } catch (error) {
      console.error("❌ Failed to clear storage:", error);
      throw error;
    }
  }

  async getStorageInfo(): Promise<{ count: number; size: number }> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEY);
      return {
        count: data ? JSON.parse(data).length : 0,
        size: data ? data.length : 0,
      };
    } catch (error) {
      console.error("❌ Failed to get storage info:", error);
      return { count: 0, size: 0 };
    }
  }

  async saveOutfit(outfit: Outfit): Promise<void> {
    try {
      const outfits = await this.getOutfits();
      const existingIndex = outfits.findIndex((o) => o.id === outfit.id);

      if (existingIndex >= 0) {
        outfits[existingIndex] = outfit;
      } else {
        outfits.push(outfit);
      }

      await AsyncStorage.setItem(OUTFITS_KEY, JSON.stringify(outfits));
    } catch (error) {
      console.error("Error saving outfit:", error);
      throw error;
    }
  }

  async getOutfits(): Promise<Outfit[]> {
    try {
      const outfitsJson = await AsyncStorage.getItem(OUTFITS_KEY);
      return outfitsJson ? JSON.parse(outfitsJson) : [];
    } catch (error) {
      console.error("Error loading outfits:", error);
      return [];
    }
  }

  async deleteOutfit(outfitId: string): Promise<void> {
    try {
      const outfits = await this.getOutfits();
      const filteredOutfits = outfits.filter((o) => o.id !== outfitId);
      await AsyncStorage.setItem(OUTFITS_KEY, JSON.stringify(filteredOutfits));
    } catch (error) {
      console.error("Error deleting outfit:", error);
      throw error;
    }
  }
}

export const wardrobeStorage = new WardrobeStorage();
