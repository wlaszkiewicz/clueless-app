import { useState, useEffect } from "react";
import { WardrobeState, initialWardrobeState } from "../types/wardrobe";

export const useWardrobeStorage = () => {
  const [wardrobe, setWardrobe] = useState<WardrobeState>(initialWardrobeState);

  const saveWardrobe = (newWardrobe: WardrobeState) => {
    setWardrobe(newWardrobe);
    // Save to local storage
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("clueless-wardrobe", JSON.stringify(newWardrobe));
    }
  };

  const loadWardrobe = () => {
    if (typeof localStorage !== "undefined") {
      const saved = localStorage.getItem("clueless-wardrobe");
      if (saved) {
        setWardrobe(JSON.parse(saved));
      }
    }
  };

  useEffect(() => {
    loadWardrobe();
  }, []);

  return { wardrobe, saveWardrobe };
};
