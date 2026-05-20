import { View, Text, TouchableOpacity } from "react-native";
import { useAudio } from "../../context/AudioContext"; //  Sube dos niveles hasta la raíz


export default function MiniPlayer({ onOpenPlayer }: any) {
  const { queue, currentIndex, isPlaying, pause, resume } = useAudio();

  const track = queue[currentIndex];
  if (!track) return null;

  return (
    <TouchableOpacity
      onPress={onOpenPlayer}
      style={{
        position: "absolute",
        bottom: 0,
        width: "100%",
        backgroundColor: "#111",
        padding: 15,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <View>
        <Text style={{ color: "#fff" }}>{track.title}</Text>
        <Text style={{ color: "#888", fontSize: 12 }}>
          {track.artist}
        </Text>
      </View>

      <TouchableOpacity onPress={isPlaying ? pause : resume}>
        <Text style={{ fontSize: 24 }}>
          {isPlaying ? "⏸️" : "▶️"}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}
