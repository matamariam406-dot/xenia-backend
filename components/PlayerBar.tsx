import { View, Text, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAudio } from "../context/AudioContext";

export default function PlayerBar() {
  const { current, isPlaying, togglePlay, next } = useAudio();

  return (
    <View style={{
      position: "absolute",
      bottom: 0,
      width: "100%",
      backgroundColor: "#111",
      padding: 10,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center"
    }}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Image source={{ uri: current.cover }} style={{ width: 40, height: 40 }} />
        <View style={{ marginLeft: 10 }}>
          <Text style={{ color: "#fff" }}>{current.title}</Text>
          <Text style={{ color: "#aaa", fontSize: 12 }}>{current.artist}</Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", gap: 20 }}>
        <TouchableOpacity onPress={togglePlay}>
          <Ionicons name={isPlaying ? "pause" : "play"} size={28} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity onPress={next}>
          <Ionicons name="play-skip-forward" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
