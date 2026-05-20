import { View, Text } from "react-native";
import { BlurView } from "expo-blur";

export default function ChatBubble({ message }: any) {
  const isUser = message.role === "user";

  return (
    <View
      style={{
        alignSelf: isUser ? "flex-end" : "flex-start",
        marginVertical: 6,
        marginHorizontal: 10,
        maxWidth: "80%",
      }}
    >
      <BlurView
        intensity={40}
        tint={isUser ? "dark" : "light"}
        style={{
          padding: 14,
          borderRadius: 18,
          backgroundColor: isUser
            ? "rgba(37,99,235,0.6)"
            : "rgba(255,255,255,0.08)",
        }}
      >
        <Text style={{ color: "#fff", fontSize: 15 }}>
          {message.content}
        </Text>
      </BlurView>
    </View>
  );
}
