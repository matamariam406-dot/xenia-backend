import { useState } from "react";
import { View, TextInput, TouchableOpacity, Text } from "react-native";

export default function ChatInput({ onSend }: any) {
  const [text, setText] = useState("");

  const send = () => {
    if (!text.trim()) return;
    onSend(text);
    setText("");
  };

  return (
    <View
      style={{
        flexDirection: "row",
        padding: 10,
        borderTopWidth: 1,
        borderColor: "#222",
        backgroundColor: "#000",
      }}
    >
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Escribe algo..."
        placeholderTextColor="#666"
        style={{
          flex: 1,
          backgroundColor: "#111",
          color: "#fff",
          padding: 12,
          borderRadius: 20,
        }}
      />

      <TouchableOpacity
        onPress={send}
        style={{
          marginLeft: 8,
          backgroundColor: "#2563eb",
          borderRadius: 20,
          paddingHorizontal: 16,
          justifyContent: "center",
        }}
      >
        <Text style={{ color: "#fff" }}>Enviar</Text>
      </TouchableOpacity>
    </View>
  );
}
