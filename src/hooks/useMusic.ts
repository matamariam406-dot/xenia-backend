import { musicEngine } from "../core/music";
import { useMusicStore } from "../store/musicStore";

export const useMusic = () => {
  const { playing, currentTrack, setPlaying, setTrack } = useMusicStore();

  const play = async (uri: string) => {
    await musicEngine.play({ uri });
    setTrack(uri);
    setPlaying(true);
  };

  const pause = async () => {
    await musicEngine.pause();
    setPlaying(false);
  };

  const resume = async () => {
    await musicEngine.resume();
    setPlaying(true);
  };

  const stop = async () => {
    await musicEngine.stop();
    setPlaying(false);
    setTrack(null);
  };

  return {
    playing,
    currentTrack,
    play,
    pause,
    resume,
    stop,
  };
};
