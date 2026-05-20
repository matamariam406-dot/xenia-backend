import { createContext, useContext, useState } from "react";
import { Audio } from "expo-av";

const AudioContext = createContext<any>(null);

export const AudioProvider = ({ children }: any) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [queue, setQueue] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const playTrack = async (track: any, index: number, list: any[]) => {
    if (sound) await sound.unloadAsync();

    const { sound: newSound } = await Audio.Sound.createAsync(
      { uri: track.url },
      { shouldPlay: true }
    );

    setSound(newSound);
    setQueue(list);
    setCurrentIndex(index);
    setIsPlaying(true);
  };

  const pause = async () => {
    await sound?.pauseAsync();
    setIsPlaying(false);
  };

  const resume = async () => {
    await sound?.playAsync();
    setIsPlaying(true);
  };

  const next = async () => {
    if (currentIndex < queue.length - 1) {
      const nextIndex = currentIndex + 1;
      playTrack(queue[nextIndex], nextIndex, queue);
    }
  };

  const prev = async () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      playTrack(queue[prevIndex], prevIndex, queue);
    }
  };

  return (
    <AudioContext.Provider
      value={{
        playTrack,
        pause,
        resume,
        next,
        prev,
        isPlaying,
        queue,
        currentIndex,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => useContext(AudioContext);
