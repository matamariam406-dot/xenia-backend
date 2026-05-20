import * as Speech from "expo-speech";

export const speak = (text: string) => {
  Speech.stop();
  Speech.speak(text, {
    language: "es-MX",
    rate: 1.0,
  });
};

export const stopSpeak = () => {
  Speech.stop();
};
