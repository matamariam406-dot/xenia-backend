import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

const TRACKS = [
  {
    id: 1,
    title: "Ecos del Mañana",
    artist: "Dorian",
    cover:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
  },
  {
    id: 2,
    title: "Horizonte",
    artist: "Neon Atlas",
    cover:
      "https://images.unsplash.com/photo-1492724441997-5dc865305da7",
  },
];

export default function MusicApp() {
  const [current, setCurrent] = useState(TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const nextTrack = () => {
    const index = TRACKS.findIndex((t) => t.id === current.id);
    const next = TRACKS[(index + 1) % TRACKS.length];
    setCurrent(next);
  };

  const prevTrack = () => {
    const index = TRACKS.findIndex((t) => t.id === current.id);
    const prev =
      TRACKS[(index - 1 + TRACKS.length) % TRACKS.length];
    setCurrent(prev);
  };

  return (
    <View style={styles.container}>
      {/* 🔥 MAIN */}
      <ScrollView style={styles.main}>
        {/* HEADER */}
        <LinearGradient
          colors={["#1a0f3c", "#0a0a0a"]}
          style={styles.header}
        >
          <Text style={styles.albumTitle}>Ecos del Mañana</Text>
          <Text style={styles.artist}>{current.artist}</Text>

          <TouchableOpacity
            style={styles.playBtn}
            onPress={togglePlay}
          >
            <Text style={{ color: "#fff" }}>
              {isPlaying ? "Pausar" : "Reproducir"}
            </Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* 🔥 CARDS */}
        <Text style={styles.section}>Hecho para ti</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {TRACKS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              onPress={() => setCurrent(item)}
            >
              <Image source={{ uri: item.cover }} style={styles.cardImg} />
              <Text style={styles.cardText}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ScrollView>

      {/* 🔥 NOW PLAYING SIDE */}
      <View style={styles.side}>
        <Image source={{ uri: current.cover }} style={styles.sideImg} />
        <Text style={styles.sideTitle}>{current.title}</Text>
        <Text style={styles.sideArtist}>{current.artist}</Text>
      </View>

      {/* 🔥 PLAYER */}
      <View style={styles.player}>
        <View style={styles.playerInfo}>
          <Image source={{ uri: current.cover }} style={styles.miniCover} />
          <View>
            <Text style={styles.playerTitle}>{current.title}</Text>
            <Text style={styles.playerArtist}>{current.artist}</Text>
          </View>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity onPress={prevTrack}>
            <Ionicons name="play-skip-back" size={24} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity onPress={togglePlay}>
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={32}
              color="#fff"
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={nextTrack}>
            <Ionicons name="play-skip-forward" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <Slider
          style={{ width: 100 }}
          minimumValue={0}
          maximumValue={100}
          minimumTrackTintColor="#8b5cf6"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a" },

  main: { flex: 1, padding: 20 },

  header: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
  },

  albumTitle: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "bold",
  },

  artist: { color: "#aaa", marginBottom: 10 },

  playBtn: {
    backgroundColor: "#7c3aed",
    padding: 10,
    borderRadius: 10,
    width: 120,
  },

  section: {
    color: "#fff",
    fontSize: 18,
    marginBottom: 10,
  },

  card: { marginRight: 15 },
  cardImg: {
    width: 120,
    height: 120,
    borderRadius: 15,
  },
  cardText: { color: "#fff", marginTop: 5 },

  side: {
    position: "absolute",
    right: 10,
    top: 100,
    width: 140,
    alignItems: "center",
  },

  sideImg: {
    width: 120,
    height: 120,
    borderRadius: 15,
  },

  sideTitle: { color: "#fff", marginTop: 10 },
  sideArtist: { color: "#aaa" },

  player: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#111",
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  playerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },

  miniCover: {
    width: 40,
    height: 40,
    marginRight: 10,
  },

  playerTitle: { color: "#fff" },
  playerArtist: { color: "#aaa", fontSize: 12 },

  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
});
