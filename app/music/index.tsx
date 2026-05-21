import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Animated,
  Keyboard,
  Image,
  Platform,
  ActivityIndicator
} from "react-native";
import { useAudio } from "../../context/AudioContext";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

export default function MusicScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { playTrack } = useAudio();

  const fadeAnim = useRef(new Animated.Value(1)).current;

  const triggerHaptic = useCallback((type: Haptics.ImpactFeedbackStyle) => {
    if (Platform.OS !== "web") Haptics.impactAsync(type);
  }, []);

  const displayAlert = (title: string, message: string) => {
    if (Platform.OS === "web") {
      alert(`${title}: ${message}`);
    } else {
      const { Alert } = require("react-native");
      Alert.alert(title, message);
    }
  };

  const searchMusic = async () => {
    if (!query.trim()) return;
    Keyboard.dismiss();
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);
    setResults([]);

    try {
      const BACKEND_URL = "https://xenia-backend-r8if.onrender.com";

      const res = await fetch(
        `${BACKEND_URL}/search?q=${encodeURIComponent(query.trim())}`,
        {
          method: "GET",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
          }
        }
      );

      const data = await res.json();

      const videos = data.videos || [];

      if (videos.length === 0) {
         displayAlert("Espectro Vacío", "No se encontraron frecuencias para tu búsqueda en este momento.");
         setIsLoading(false);
         return;
      }

      const tracks = videos.map((v: any, index: number) => ({
        id: v.id || `track-${Date.now()}-${index}`,
        title: v.title || "Frecuencia de Audio",
        url: `${BACKEND_URL}/download?id=${v.id}`,
        cover: v.cover || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500",
        artist: v.artist || "System Stream",
      }));

      setResults(tracks);
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: Platform.OS !== "web",
      }).start();

    } catch (error: any) {
      console.error("Error detectado en Sonic HD:", error);
      displayAlert("Fallo de Enlace Neural", "Error de comunicación con el núcleo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlay = (item: any, index: number) => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    if (playTrack) {
      playTrack(item, index, results);
    } else {
      displayAlert("Error de Audio", "El módulo reproductor principal no está inicializado.");
    }
  };

  return (
    <LinearGradient colors={["#020617", "#090f24", "#020617"]} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <Text style={{ fontSize: 24, color: "#fff" }}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.title}>BÚSQUEDA SONIC HD</Text>
          <View style={{ width: 28 }} />
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.inputWrapper}>
            <Text style={{ fontSize: 18, marginRight: 10, opacity: 0.6 }}>🔍</Text>
            <TextInput
              placeholder="Artistas, canciones o podcasts..."
              placeholderTextColor="#475569"
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={searchMusic}
              style={styles.input}
              returnKeyType="search"
            />
          </View>
        </View>

        {isLoading ? (
          <View style={styles.centerStage}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={styles.loadingText}>Sincronizando frecuencias...</Text>
          </View>
        ) : (
          <Animated.FlatList
            data={results}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            style={{ opacity: fadeAnim }}
            renderItem={({ item, index }) => (
              <TouchableOpacity style={styles.trackCard} onPress={() => handlePlay(item, index)} activeOpacity={0.8}>
                <Image source={{ uri: item.cover }} style={styles.trackImage} />
                <View style={styles.trackInfo}>
                  <Text style={styles.trackTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.trackArtist} numberOfLines={1}>{item.artist}</Text>
                </View>
                <View style={styles.playCircle}>
                  <Text style={{ fontSize: 14, color: "#3b82f6" }}>▶</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 15, paddingBottom: 15 },
  iconBtn: { padding: 5, width: 32, alignItems: "center" },
  title: { color: "#fff", fontSize: 13, fontWeight: "900", letterSpacing: 2 },
  searchContainer: { paddingHorizontal: 20, paddingBottom: 15 },
  inputWrapper: { flexDirection: "row", alignItems: "center", backgroundColor: "#0f172a", borderRadius: 18, paddingHorizontal: 15, height: 54, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  input: { flex: 1, color: "#fff", fontSize: 15, height: "100%" },
  centerStage: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 40 },
  loadingText: { color: "#64748b", marginTop: 15, fontSize: 13, fontWeight: "700", letterSpacing: 1 },
  listContainer: { paddingHorizontal: 20, paddingBottom: 80 },
  trackCard: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(15, 23, 42, 0.5)", padding: 10, borderRadius: 18, marginBottom: 10, borderWidth: 1, borderColor: "rgba(255,255,255,0.04)" },
  trackImage: { width: 48, height: 48, borderRadius: 12, backgroundColor: "#1e293b" },
  trackInfo: { flex: 1, marginLeft: 12, marginRight: 10 },
  trackTitle: { color: "#f8fafc", fontSize: 15, fontWeight: "700", marginBottom: 3 },
  trackArtist: { color: "#64748b", fontSize: 12, fontWeight: "500" },
  playCircle: { width: 34, height: 34, borderRadius: 17, backgroundColor: "rgba(59, 130, 246, 0.1)", justifyContent: "center", alignItems: "center" }
});

