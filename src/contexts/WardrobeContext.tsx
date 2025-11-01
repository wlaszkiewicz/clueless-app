import React, { createContext, useContext, useState, useEffect } from "react";
import { wardrobeStorage, WardrobeItem } from "../utils/storage";

interface WardrobeContextType {
  items: WardrobeItem[];
  addItem: (item: Omit<WardrobeItem, "id" | "createdAt">) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  updateItem: (id: string, updates: Partial<WardrobeItem>) => Promise<void>;
  loading: boolean;
}

const WardrobeContext = createContext<WardrobeContextType | undefined>(
  undefined
);

export const WardrobeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const storedItems = await wardrobeStorage.getItems();
      setItems(storedItems);
    } catch (error) {
      console.error("Failed to load wardrobe items:", error);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (itemData: Omit<WardrobeItem, "id" | "createdAt">) => {
    const newItem: WardrobeItem = {
      ...itemData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    await wardrobeStorage.saveItem(newItem);
    setItems((prev) => [...prev, newItem]);
  };

  const deleteItem = async (id: string) => {
    await wardrobeStorage.deleteItem(id);
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateItem = async (id: string, updates: Partial<WardrobeItem>) => {
    const updatedItems = items.map((item) =>
      item.id === id ? { ...item, ...updates } : item
    );
    setItems(updatedItems);
  };

  return (
    <WardrobeContext.Provider
      value={{ items, addItem, deleteItem, updateItem, loading }}
    >
      {children}
    </WardrobeContext.Provider>
  );
};

export const useWardrobe = () => {
  const context = useContext(WardrobeContext);
  if (context === undefined) {
    throw new Error("useWardrobe must be used within a WardrobeProvider");
  }
  return context;
};
