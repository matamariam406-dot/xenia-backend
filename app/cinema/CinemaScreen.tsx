import { View } from "react-native";
import { Video } from "expo-av";

export default function CinemaScreen() {
  return (
    <View style={{ flex: 1 }}>
      <Video
        source={{ uri: "https://www.w3schools.com/html/mov_bbb.mp4" }}
        useNativeControls
        resizeMode="contain"
        shouldPlay
        style={{ flex: 1 }}
      />
    </View>
  );
}
