export interface WardrobeItem {
  id: string;
  name: string;
  category: string;
  imageUri: string;
  tags: string[];
  createdAt: string;
}

export interface WardrobeState {
  categories: string[];
  items: WardrobeItem[];
  uncategorizedItems: WardrobeItem[];
}

export const initialWardrobeState: WardrobeState = {
  categories: [
    "Tops",
    "Bottoms",
    "Dresses",
    "Shoes",
    "Accessories",
    "Outerwear",
  ],
  items: [],
  uncategorizedItems: [],
};
