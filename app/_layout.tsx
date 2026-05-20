import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
// Importación corregida hacia la raíz externa 
import { AudioProvider } from "../context/AudioContext"; 
// Asegúrate de importar tu MiniPlayer correctamente
import MiniPlayer from "../components/MiniPlayer"; 

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      {/* El AudioProvider DEBE envolver absolutamente a todo lo demás */}
      <AudioProvider>
        <StatusBar style="light" backgroundColor="#0a0a0a" />
        
        {/* 🔥 TODAS TUS PANTALLAS */}
        <Slot />

        {/* 🔥 MINI PLAYER GLOBAL (TIPO SPOTIFY) */}
        <MiniPlayer />
      </AudioProvider>
    </SafeAreaProvider>
  );
}

