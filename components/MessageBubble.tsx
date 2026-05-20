import { View, Text } from "react-native";

export default function MessageBubble({ item }: any) {
  const isUser = item.role === "user";

  return (
    <View
      style={{
        alignSelf: isUser ? "flex-end" : "flex-start",
        maxWidth: "80%",
        marginVertical: 6,

        backgroundColor: isUser ? "#3b82f6" : "#f2f2f7",
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 20,

        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },

        elevation: 2,
      }}
    >
      <Text
        style={{
          color: isUser ? "white" : "#111",
          fontSize: 16,
          lineHeight: 20,
        }}
      >
        {item.content}
      </Text>
    </View>
  );
}
