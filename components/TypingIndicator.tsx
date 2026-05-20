import { View, Animated } from "react-native";
import { useEffect, useRef } from "react";

export default function TypingIndicator() {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  const animate = (dot: Animated.Value, delay: number) => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(dot, {
          toValue: 1,
          duration: 300,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(dot, {
          toValue: 0.3,
          duration: 300,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  useEffect(() => {
    animate(dot1, 0);
    animate(dot2, 150);
    animate(dot3, 300);
  }, []);

  const Dot = ({ anim }: any) => (
    <Animated.View
      style={{
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: "#aaa",
        marginHorizontal: 2,
        opacity: anim,
      }}
    />
  );

  return (
    <View style={{ flexDirection: "row", padding: 10 }}>
      <Dot anim={dot1} />
      <Dot anim={dot2} />
      <Dot anim={dot3} />
    </View>
  );
}
