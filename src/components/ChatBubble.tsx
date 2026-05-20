import React, { useEffect, useRef, useState, memo } from "react";
import { View, Text, Animated } from "react-native";

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

  // =========================
  // ✨ ANIMACIONES BASE
  // =========================
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;

  // =========================
  // 🧠 STREAMING LOCAL STATE
  // =========================
  const [displayedText, setDisplayedText] = useState("");
  const [cursorVisible, setCursorVisible] = useState(true);

  // =========================
  // ✨ ENTRADA ANIMADA (SMOOTH)
  // =========================
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // =========================
  // 🧠 EFECTO TIPO CHATGPT (STREAMING VISUAL)
  // =========================
  useEffect(() => {
    // USER no anima texto
    if (isUser) {
      setDisplayedText(item.content);
      return;
    }

    let i = 0;
    let cancelled = false;

    const interval = setInterval(() => {
      if (cancelled) return;

      i++;

      setDisplayedText(item.content.slice(0, i));

      if (i >= item.content.length) {
        clearInterval(interval);
      }
    }, 6); // ⚡ velocidad tipo ChatGPT real

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [item.content]);

  // =========================
  // ⚡ CURSOR PARPADEANTE
  // =========================
  useEffect(() => {
    if (isUser) return;

    const blink = setInterval(() => {
      setCursorVisible((prev) => !prev);
    }, 500);

    return () => clearInterval(blink);
  }, []);

  // =========================
  // 🎨 UI USER
  // =========================
  if (isUser) {
    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY }],
          alignSelf: "flex-end",
          backgroundColor: "#2563eb",
          padding: 14,
          borderRadius: 20,
          maxWidth: "85%",
          marginVertical: 6,
        }}
      >
        <Text
          style={{
            color: "#fff",
            fontSize: 16,
            fontWeight: "600",
          }}
        >
          {item.content}
        </Text>
      </Animated.View>
    );
  }

  // =========================
  // 🤖 UI ASSISTANT (CHATGPT STYLE)
  // =========================
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
      {/* 🤖 AVATAR */}
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: 14,
          backgroundColor: "#3b82f6",
          justifyContent: "center",
          alignItems: "center",
          marginRight: 10,
          marginTop: 4,
        }}
      >
        <Text style={{ color: "#fff", fontSize: 12, fontWeight: "bold" }}>
          X
        </Text>
      </View>

      {/* 💬 TEXTO */}
      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: "#e6edf3",
            fontSize: 16,
            lineHeight: 24,
          }}
        >
          {displayedText}
          {!isUser &&
          cursorVisible &&
          displayedText !== item.content
            ? "▋"
            : ""}
        </Text>
      </View>
    </Animated.View>
  );
});
