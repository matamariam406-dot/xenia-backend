import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Animated,
  Keyboard,
  Image
} from "react-native";
import { useAudio } from "../../context/AudioContext";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";

export default function MusicScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { playTrack } = useAudio();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const searchMusic = async () => {
    if (!query.trim()) return;
    Keyboard.dismiss();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);
    setResults([]);

    try {
      // AQUÍ VA TU NUEVA URL DE RENDER (Ej: https://xenia-backend-xyz.onrender.com)
      const BACKEND_URL = "https://xenia-backend-r8if.onrender.com";
      
      const res = await fetch(
        `${BACKEND_URL}/search?q=${encodeURIComponent(query)}`,
        {
          method: "GET",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36"
          }
        }
      );

      const rawText = await res.text();

      if (rawText.trim().startsWith("<!DOCTYPE") || rawText.trim().startsWith("<html")) {
        throw new Error("El servidor está reiniciándose. Intenta en 30 segundos.");
      }

      const data = JSON.parse(rawText);

      if (!data.videos || data.videos.length === 0) {
         Alert.alert("Espectro Vacío", "No se encontraron frecuencias para tu búsqueda.");
         setIsLoading(false);
         return;
      }

      const tracks = data.videos.map((v: any, index: number) => ({
        id: v.id || `track-${Date.now()}-${index}`,
        title: v.title,
        url: v.url,
        cover: v.thumbnail || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500", // Fallback cover
        artist: v.author || "Artista Desconocido",
      }));

      setResults(tracks);
      
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();

    } catch (error: any) {
      Alert.alert("Fallo de Enlace Neural", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlay = (item: any, index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    playTrack(item, index, results);
  };

  return (
    <LinearGradient colors={["#020617", "#0f172a", "#020617"]} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="chevron-down" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>SONIC HD SEARCH</Text>
          <View style={{ width: 28 }} />
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.inputWrapper}>
            <Ionicons name="search" size={20} color="#64748b" style={styles.searchIcon} />
            <TextInput
              placeholder="Artistas, canciones o podcasts..."
              placeholderTextColor="#64748b"
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={searchMusic}
              style={styles.input}
              returnKeyType="search"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery("")}>
                <Ionicons name="close-circle" size={20} color="#64748b" />
              </TouchableOpacity>
            )}
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
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => (
              <TouchableOpacity style={styles.trackCard} onPress={() => handlePlay(item, index)}>
                <Image source={{ uri: item.cover }} style={styles.trackImage} />
                <View style={styles.trackInfo}>
                  <Text style={styles.trackTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.trackArtist} numberOfLines={1}>{item.artist}</Text>
                </View>
                <Ionicons name="play-circle" size={32} color="#3b82f6" />
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
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
  iconBtn: { padding: 5 },
  title: { color: "#fff", fontSize: 14, fontWeight: "900", letterSpacing: 2 },
  searchContainer: { paddingHorizontal: 20, paddingBottom: 20 },
  inputWrapper: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(30, 41, 59, 0.7)", borderRadius: 16, paddingHorizontal: 15, height: 55, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  searchIcon: { marginRight: 10 },
  input: { flex: 1, color: "#fff", fontSize: 16, height: "100%" },
  centerStage: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { color: "#64748b", marginTop: 15, fontSize: 14, fontWeight: "600", letterSpacing: 1 },
  listContainer: { paddingHorizontal: 20, paddingBottom: 100 },
  trackCard: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(15, 23, 42, 0.6)", padding: 12, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  trackImage: { width: 50, height: 50, borderRadius: 10, backgroundColor: "#1e293b" },
  trackInfo: { flex: 1, marginLeft: 15, marginRight: 10 },
  trackTitle: { color: "#fff", fontSize: 16, fontWeight: "700", marginBottom: 4 },
  trackArtist: { color: "#94a3b8", fontSize: 13, fontWeight: "500" }
});

