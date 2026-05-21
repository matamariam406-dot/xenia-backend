import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
  ScrollView,
  Dimensions,
  StatusBar,
  StyleSheet,
  Animated,
  Easing,
  SafeAreaView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import * as Speech from "expo-speech";
import * as Haptics from "expo-haptics";
import { Audio } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";

// Asegúrate de que esta ruta apunte correctamente a tu componente ChatBubble
import { ChatBubble } from "../src/components/ChatBubble";

const { width, height } = Dimensions.get("window");
const URL_BACKEND = "https://xenia-backend-r8if.onrender.com";

// --- TIPADOS ESTRICTOS ---
type Role = "user" | "assistant";
interface Msg {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
}

const STATUS_MESSAGES = [
  "DECODIFICANDO NEURAL-LINK...",
  "OPTIMIZANDO ENTROPÍA...",
  "CONECTANDO MATRIZ DE DATOS...",
  "SITEL: NIVEL CRÍTICO 100%",
  "XENIA ULTRA: ONLINE",
];

export default function XeniaUltraMaster() {
  const router = useRouter();

  // --- ESTADOS DE ALTA FRECUENCIA ---
  const [appState, setAppState] = useState<"launch" | "home" | "chat">("launch");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [systemStatus, setSystemStatus] = useState(STATUS_MESSAGES[0]);
  const [bootProgress, setBootProgress] = useState(0);

  // --- ESTADOS DE AUDIO ---
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isSTTProcessing, setIsSTTProcessing] = useState(false);

  // --- MOTORES DE ANIMACIÓN ---
  const flatListRef = useRef<FlatList>(null);
  const micScaleAnim = useRef(new Animated.Value(1)).current;
  const micOpacityAnim = useRef(new Animated.Value(1)).current;
  const cardsEntranceAnim = useRef(new Animated.Value(0)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;

  // --- LÓGICA DE LANZAMIENTO (BOOT SEQUENCE EXTREME) ---
  useEffect(() => {
    if (appState !== "launch") return;

    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      })
    ).start();

    const interval = setInterval(() => {
      setBootProgress((prev) => Math.min(prev + (Math.random() * 20), 100));
    }, 120);

    let i = 0;
    const statusInterval = setInterval(() => {
      i++;
      if (i < STATUS_MESSAGES.length) setSystemStatus(STATUS_MESSAGES[i]);
    }, 900);

    const timer = setTimeout(() => {
      clearInterval(statusInterval);
      clearInterval(interval);
      setAppState("home");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      Animated.spring(cardsEntranceAnim, {
        toValue: 1,
        tension: 50,
        friction: 6,
        useNativeDriver: true,
      }).start();
    }, 4500);

    return () => {
      clearInterval(interval);
      clearInterval(statusInterval);
      clearTimeout(timer);
    };
  }, [appState]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  // --- OPTIMIZACIÓN DE FUNCIONES (MEMOIZADAS) ---
  const triggerHaptic = useCallback((type: Haptics.ImpactFeedbackStyle) => {
    Haptics.impactAsync(type);
  }, []);

  const scrollToEnd = useCallback(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 200);
    }
  }, [messages.length]);

  const speak = useCallback((content: string) => {
    if (!content) return;
    Speech.stop();
    Speech.speak(content, { rate: 1.05, pitch: 1.0, language: "es-MX" });
  }, []);

  // --- SISTEMA DE AUDIO EXPERTO ---
  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== "granted") {
        Alert.alert("Acceso Restringido", "Xenia requiere acceso al micrófono para el enlace neuronal.");
        return;
      }

      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(newRecording);
      setIsRecording(true);
      triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);

      // Animación de pulso profundo
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(micScaleAnim, { toValue: 1.3, duration: 400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
            Animated.timing(micScaleAnim, { toValue: 1, duration: 400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(micOpacityAnim, { toValue: 0.5, duration: 400, useNativeDriver: true }),
            Animated.timing(micOpacityAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
          ])
        ])
      ).start();
    } catch (err) {
      console.error("Fallo Hardware Micrófono:", err);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    try {
      setIsRecording(false);
      micScaleAnim.stopAnimation();
      micOpacityAnim.stopAnimation();
      micScaleAnim.setValue(1);
      micOpacityAnim.setValue(1);

      await recording.stopAndUnloadAsync();
      setRecording(null);
      triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);

      setIsSTTProcessing(true);
      // Simulación STT -> Aquí irá tu conexión a Whisper/Google Cloud STT
      await new Promise((r) => setTimeout(r, 1800));
      setIsSTTProcessing(false);

      handleSend("He enviado un comando de voz encriptado. Respóndeme.", true);
    } catch (err) {
      Alert.alert("Interferencia", "Fallo al procesar la onda de audio.");
    }
  };

  // --- MOTOR DE RED (FETCH UNIFICADO) ---
  const fetchFromBackend = async (payloadMessages: object[]) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout
    
    try {
      const res = await fetch(URL_BACKEND, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: payloadMessages }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error(`HTTP_${res.status}`);
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        return json.reply || json.message || json.choices?.[0]?.message?.content || text;
      } catch {
        return text;
      }
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') return "⚠️ Error: El servidor tardó demasiado en responder.";
      throw error;
    }
  };

  const handleSend = async (userContentString: string = "", isFromAudio: boolean = false) => {
    const prompt = userContentString.trim() || text.trim();
    if (!prompt || loading) return;

    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    if (!isFromAudio) setText("");
    Keyboard.dismiss();

    const userMsg: Msg = { id: `u-${Date.now()}`, role: "user", content: prompt, timestamp: Date.now() };
    const assistantId = `a-${Date.now()}`;
    const assistantPlaceholder: Msg = { id: assistantId, role: "assistant", content: "...", timestamp: Date.now() };

    const currentHistory = [...messages.filter((m) => m.id !== "temp"), userMsg];
    setMessages([...currentHistory, assistantPlaceholder]);
    setLoading(true);
    scrollToEnd();

    try {
      const payloadMessages = currentHistory.map((m) => ({ role: m.role, content: m.content }));
      const finalContent = await fetchFromBackend(payloadMessages);
      
      setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: finalContent } : m)));
      speak(finalContent);
    } catch (e: any) {
      setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: "⚠️ NÚCLEO DESCONECTADO: " + e.message } : m)));
    } finally {
      setLoading(false);
      scrollToEnd();
    }
  };

  // --- COMPONENTES UI REUTILIZABLES ---
  const FeatureCard = useMemo(() => ({ title, icon, color, route }: { title: string, icon: string, color: string, route: any }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => { triggerHaptic(Haptics.ImpactFeedbackStyle.Light); if (route) router.push(route); }}
      style={styles.card}
    >
      <LinearGradient colors={[color + "20", "#0b1324"]} style={styles.cardGradientInner}>
        <View style={styles.cardHeaderRow}>
          <View style={[styles.iconContainer, { backgroundColor: color + "15", borderColor: color + "30" }]}>
            <Text style={{ fontSize: 26 }}>{icon}</Text>
          </View>
          <Ionicons name="arrow-forward" size={18} color="rgba(255,255,255,0.3)" />
        </View>
        <View>
          <Text style={styles.cardTitle}>{title}</Text>
          <View style={[styles.cardBadge, { backgroundColor: color + "20", borderColor: color + "50" }]}>
            <Text style={[styles.cardBadgeText, { color: color }]}>PRO SYSTEM</Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  ), [router, triggerHaptic]);

  // --- RENDER: 1. BOOT SEQUENCE ---
  if (appState === "launch") {
    return (
      <View style={styles.launchContainer}>
        <StatusBar hidden />
        <LinearGradient colors={["#000", "#050b14", "#000"]} style={styles.launchGradient}>
          <Animated.View style={{ transform: [{ rotate: spin }], marginBottom: 50 }}>
            <View style={styles.glowOrb} />
            <Text style={{ fontSize: 80 }}>⚡</Text>
          </Animated.View>
          <Text style={styles.heroTitle}>XENIA</Text>
          <Text style={[styles.heroTitle, { color: "#3b82f6", marginTop: -25, opacity: 0.9 }]}>ULTRA</Text>
          <View style={styles.launchStatusBox}>
            <Text style={styles.statusText}>{systemStatus}</Text>
            <View style={styles.progressBarBg}>
              <Animated.View style={[styles.progressBarFill, { width: `${bootProgress}%` }]} />
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  }

  // --- RENDER: 2. HOME HUB ---
  if (appState === "home") {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#020617" />
        <ImageBackground source={{ uri: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop" }} style={StyleSheet.absoluteFillObject} blurRadius={80} opacity={0.15} />
        
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.hero}>
              <View style={styles.tagContainer}>
                <View style={styles.onlineDotPulse} />
                <Text style={styles.systemTag}>OS v2.0 MASTER SUPREME</Text>
              </View>
              <Text style={styles.heroTitleSmall}>XENIA HUB</Text>
              <Text style={styles.heroSubText}>Conexión Neural Sincronizada al 100%.</Text>
            </View>

            <Animated.View style={[ styles.content, { opacity: cardsEntranceAnim, transform: [{ translateY: cardsEntranceAnim.interpolate({ inputRange: [0, 1], outputRange: [50, 0] }) }] } ]}>
              <Text style={styles.sectionTitle}>NÚCLEOS MULTIMEDIA</Text>
              <View style={styles.grid}>
                <FeatureCard title="Sonic HD" icon="🎵" color="#10b981" route="/music" />
                <FeatureCard title="Live Stream" icon="📺" color="#ef4444" route="/tv" />
                <FeatureCard title="Neural Games" icon="🎮" color="#8b5cf6" route="/games" />
                <FeatureCard title="Cinema IA" icon="🍿" color="#f59e0b" route="/cinema" />
              </View>

              <TouchableOpacity activeOpacity={0.9} onPress={() => setAppState("chat")} style={styles.mainBtn}>
                <LinearGradient start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} colors={["#2563eb", "#1e40af"]} style={styles.mainBtnGradient}>
                  <View>
                    <Text style={styles.mainBtnText}>DESPERTAR A XENIA</Text>
                    <Text style={styles.mainBtnSubText}>Asistente IA Integral</Text>
                  </View>
                  <View style={styles.actionCircle}>
                    <Text style={{ fontSize: 22 }}>⚡</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  // --- RENDER: 3. CHAT INTERFACE ---
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => { triggerHaptic(Haptics.ImpactFeedbackStyle.Light); setAppState("home"); }} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← VOLVER</Text>
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: "center", paddingRight: 30 }}>
            <Text style={styles.headerTitle}>XENIA TERMINAL</Text>
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}>
              <View style={[styles.onlineDot, { width: 6, height: 6, marginRight: 6 }]} />
              <Text style={styles.headerStatus}>CONEXIÓN CIFRADA SECRETA</Text>
            </View>
          </View>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ChatBubble item={item} />}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          onContentSizeChange={scrollToEnd}
          showsVerticalScrollIndicator={false}
        />

        {(loading || isSTTProcessing) && (
          <View style={styles.loadingIndicator}>
            <ActivityIndicator color={isSTTProcessing ? "#10b981" : "#3b82f6"} size="small" />
            <Text style={[styles.loadingText, isSTTProcessing && { color: "#10b981" }]}>
              {isSTTProcessing ? "TRANSCRIBIENDO AUDIO DE VOZ..." : "PROCESANDO SINAPSIS..."}
            </Text>
          </View>
        )}

        <View style={styles.inputArea}>
          <View style={styles.inputContainer}>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Inicia la transferencia de datos..."
              placeholderTextColor="#475569"
              style={styles.input}
              multiline
            />
            <TouchableOpacity onPressIn={startRecording} onPressOut={stopRecording} style={styles.micBtn} activeOpacity={1}>
              <Animated.View style={[ styles.micBtnInner, { backgroundColor: isRecording ? "rgba(239, 68, 68, 0.2)" : "transparent", transform: [{ scale: micScaleAnim }], opacity: micOpacityAnim } ]}>
                <Text style={{ fontSize: 22, opacity: isRecording ? 1 : 0.7 }}>{isRecording ? "🔴" : "🎙️"}</Text>
              </Animated.View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleSend("")} style={styles.sendBtn} disabled={text.trim().length === 0 && !loading}>
              <LinearGradient colors={text.trim().length > 0 ? ["#3b82f6", "#2563eb"] : ["#1e293b", "#0f172a"]} style={styles.sendBtnInner}>
                <Text style={{ color: text.trim().length > 0 ? "#fff" : "#475569", fontWeight: "900", fontSize: 18 }}>↑</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// --- ESTILOS MAESTROS (NEO-BRUTALISM & GLASSMORPHISM) ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020617" },
  launchContainer: { flex: 1, backgroundColor: "#000" },
  launchGradient: { flex: 1, justifyContent: "center", alignItems: "center" },
  glowOrb: { position: "absolute", width: 120, height: 120, backgroundColor: "rgba(59, 130, 246, 0.3)", borderRadius: 60, top: -15, left: -25, blurRadius: 40 },
  launchStatusBox: { width: "75%", marginTop: 60, alignItems: "center" },
  hero: { padding: 25, paddingTop: 50 },
  tagContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(59, 130, 246, 0.1)", alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 15, borderWidth: 1, borderColor: "rgba(59, 130, 246, 0.2)" },
  systemTag: { color: "#60a5fa", fontSize: 10, fontWeight: "900", letterSpacing: 1.5 },
  heroTitle: { color: "#fff", fontSize: 85, fontWeight: "900", textAlign: "center", letterSpacing: -2 },
  heroTitleSmall: { color: "#fff", fontSize: 46, fontWeight: "900", letterSpacing: -1 },
  heroSubText: { color: "#94a3b8", fontSize: 15, marginTop: 8, fontWeight: "500" },
  statusText: { color: "#64748b", fontSize: 11, marginBottom: 15, letterSpacing: 2, fontWeight: "700" },
  progressBarBg: { height: 3, width: "100%", backgroundColor: "#1e293b", borderRadius: 2, overflow: "hidden" },
  progressBarFill: { height: "100%", backgroundColor: "#3b82f6", borderRadius: 2 },
  content: { paddingHorizontal: 25, paddingBottom: 40 },
  sectionTitle: { color: "#475569", fontSize: 13, fontWeight: "900", marginBottom: 20, letterSpacing: 1.5 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  
  // Cartas Glassmorphism
  card: { width: width * 0.42, height: 170, borderRadius: 28, marginBottom: 20, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", backgroundColor: "rgba(15, 23, 42, 0.4)" },
  cardGradientInner: { flex: 1, padding: 18, justifyContent: "space-between" },
  cardHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  iconContainer: { width: 48, height: 48, borderRadius: 16, justifyContent: "center", alignItems: "center", borderWidth: 1 },
  cardTitle: { color: "#f8fafc", fontWeight: "800", fontSize: 16, marginBottom: 8 },
  cardBadge: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1 },
  cardBadgeText: { fontSize: 9, fontWeight: "900", letterSpacing: 0.5 },
  
  // Botón Principal
  mainBtn: { marginTop: 10, borderRadius: 28, overflow: "hidden", shadowColor: "#2563eb", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 },
  mainBtnGradient: { padding: 22, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  mainBtnText: { color: "#fff", fontWeight: "900", fontSize: 18, letterSpacing: 1, marginBottom: 4 },
  mainBtnSubText: { color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: "600" },
  actionCircle: { width: 46, height: 46, borderRadius: 23, backgroundColor: "rgba(255,255,255,0.15)", justifyContent: "center", alignItems: "center" },
  
  // Header Chat
  header: { paddingHorizontal: 20, paddingBottom: 15, paddingTop: 10, backgroundColor: "#020617", flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  backBtn: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: "rgba(30, 41, 59, 0.5)", borderRadius: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  backBtnText: { color: "#94a3b8", fontWeight: "800", fontSize: 11, letterSpacing: 0.5 },
  headerTitle: { color: "#fff", fontSize: 15, fontWeight: "900", letterSpacing: 1 },
  headerStatus: { color: "#10b981", fontSize: 9, fontWeight: "800", letterSpacing: 1 },
  onlineDot: { backgroundColor: "#10b981", borderRadius: 4 },
  onlineDotPulse: { width: 8, height: 8, backgroundColor: "#60a5fa", borderRadius: 4, marginRight: 8, shadowColor: "#60a5fa", shadowOpacity: 0.8, shadowRadius: 5 },
  
  // Chat Input Area
  loadingIndicator: { flexDirection: "row", alignItems: "center", paddingHorizontal: 25, paddingVertical: 10 },
  loadingText: { color: "#3b82f6", fontSize: 10, fontWeight: "900", marginLeft: 10, letterSpacing: 1.5 },
  inputArea: { padding: 15, paddingBottom: Platform.OS === "ios" ? 10 : 20, backgroundColor: "#020617", borderTopWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  inputContainer: { flexDirection: "row", alignItems: "flex-end", backgroundColor: "rgba(15, 23, 42, 0.6)", borderRadius: 24, padding: 6, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  input: { flex: 1, color: "#fff", paddingHorizontal: 15, paddingTop: 14, paddingBottom: 14, fontSize: 15, maxHeight: 120, minHeight: 48 },
  micBtn: { marginHorizontal: 2, marginBottom: 2 },
  micBtnInner: { width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center" },
  sendBtn: { borderRadius: 20, overflow: "hidden", marginBottom: 2, marginRight: 2 },
  sendBtnInner: { width: 44, height: 44, justifyContent: "center", alignItems: "center" },
});

