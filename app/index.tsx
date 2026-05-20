import { useRouter } from "expo-router";
import React, { useRef, useState, useEffect, useCallback } from "react";
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
import * as Speech from "expo-speech";
import * as Haptics from "expo-haptics";
import { Audio } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
// Asegúrate de que esta ruta apunte correctamente a tu componente ChatBubble
import { ChatBubble } from "../src/components/ChatBubble";

const { width } = Dimensions.get("window");
const URL_BACKEND = "https://xenia-backend-r8if.onrender.com/chat";

const sendToBackend = async (messages) => {
  try {
    const res = await fetch(URL_BACKEND, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: messages,
      }),
    });

    const text = await res.text();

    console.log("🔥 RAW RESPONSE:", text);

    const data = JSON.parse(text);

    return data;

  } catch (error) {
    console.error("💣 ERROR REAL:", error);
  }
};

// --- TIPADOS Y CONSTANTES ---
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

// --- ESTADOS ---
// Tres estados: Secuencia de arranque -> Menú principal -> Interfaz de Chat
const [appState, setAppState] = useState<"launch" | "home" | "chat">("launch");
const [messages, setMessages] = useState<Msg[]>([]);
const [text, setText] = useState("");
const [loading, setLoading] = useState(false);
const [systemStatus, setSystemStatus] = useState("INICIALIZANDO NÚCLEO...");
const [bootProgress, setBootProgress] = useState(0);

// --- AUDIO ---
const [recording, setRecording] = useState<Audio.Recording | null>(null);
const [isRecording, setIsRecording] = useState(false);
const [isSTTProcessing, setIsSTTProcessing] = useState(false);

// --- REFS Y ANIMACIONES ---
const flatListRef = useRef<FlatList>(null);
const micScaleAnim = useRef(new Animated.Value(1)).current;
const cardsEntranceAnim = useRef(new Animated.Value(0)).current;
const spinAnim = useRef(new Animated.Value(0)).current;

// --- LÓGICA DE LANZAMIENTO (BOOT SEQUENCE) ---
useEffect(() => {
// Animación de rotación continua para el logo
Animated.loop(
Animated.timing(spinAnim, {
toValue: 1,
duration: 4000,
easing: Easing.linear,
useNativeDriver: true,
})
).start();

// Simulación de barra de carga
const interval = setInterval(() => {
setBootProgress((prev) => {
const step = Math.random() * 15;
return prev + step >= 100 ? 100 : prev + step;
});
}, 150);

// Cambio de mensajes de estado
let i = 0;
const statusInterval = setInterval(() => {
setSystemStatus(STATUS_MESSAGES[i % STATUS_MESSAGES.length]);
i++;
}, 1000);

// Finalizar arranque y mostrar Home
const timer = setTimeout(() => {
clearInterval(statusInterval);
clearInterval(interval);
setAppState("home");
// Animar entrada de tarjetas
Animated.spring(cardsEntranceAnim, {
toValue: 1,
friction: 8,
useNativeDriver: true,
}).start();
}, 5500);

return () => {
clearInterval(interval);
clearInterval(statusInterval);
clearTimeout(timer);
};
}, []);

const spin = spinAnim.interpolate({
inputRange: [0, 1],
outputRange: ["0deg", "360deg"],
});

// --- FUNCIONES CORE ---
const triggerHaptic = useCallback((type: Haptics.ImpactFeedbackStyle) => {
Haptics.impactAsync(type);
}, []);

const scrollToEnd = useCallback(() => {
if (messages.length > 0) {
setTimeout(() => {
flatListRef.current?.scrollToEnd({ animated: true });
}, 150);
}
}, [messages.length]);

const speak = (content: string) => {
if (!content) return;
Speech.stop();
Speech.speak(content, { rate: 1.1, pitch: 1.0, language: "es-MX" });
};

const updateMessage = (id: string, content: string) => {
setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, content } : m)));
};

// --- MANEJO DE AUDIO PRO ---
const startRecording = async () => {
try {
const permission = await Audio.requestPermissionsAsync();
if (permission.status !== "granted") {
Alert.alert("Permiso denegado", "Se requiere acceso al micrófono.");
return;
}

await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
const { recording: newRecording } = await Audio.Recording.createAsync(
Audio.RecordingOptionsPresets.HIGH_QUALITY
);

setRecording(newRecording);
setIsRecording(true);
triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);

// Animar el botón del micrófono mientras graba
Animated.loop(
Animated.sequence([
Animated.timing(micScaleAnim, { toValue: 1.2, duration: 400, useNativeDriver: true }),
Animated.timing(micScaleAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
 ])
).start();
} catch (err) {
console.error("Error Mic:", err);
}
};

const stopRecording = async () => {
if (!recording) return;
try {
setIsRecording(false);
micScaleAnim.stopAnimation();
micScaleAnim.setValue(1);

await recording.stopAndUnloadAsync();
setRecording(null);
triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);

setIsSTTProcessing(true);
// Aquí iría tu lógica real de Speech-To-Text (Whisper u otro)
await new Promise((r) => setTimeout(r, 1500));
setIsSTTProcessing(false);

// Simulación de envío tras STT
handleSend("Hola Xenia, analiza mi mensaje de voz.", true);
} catch (err) {
Alert.alert("Error", "Fallo al procesar audio.");
}
};

// --- NÚCLEO IA (MODO EXPERTO) ---
const handleSend = async (userContentString: string = "", isFromAudio: boolean = false) => {
const prompt = userContentString.trim() || text.trim();
if (!prompt || loading) return;

triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
if (!isFromAudio) setText("");
Keyboard.dismiss();

const userMsg: Msg = {
id: `u-${Date.now()}`,
role: "user",
content: prompt,
timestamp: Date.now(),
};

const assistantId = `a-${Date.now()}`;

const assistantPlaceholder: Msg = {
id: assistantId,
role: "assistant",
content: "...",
timestamp: Date.now(),
};

const currentHistory = [...messages.filter((m) => m.id !== "temp"), userMsg];
setMessages([...currentHistory, assistantPlaceholder]);
setLoading(true);
scrollToEnd();

try {
const data = await safeFetch(URL_BACKEND, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    messages: currentHistory.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  }),
});

if (!response.ok) throw new Error(`HTTP_${response.status}`);

let finalContent = data.reply || data.message || "Sin respuesta";

// Extracción robusta: Intenta JSON, si falla usa texto plano
try {
const json = JSON.parse(rawResponse);
finalContent = json.reply || json.message || json.choices?.[0]?.message?.content || rawResponse;
} catch {
finalContent = rawResponse;
}

updateMessage(assistantId, finalContent);
speak(finalContent);
} catch (e: any) {
updateMessage(assistantId, "⚠️ ERROR DE ENLACE: " + e.message);
} finally {
setLoading(false);
scrollToEnd();
}
};

// --- UI COMPONENTS ---
// Integración experta: Recibe la ruta y usa expo-router
const FeatureCard = ({ title, icon, color = "#3b82f6", route }: { title: string, icon: string, color: string, route: any }) => (
<TouchableOpacity
activeOpacity={0.7}
onPress={() => {
triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
if (route) router.push(route);
}}
style={styles.card}
>
<LinearGradient colors={[color + "30", "#111b31"]} style={styles.cardGradientInner}>
<View style={[styles.iconContainer, { backgroundColor: color + "20" }]}>
<Text style={{ fontSize: 32 }}>{icon}</Text>
</View>
<Text style={styles.cardTitle}>{title}</Text>
<View style={[styles.cardBadge, { backgroundColor: color }]}>
<Text style={styles.cardBadgeText}>ACCESO PRO</Text>
</View>
</LinearGradient>
</TouchableOpacity>
);

// --- RENDERS ---

// 1. PANTALLA DE ARRANQUE (BOOT)
if (appState === "launch") {
return (
<View style={styles.launchContainer}>
<StatusBar hidden />
<LinearGradient colors={["#000", "#091222", "#000"]} style={styles.launchGradient}>
<Animated.View style={{ transform: [{ rotate: spin }], marginBottom: 40 }}>
<Text style={{ fontSize: 90 }}>⚡</Text>
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

// 2. PANTALLA PRINCIPAL (HOME)
if (appState === "home") {
return (
<SafeAreaView style={styles.container}>
<StatusBar barStyle="light-content" backgroundColor="#020617" />
<ScrollView showsVerticalScrollIndicator={false}>
<LinearGradient colors={["#1c2638", "#020617"]} style={styles.hero}>
<Text style={styles.systemTag}>PROTOCOL V1.5.0 MASTER SUPREME</Text>
<Text style={styles.heroTitleSmall}>XENIA ULTRA</Text>
<Text style={styles.heroSubText}>CONEXIÓN NEURAL ESTABLE. NÚCLEO ONLINE.</Text>
</LinearGradient>

<Animated.View
style={[
styles.content,
{
opacity: cardsEntranceAnim,
transform: [
{
translateY: cardsEntranceAnim.interpolate({
inputRange: [0, 1],
outputRange: [40, 0],
}),
},
],
},
]}
>
<Text style={styles.sectionTitle}>NÚCLEOS OPERATIVOS</Text>
<View style={styles.grid}>
<FeatureCard title="Sonic HD" icon="🎵" color="#10b981" route="/music" />
<FeatureCard title="Live Stream" icon="📺" color="#ef4444" route="/tv" />
<FeatureCard title="Neural Games" icon="🎮" color="#8b5cf6" route="/games" />
<FeatureCard title="Xenia Cinema" icon="🍿" color="#f59e0b" route="/cinema" />
</View>

{/* Botón principal para abrir el chat inteligente */}
<TouchableOpacity onPress={() => setAppState("chat")} style={styles.mainBtn}>
<LinearGradient start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} colors={["#4e99f7", "#1d4ed8"]} style={styles.mainBtnGradient}>
<Text style={styles.mainBtnText}>INICIAR NÚCLEO IA</Text>
<Text style={{ fontSize: 24, marginLeft: 10 }}>⚡</Text>
</LinearGradient>
</TouchableOpacity>
</Animated.View>
</ScrollView>
</SafeAreaView>
);
}

// 3. PANTALLA DE CHAT IA
return (
<SafeAreaView style={styles.container}>
<KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
{/* Header del Chat */}
<View style={styles.header}>
<TouchableOpacity onPress={() => setAppState("home")} style={styles.backBtn}>
<Text style={styles.backBtnText}>← ESC</Text>
</TouchableOpacity>
<View style={{ marginLeft: 15 }}>
<Text style={styles.headerTitle}>XENIA CHAT CENTRAL</Text>
<Text style={styles.headerStatus}>ENLACE CIFRADO ACTIVO</Text>
</View>
<View style={styles.onlineDot} />
</View>

{/* Lista de Mensajes */}
<FlatList
ref={flatListRef}
data={messages}
keyExtractor={(item) => item.id}
renderItem={({ item }) => <ChatBubble item={item} />}
contentContainerStyle={{ padding: 20 }}
onContentSizeChange={scrollToEnd}
/>

{/* Indicador de Carga / Procesamiento STT */}
{(loading || isSTTProcessing) && (
<View style={styles.loadingIndicator}>
<ActivityIndicator color={isSTTProcessing ? "#10b981" : "#3b82f6"} size="small" />
<Text style={[styles.loadingText, isSTTProcessing && { color: "#10b981" }]}>
{isSTTProcessing ? "DECODIFICANDO AUDIO..." : "SINAPSIS EN PROCESO..."}
</Text>
</View>
)}

{/* Zona de Entrada de Texto/Audio */}
<View style={styles.inputArea}>
<View style={styles.inputContainer}>
<TextInput
value={text}
onChangeText={setText}
placeholder="Escribe a Xenia..."
placeholderTextColor="#64748b"
style={styles.input}
multiline
/>

{/* Botón de Micrófono con Animación */}
<TouchableOpacity onPressIn={startRecording} onPressOut={stopRecording} style={styles.micBtn}>
<Animated.View
style={[
styles.micBtnInner,
{ backgroundColor: isRecording ? "#ef4444" : "#1e293b", transform: [{ scale: micScaleAnim }] },
]}
>
<Text style={{ fontSize: 20 }}>🎤</Text>
</Animated.View>
</TouchableOpacity>

{/* Botón de Enviar */}
<TouchableOpacity onPress={() => handleSend("")} style={styles.sendBtn}>
<LinearGradient colors={["#3b82f6", "#1d4ed8"]} style={styles.sendBtnInner}>
<Text style={{ color: "#fff", fontWeight: "bold" }}>↑</Text>
</LinearGradient>
</TouchableOpacity>
</View>
</View>
</KeyboardAvoidingView>
</SafeAreaView>
);
}

// --- ESTILOS OPTIMIZADOS ---
const styles = StyleSheet.create({
container: { flex: 1, backgroundColor: "#020617" },
launchContainer: { flex: 1 },
launchGradient: { flex: 1, justifyContent: "center", alignItems: "center" },
launchStatusBox: { width: "80%", marginTop: 50, alignItems: "center" },
hero: { padding: 30, paddingTop: 60, borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
systemTag: { color: "#3b82f6", fontSize: 11, fontWeight: "800", letterSpacing: 2, marginBottom: 10 },
heroTitle: { color: "#fff", fontSize: 75, fontWeight: "900", textAlign: "center" },
heroTitleSmall: { color: "#fff", fontSize: 42, fontWeight: "900" },
heroSubText: { color: "#94a3b8", fontSize: 13, marginTop: 10 },
statusText: { color: "#64748b", fontSize: 12, marginBottom: 10, letterSpacing: 1 },
progressBarBg: { height: 4, width: "100%", backgroundColor: "#1e293b", borderRadius: 2, overflow: "hidden" },
progressBarFill: { height: "100%", backgroundColor: "#3b82f6", borderRadius: 2 },
content: { padding: 20 },
sectionTitle: { color: "#475569", fontSize: 12, fontWeight: "900", marginBottom: 20, letterSpacing: 1 },
grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
card: { width: "48%", height: 160, borderRadius: 24, marginBottom: 15, overflow: "hidden", borderWidth: 1, borderColor: "#1e293b" },
cardGradientInner: { flex: 1, padding: 15, justifyContent: "space-between" },
iconContainer: { width: 50, height: 50, borderRadius: 15, justifyContent: "center", alignItems: "center" },
cardTitle: { color: "#fff", fontWeight: "800", fontSize: 15 },
cardBadge: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
cardBadgeText: { color: "#fff", fontSize: 8, fontWeight: "900" },
mainBtn: { marginTop: 20, borderRadius: 20, overflow: "hidden" },
mainBtnGradient: { padding: 20, flexDirection: "row", justifyContent: "center", alignItems: "center" },
mainBtnText: { color: "#fff", fontWeight: "900", fontSize: 18, letterSpacing: 1 },
header: { padding: 20, backgroundColor: "#0f172a", flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderColor: "#1e293b" },
backBtn: { padding: 8, backgroundColor: "#1e293b", borderRadius: 10 },
backBtnText: { color: "#3b82f6", fontWeight: "900", fontSize: 12 },
headerTitle: { color: "#fff", fontSize: 16, fontWeight: "900" },
headerStatus: { color: "#10b981", fontSize: 10, fontWeight: "700" },
onlineDot: { width: 8, height: 8, backgroundColor: "#10b981", borderRadius: 4, marginLeft: "auto" },
loadingIndicator: { flexDirection: "row", alignItems: "center", paddingHorizontal: 25, marginBottom: 10 },
loadingText: { color: "#3b82f6", fontSize: 11, fontWeight: "800", marginLeft: 10, letterSpacing: 1 },
inputArea: { padding: 15, backgroundColor: "#020617" },
inputContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#0f172a", borderRadius: 20, padding: 6, borderWidth: 1, borderColor: "#1e293b" },
input: { flex: 1, color: "#fff", paddingHorizontal: 15, fontSize: 15, maxHeight: 100 },
micBtn: { marginHorizontal: 5 },
micBtnInner: { width: 42, height: 42, borderRadius: 15, justifyContent: "center", alignItems: "center" },
sendBtn: { borderRadius: 15, overflow: "hidden" },
sendBtnInner: { width: 42, height: 42, justifyContent: "center", alignItems: "center" },
});

