import { detectIntent } from "./intent";
import { pickTrack } from "./musicBrain";
import { musicEngine } from "./music";

export const handleAIAction = async (text: string) => {
  const intent = detectIntent(text);

  switch (intent) {
    case "music.relax": {
      const track = pickTrack("relax");
      await musicEngine.play({ uri: track });
      return "Reproduciendo música relajante 🧘‍♂️";
    }

    case "music.focus": {
      const track = pickTrack("focus");
      await musicEngine.play({ uri: track });
      return "Modo concentración activado 🎯";
    }

    case "music.hype": {
      const track = pickTrack("hype");
      await musicEngine.play({ uri: track });
      return "Subiendo energía 🔥";
    }

    case "music.stop": {
      await musicEngine.stop();
      return "Música detenida ⛔";
    }

    default:
      return null; // sigue flujo normal IA
  }
};
