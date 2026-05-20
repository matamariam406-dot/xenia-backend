import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useAudio } from "../context/AudioContext";

export default function MiniPlayer() {
  // 1. Aquí traemos pause y resume en lugar de toggle
  const { queue, currentIndex, isPlaying, pause, resume } = useAudio();

  const track = queue[currentIndex];
  if (!track) return null;

  return (
    <View
      style={{
        position: "absolute",
        bottom: 0,
        width: "100%",
        backgroundColor: "#111",
        padding: 15,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center", // Para centrar el botón con el texto
        borderTopWidth: 1,
        borderColor: "#333"
      }}
    >
      <Text style={{ color: "#fff", fontWeight: "bold" }}>{track.title || "Pista Desconocida"}</Text>

      {/* 2. Aquí ejecutamos pause o resume dependiendo de si está sonando */}
      <TouchableOpacity onPress={isPlaying ? pause : resume}>
        <Text style={{ color: "#fff", fontSize: 24 }}>
          {isPlaying ? "⏸️" : "▶️"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

