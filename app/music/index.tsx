import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator
} from "react-native";
import { useAudio } from "../../context/AudioContext";
import { useRouter } from "expo-router";

export default function MusicScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { playTrack } = useAudio();

  const searchMusic = async () => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    try {
      const res = await fetch(
        `https://xenia-backend-r8if.onrender.com/search?q=${encodeURIComponent(query)}`,
        {
          method: "GET",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            // Simula un navegador real para evadir bloqueos en Render
            "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36"
          }
        }
      );

      // Una sola declaración limpia del texto plano
      const rawText = await res.text();

      // Validación anti-HTML corporativo
      if (rawText.trim().startsWith("<!DOCTYPE") || rawText.trim().startsWith("<html")) {
        Alert.alert(
          "Aviso del Servidor", 
          "El backend está enviando una respuesta web en lugar de datos. Inténtalo de nuevo en unos segundos."
        );
        setIsLoading(false);
        return;
      }

      const data = JSON.parse(rawText);

      if (!data.videos || data.videos.length === 0) {
         Alert.alert("Sin resultados", "No se encontraron canciones.");
         setIsLoading(false);
         return;
      }

      const tracks = data.videos.map((v: any, index: number) => ({
        id: v.id || `track-${index}`,
        title: v.title,
        url: v.url, 
      }));

      setResults(tracks);

    } catch (error: any) {
      Alert.alert("Error de Conexión", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← ESC</Text>
        </TouchableOpacity>
        <Text style={styles.title}>BÚSQUEDA SONIC HD</Text>
      </View>

      <View style={{ padding: 20, flex: 1 }}>
        <TextInput
          placeholder="Buscar canción..."
          placeholderTextColor="#666"
          value={query}
          onChangeText={setQuery}
          style={styles.input}
        />

        <TouchableOpacity onPress={searchMusic} style={styles.searchBtn} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Buscar</Text>}
        </TouchableOpacity>

        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={styles.trackItem}
              onPress={() => playTrack(item, index, results)}
            >
              <Text style={{ color: "#fff", fontWeight: "600" }}>{item.title}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020617" },
  header: { padding: 20, paddingTop: 40, borderBottomWidth: 1, borderColor: "#1e293b", backgroundColor: "#0f172a" },
  backBtn: { padding: 8, backgroundColor: "#1e293b", borderRadius: 10, alignSelf: "flex-start", marginBottom: 10 },
  backBtnText: { color: "#3b82f6", fontWeight: "900", fontSize: 12 },
  title: { color: "#fff", fontSize: 18, fontWeight: "900" },
  input: { backgroundColor: "#1e293b", color: "#fff", padding: 15, borderRadius: 10, marginBottom: 10 },
  searchBtn: { backgroundColor: "#3b82f6", padding: 15, borderRadius: 10, alignItems: "center", marginBottom: 20 },
  btnText: { color: "#fff", fontWeight: "bold" },
  trackItem: { backgroundColor: "#0f172a", padding: 15, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: "#1e293b" }
});

