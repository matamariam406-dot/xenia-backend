import React, { useEffect, useRef, useState, memo } from "react";
import { View, Text, Animated, Platform } from "react-native";

type Msg = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type Props = {
  item: Msg;
};

export const ChatBubble = memo(({ item }: Props) => {
  const isUser = item.role === "user";
  const textContent = item?.content || "";

  // ⚡ Animaciones de entrada optimizadas
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(8)).current;
  
  // 👁️ Cursor animado nativamente (0 Re-renders en JS)
  const cursorOpacity = useRef(new Animated.Value(1)).current;

  // 🧠 Estado de texto simplificado
  const [displayedText, setDisplayedText] = useState(isUser ? textContent : "");

  // Entrada Smooth
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: Platform.OS !== "web",
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 200,
        useNativeDriver: Platform.OS !== "web",
      }),
    ]).start();
  }, []);

  // Streaming de texto inteligente de alta velocidad (Throttled)
  useEffect(() => {
    if (isUser) return;

    let i = 0;
    let isCancelled = false;
    
    // Velocidad adaptativa: letras agrupadas si el texto es masivo
    const step = textContent.length > 200 ? 3 : 1; 

    const interval = setInterval(() => {
      if (isCancelled) return;

      i += step;
      setDisplayedText(textContent.slice(0, i));

      if (i >= textContent.length) {
        setDisplayedText(textContent);
        clearInterval(interval);
      }
    }, 20); // 20ms mantiene los 60fps reales en web y móvil

    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [textContent]);

  // Ciclo infinito del cursor por Hardware gráfico
  useEffect(() => {
    if (isUser) return;

    const blinkAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(cursorOpacity, { toValue: 0, duration: 450, useNativeDriver: Platform.OS !== "web" }),
        Animated.timing(cursorOpacity, { toValue: 1, duration: 450, useNativeDriver: Platform.OS !== "web" }),
      ])
    );
    
    blinkAnimation.start();
    return () => blinkAnimation.stop();
  }, []);

  if (isUser) {
    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY }],
          alignSelf: "flex-end",
          backgroundColor: "#2563eb",
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderRadius: 20,
          borderBottomRightRadius: 4,
          maxWidth: "85%",
          marginVertical: 4,
        }}
      >
        <Text style={{ color: "#fff", fontSize: 15, fontWeight: "500" }}>
          {displayedText}
        </Text>
      </Animated.View>
    );
  }

  const isStreamingDone = displayedText === textContent;

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY }],
        flexDirection: "row",
        alignItems: "flex-start",
        marginVertical: 6,
        width: "100%",
      }}
    >
      {/* Avatar Estilo Cyberpunk */}
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 10,
          backgroundColor: "rgba(59, 130, 246, 0.15)",
          borderWidth: 1,
          borderColor: "rgba(59, 130, 246, 0.3)",
          justifyContent: "center",
          alignItems: "center",
          marginRight: 12,
          marginTop: 2,
        }}
      >
        <Text style={{ color: "#3b82f6", fontSize: 13, fontWeight: "900" }}>X</Text>
      </View>

      {/* Caja de Respuesta */}
      <View style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.02)", padding: 12, borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.04)" }}>
        <Text style={{ color: "#e2e8f0", fontSize: 15, lineHeight: 22 }}>
          {displayedText}
          {!isStreamingDone && (
            <Animated.Text style={{ color: "#3b82f6", fontWeight: "900", opacity: cursorOpacity }}>
              {" ▋"}
            </Animated.Text>
          )}
        </Text>
      </View>
    </Animated.View>
  );
});

