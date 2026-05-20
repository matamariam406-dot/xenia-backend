import { Audio } from "expo-av";

let sound: Audio.Sound | null = null;

type PlayOptions = {
  uri: string;
  loop?: boolean;
  volume?: number;
};

export const musicEngine = {
  async play({ uri, loop = false, volume = 1 }: PlayOptions) {
    try {
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri },
        {
          shouldPlay: true,
          isLooping: loop,
          volume,
        }
      );

      sound = newSound;
    } catch (e) {
      console.log("Music play error:", e);
    }
  },

  async pause() {
    if (!sound) return;
    await sound.pauseAsync();
  },

  async resume() {
    if (!sound) return;
    await sound.playAsync();
  },

  async stop() {
    if (!sound) return;
    await sound.stopAsync();
  },

  async unload() {
    if (!sound) return;
    await sound.unloadAsync();
    sound = null;
  },
};
