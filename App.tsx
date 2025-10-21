import React from "react";
import WindowsDesktop from "./src/WindowsDesktop";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function App() {
  return (
    <SafeAreaProvider>
      <WindowsDesktop />
    </SafeAreaProvider>
  );
}
