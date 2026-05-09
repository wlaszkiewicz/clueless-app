import React from "react";
import { View, Text, Image } from "react-native";
import type { ImageSourcePropType } from "react-native";
import { styles, previewStatText } from "./MobilePreview.styles";
export { previewStatText };

interface MobilePreviewProps {
  icon: ImageSourcePropType;
  title: string;
  text: string;
  children?: React.ReactNode;
}

const MobilePreview: React.FC<MobilePreviewProps> = ({
  icon,
  title,
  text,
  children,
}) => (
  <View style={styles.container}>
    <Image source={icon} style={styles.icon} />
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.text}>{text}</Text>
    {children && <View style={styles.statsRow}>{children}</View>}
  </View>
);



export default MobilePreview;
