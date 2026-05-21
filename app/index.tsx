import React, { useRef, useState, useEffect, useCallback, memo } from "react";
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
  SafeAreaView
} from "react-native";
import { useRouter } from "expo-router";
import * as Speech from "expo-speech";
import * as Haptics from "expo-haptics";
import { Audio } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { ChatBubble } from "../src/components/ChatBubble";

const { width } = Dimensions.get("window");
const URL_BACKEND = "https://xenia-backend-r8if.onrender.com/chat";



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
  "XENIA ULTRA: ONLINE",
];

// 🚀 FEATURE CARD CORREGIDA: Declarada externamente para evitar White Screen en Web
const FeatureCard = memo(({ title, icon, color, onPress }: { title: string, icon: string, color: string, onPress: () => void }) => (
  <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={styles.card}>
    <LinearGradient colors={[color + "15", "#0f172a"]} style={styles.cardGradientInner}>
      <View style={styles.cardHeaderRow}>
        <View style={[styles.iconContainer, { backgroundColor: color + "10", borderColor: color + "25" }]}>
          <Text style={{ fontSize: 24 }}>{icon}</Text>
        </View>
        <Text style={{ color: "rgba(255,255,255,0.2)", fontSize: 14 }}>→</Text>
      </View>
      <View>
        <Text style={styles.cardTitle}>{title}</Text>
        <View style={[styles.cardBadge, { backgroundColor: color + "15", borderColor: color + "40" }]}>
          <Text style={[styles.cardBadgeText, { color: color }]}>PRO SYSTEM</Text>
        </View>
      </View>
    </LinearGradient>
  </TouchableOpacity>
));

export default function XeniaUltraMaster() {
  const router = useRouter();
  const [appState, setAppState] = useState<"launch" | "home" | "chat">("launch");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [systemStatus, setSystemStatus] = useState(STATUS_MESSAGES[0]);
  const [bootProgress, setBootProgress] = useState(0);

  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isSTTProcessing, setIsSTTProcessing] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const micScaleAnim = useRef(new Animated.Value(1)).current;
  const micOpacityAnim = useRef(new Animated.Value(1)).current;
  const cardsEntranceAnim = useRef(new Animated.Value(0)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (appState !== "launch") return;

    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 2500,
        easing: Easing.linear,
        useNativeDriver: Platform.OS !== "web",
      })
    ).start();

    const interval = setInterval(() => {
      setBootProgress((prev) => Math.min(prev + (Math.random() * 25), 100));
    }, 100);

    let i = 0;
    const statusInterval = setInterval(() => {
      i++;
      if (i < STATUS_MESSAGES.length) setSystemStatus(STATUS_MESSAGES[i]);
    }, 800);

    const timer = setTimeout(() => {
      clearInterval(statusInterval);
      clearInterval(interval);
      setAppState("home");
      
      Animated.spring(cardsEntranceAnim, {
        toValue: 1,
        tension: 60,
        friction: 7,
        useNativeDriver: Platform.OS !== "web",
      }).start();
    }, 3500);

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

  const triggerHaptic = useCallback((type: Haptics.ImpactFeedbackStyle) => {
    if (Platform.OS !== "web") Haptics.impactAsync(type);
  }, []);

  const scrollToEnd = useCallback(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  const handleCardPress = useCallback((route: string) => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    if (route) router.push(route as any);
  }, [router, triggerHaptic]);

  const handleSend = async (userContentString: string = "", isFromAudio: boolean = false) => {
  const prompt = userContentString.trim() || text.trim();
  if (!prompt || loading) return;

  triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
  if (!isFromAudio) setText("");
  Keyboard.dismiss();

  // 1. Crear los objetos de mensaje con estampas de tiempo únicas
  const userMsg: Msg = { id: `u-${Date.now()}`, role: "user", content: prompt, timestamp: Date.now() };
  const assistantId = `a-${Date.now()}`;
  const assistantPlaceholder: Msg = { id: assistantId, role: "assistant", content: "...", timestamp: Date.now() };

  const currentHistory = [...messages.filter((m) => m.id !== "temp"), userMsg];
  setMessages([...currentHistory, assistantPlaceholder]);
  setLoading(true);
  scrollToEnd();

  try {
    // 🧠 ARQUITECTURA DE DATOS HÍBRIDA (Evita que el backend rechace la petición)
    const payload = {
      message: prompt,                               // Formato estándar 1 (Texto plano)
      prompt: prompt,                                // Formato estándar 2 (Clave alternativa)
      messages: currentHistory.map(m => ({           // Formato ChatGPT oficial (Historial completo)
        role: m.role,
        content: m.content
      }))
    };

    const res = await fetch(URL_BACKEND, {
      method: "POST",
      headers: { 
        "Accept": "application/json",
        "Content-Type": "application/json" 
      },
      body: JSON.stringify(payload)
    });
    
    if (!res.ok) {
      throw new Error(`Servidor respondió con código de error: ${res.status}`);
    }

    const responseText = await res.text();
    let finalContent = responseText;

    // 🔬 DECODIFICADOR SUPREMO DE RESPUESTAS (Extrae el texto venga de donde venga)
    try {
      const json = JSON.parse(responseText);
      finalContent = 
        json.reply || 
        json.message || 
        json.response || 
        json.output ||
        json.choices?.[0]?.message?.content || 
        json.choices?.[0]?.text || 
        responseText;
    } catch (jsonError) {
      // Si el backend responde con texto plano en lugar de JSON, se usa directamente
      finalContent = responseText;
    }

    // Actualizar la interfaz con la respuesta ultra inteligente de la IA
    setMessages((prev) => 
      prev.map((m) => (m.id === assistantId ? { ...m, content: finalContent.trim() } : m))
    );

  } catch (e: any) {
    console.error("Fallo crítico en enlace de IA:", e);
    setMessages((prev) => 
      prev.map((m) => (m.id === assistantId ? { ...m, content: `⚠️ ENLACE NEURAL CAÍDO.\nMotivo: ${e.message || "Sin respuesta del servidor."}` } : m))
    );
  } finally {
    setLoading(false);
    scrollToEnd();
  }
};


  if (appState === "launch") {
    return (
      <View style={styles.launchContainer}>
        <LinearGradient colors={["#020617", "#090f24", "#020617"]} style={styles.launchGradient}>
          <Animated.View style={{ transform: [{ rotate: spin }], marginBottom: 40 }}>
            <Text style={{ fontSize: 70 }}>⚡</Text>
          </Animated.View>
          <Text style={styles.heroTitle}>XENIA</Text>
          <Text style={[styles.heroTitle, { color: "#3b82f6", marginTop: -20 }]}>ULTRA</Text>
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

  if (appState === "home") {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#020617" />
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <View style={styles.tagContainer}>
              <Text style={styles.systemTag}>OS v2.0 MASTER SUPREME</Text>
            </View>
            <Text style={styles.heroTitleSmall}>XENIA HUB</Text>
            <Text style={styles.heroSubText}>Sincronización de sistemas completa.</Text>
          </View>

          <Animated.View style={[styles.content, { opacity: cardsEntranceAnim, transform: [{ translateY: cardsEntranceAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }] }]}>
            <Text style={styles.sectionTitle}>NÚCLEOS MULTIMEDIA</Text>
            <View style={styles.grid}>
              <FeatureCard title="Sonic HD" icon="🎵" color="#10b981" onPress={() => handleCardPress("/music")} />
              <FeatureCard title="Live Stream" icon="📺" color="#ef4444" onPress={() => handleCardPress("/tv")} />
              <FeatureCard title="Neural Games" icon="🎮" color="#8b5cf6" onPress={() => handleCardPress("/games")} />
              <FeatureCard title="Cinema IA" icon="🍿" color="#f59e0b" onPress={() => handleCardPress("/cinema")} />
            </View>

            <TouchableOpacity activeOpacity={0.9} onPress={() => setAppState("chat")} style={styles.mainBtn}>
              <LinearGradient start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} colors={["#2563eb", "#1e40af"]} style={styles.mainBtnGradient}>
                <View>
                  <Text style={styles.mainBtnText}>DESPERTAR A XENIA</Text>
                  <Text style={styles.mainBtnSubText}>Asistente Cuántico Online</Text>
                </View>
                <View style={styles.actionCircle}><Text style={{ fontSize: 20 }}>⚡</Text></View>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setAppState("home")} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← ENTRADA</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>XENIA TERMINAL</Text>
          <View style={styles.onlineDot} />
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ChatBubble item={item} />}
          contentContainerStyle={{ padding: 20 }}
          onContentSizeChange={scrollToEnd}
        />

        {loading && (
          <View style={styles.loadingIndicator}>
            <ActivityIndicator color="#3b82f6" size="small" />
            <Text style={styles.loadingText}>PROCESANDO SINAPSIS IA...</Text>
          </View>
        )}

        <View style={styles.inputArea}>
          <View style={styles.inputContainer}>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Escribe un comando..."
              placeholderTextColor="#475569"
              style={styles.input}
              multiline
            />
            <TouchableOpacity onPress={() => handleSend("")} style={styles.sendBtn} disabled={text.trim().length === 0}>
              <LinearGradient colors={text.trim().length > 0 ? ["#3b82f6", "#2563eb"] : ["#1e293b", "#0f172a"]} style={styles.sendBtnInner}>
                <Text style={{ color: "#fff", fontWeight: "900" }}>↑</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020617" },
  launchContainer: { flex: 1, backgroundColor: "#020617" },
  launchGradient: { flex: 1, justifyContent: "center", alignItems: "center" },
  launchStatusBox: { width: "75%", marginTop: 40, alignItems: "center" },
  hero: { padding: 25, paddingTop: 40 },
  tagContainer: { backgroundColor: "rgba(59, 130, 246, 0.1)", alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 10, borderWidth: 1, borderColor: "rgba(59, 130, 246, 0.2)" },
  systemTag: { color: "#60a5fa", fontSize: 10, fontWeight: "900", letterSpacing: 1 },
  heroTitle: { color: "#fff", fontSize: 70, fontWeight: "900", textAlign: "center", letterSpacing: -2 },
  heroTitleSmall: { color: "#fff", fontSize: 40, fontWeight: "900" },
  heroSubText: { color: "#94a3b8", fontSize: 14, marginTop: 4 },
  statusText: { color: "#64748b", fontSize: 11, marginBottom: 12, letterSpacing: 1 },
  progressBarBg: { height: 3, width: "100%", backgroundColor: "#1e293b", borderRadius: 2, overflow: "hidden" },
  progressBarFill: { height: "100%", backgroundColor: "#3b82f6", borderRadius: 2 },
  content: { paddingHorizontal: 20, paddingBottom: 30 },
  sectionTitle: { color: "#475569", fontSize: 12, fontWeight: "900", marginBottom: 15, letterSpacing: 1 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  card: { width: "48%", height: 160, borderRadius: 24, marginBottom: 15, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  cardGradientInner: { flex: 1, padding: 15, justifyContent: "space-between" },
  cardHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  iconContainer: { width: 44, height: 44, borderRadius: 14, justifyContent: "center", alignItems: "center", borderWidth: 1 },
  cardTitle: { color: "#f8fafc", fontWeight: "800", fontSize: 15, marginBottom: 4 },
  cardBadge: { alignSelf: "flex-start", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1 },
  cardBadgeText: { fontSize: 8, fontWeight: "900" },
  mainBtn: { marginTop: 10, borderRadius: 24, overflow: "hidden" },
  mainBtnGradient: { padding: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  mainBtnText: { color: "#fff", fontWeight: "900", fontSize: 17, letterSpacing: 0.5 },
  mainBtnSubText: { color: "rgba(255,255,255,0.6)", fontSize: 12 },
  actionCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.15)", justifyContent: "center", alignItems: "center" },
  header: { padding: 15, backgroundColor: "#020617", flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  backBtn: { paddingHorizontal: 10, paddingVertical: 6, backgroundColor: "#1e293b", borderRadius: 10 },
  backBtnText: { color: "#94a3b8", fontWeight: "800", fontSize: 11 },
  headerTitle: { color: "#fff", fontSize: 15, fontWeight: "900", marginLeft: 15, flex: 1 },
  onlineDot: { width: 8, height: 8, backgroundColor: "#10b981", borderRadius: 4 },
  loadingIndicator: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 10 },
  loadingText: { color: "#3b82f6", fontSize: 11, fontWeight: "900", marginLeft: 10 },
  inputArea: { padding: 15, backgroundColor: "#020617" },
  inputContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#0f172a", borderRadius: 20, padding: 6, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  input: { flex: 1, color: "#fff", paddingHorizontal: 12, fontSize: 15, maxHeight: 100 },
  sendBtn: { borderRadius: 15, overflow: "hidden" },
  sendBtnInner: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },
});

