import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  SafeAreaView
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

const { width } = Dimensions.get("window");

// Datos de prueba premium (Listos para ser reemplazados por tu backend real)
const TRACKS = [
  {
    id: 1,
    title: "Ecos del Mañana",
    artist: "Dorian",
    cover: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=800",
    duration: "4:20"
  },
  {
    id: 2,
    title: "Horizonte Digital",
    artist: "Neon Atlas",
    cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800",
    duration: "3:45"
  },
];

export default function MusicApp() {
  const [current, setCurrent] = useState(TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [repeatMode, setRepeatMode] = useState(0); // 0: off, 1: all, 2: one

  const triggerHaptic = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

  const togglePlay = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    triggerHaptic();
    const index = TRACKS.findIndex((t) => t.id === current.id);
    setCurrent(TRACKS[(index + 1) % TRACKS.length]);
  };

  const prevTrack = () => {
    triggerHaptic();
    const index = TRACKS.findIndex((t) => t.id === current.id);
    setCurrent(TRACKS[(index - 1 + TRACKS.length) % TRACKS.length]);
  };

  const toggleRepeat = () => {
    triggerHaptic();
    setRepeatMode((prev) => (prev + 1) % 3);
  };

  return (
    <View style={styles.container}>
      {/* Fondo inmersivo dinámico */}
      <Image source={{ uri: current.cover }} style={styles.bgImage} blurRadius={80} />
      <LinearGradient colors={["rgba(0,0,0,0.4)", "rgba(0,0,0,0.9)", "#000"]} style={styles.gradientOverlay} />

      <SafeAreaView style={styles.safeArea}>
        {/* Cabecera Superior */}
        <View style={styles.header}>
          <TouchableOpacity onPress={triggerHaptic}>
            <Ionicons name="chevron-down" size={32} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.playingFrom}>REPRODUCIENDO DESDE BÚSQUEDA</Text>
            <Text style={styles.playlistName}>Xenia Ultra Mix</Text>
          </View>
          <TouchableOpacity onPress={triggerHaptic}>
            <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Zona del Arte del Álbum */}
        <View style={styles.artworkContainer}>
          <Image source={{ uri: current.cover }} style={styles.artwork} />
        </View>

        {/* Información de la Pista y Botón de Corazón */}
        <View style={styles.trackInfoRow}>
          <View style={styles.trackTextContainer}>
            <Text style={styles.trackTitle} numberOfLines={1}>{current.title}</Text>
            <Text style={styles.trackArtist} numberOfLines={1}>{current.artist}</Text>
          </View>
          <TouchableOpacity onPress={() => { triggerHaptic(); setIsLiked(!isLiked); }}>
            <Ionicons name={isLiked ? "heart" : "heart-outline"} size={30} color={isLiked ? "#10b981" : "#fff"} />
          </TouchableOpacity>
        </View>

        {/* Barra de Progreso y Tiempos */}
        <View style={styles.progressContainer}>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={100}
            value={isPlaying ? 45 : 0} // Valor estático para visualización, conecta tu estado real aquí
            minimumTrackTintColor="#fff"
            maximumTrackTintColor="rgba(255,255,255,0.2)"
            thumbTintColor="#fff"
          />
          <View style={styles.timeRow}>
            <Text style={styles.timeText}>1:53</Text>
            <Text style={styles.timeText}>{current.duration}</Text>
          </View>
        </View>

        {/* Controles Maestros de Reproducción */}
        <View style={styles.mainControls}>
          <TouchableOpacity onPress={() => { triggerHaptic(); /* Lógica Shuffle */ }}>
            <Ionicons name="shuffle" size={28} color="rgba(255,255,255,0.5)" />
          </TouchableOpacity>

          <TouchableOpacity onPress={prevTrack}>
            <Ionicons name="play-skip-back" size={40} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.playPauseBtn} onPress={togglePlay}>
            <Ionicons name={isPlaying ? "pause" : "play"} size={40} color="#000" style={{ marginLeft: isPlaying ? 0 : 4 }} />
          </TouchableOpacity>

          <TouchableOpacity onPress={nextTrack}>
            <Ionicons name="play-skip-forward" size={40} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleRepeat}>
            <MaterialIcons 
              name={repeatMode === 2 ? "repeat-one" : "repeat"} 
              size={28} 
              color={repeatMode === 0 ? "rgba(255,255,255,0.5)" : "#10b981"} 
            />
          </TouchableOpacity>
        </View>

        {/* Controles Inferiores (Letras / Dispositivos) */}
        <View style={styles.bottomControls}>
          <TouchableOpacity onPress={triggerHaptic}>
            <MaterialIcons name="speaker" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={triggerHaptic} style={styles.lyricsBtn}>
            <Text style={styles.lyricsText}>LETRAS</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={triggerHaptic}>
            <MaterialIcons name="queue-music" size={26} color="#fff" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  bgImage: { position: "absolute", width: "100%", height: "100%", opacity: 0.6 },
  gradientOverlay: { position: "absolute", width: "100%", height: "100%" },
  safeArea: { flex: 1, justifyContent: "space-between", paddingHorizontal: 25, paddingBottom: 20 },
  
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 20 },
  headerTextContainer: { alignItems: "center" },
  playingFrom: { color: "rgba(255,255,255,0.6)", fontSize: 10, fontWeight: "800", letterSpacing: 1.5, marginBottom: 2 },
  playlistName: { color: "#fff", fontSize: 14, fontWeight: "700" },
  
  artworkContainer: { width: width - 50, height: width - 50, alignSelf: "center", marginTop: 30, elevation: 15, shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 20 },
  artwork: { width: "100%", height: "100%", borderRadius: 12 },
  
  trackInfoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 30 },
  trackTextContainer: { flex: 1, paddingRight: 20 },
  trackTitle: { color: "#fff", fontSize: 28, fontWeight: "bold", marginBottom: 5 },
  trackArtist: { color: "rgba(255,255,255,0.7)", fontSize: 18, fontWeight: "500" },
  
  progressContainer: { marginTop: 20 },
  slider: { width: "100%", height: 40, marginHorizontal: -15 },
  timeRow: { flexDirection: "row", justifyContent: "space-between", marginTop: -10 },
  timeText: { color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: "600", fontVariant: ["tabular-nums"] },
  
  mainControls: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: 20 },
  playPauseBtn: { width: 72, height: 72, borderRadius: 36, backgroundColor: "#10b981", justifyContent: "center", alignItems: "center" },
  
  bottomControls: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 10 },
  lyricsBtn: { paddingHorizontal: 15, paddingVertical: 6, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" },
  lyricsText: { color: "#fff", fontSize: 12, fontWeight: "800", letterSpacing: 1 }
});

