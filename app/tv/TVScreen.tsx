import { View } from "react-native";
import { Video } from "expo-av";

export default function TVScreen() {
  return (
    <View style={{ flex: 1 }}>
      <Video
        source={{ uri: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" }}
        shouldPlay
        style={{ flex: 1 }}
      />
    </View>
  );
}
