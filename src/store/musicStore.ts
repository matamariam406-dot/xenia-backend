import { create } from "zustand";

type MusicState = {
  playing: boolean;
  currentTrack: string | null;

  setPlaying: (v: boolean) => void;
  setTrack: (uri: string | null) => void;
};

export const useMusicStore = create<MusicState>((set) => ({
  playing: false,
  currentTrack: null,

  setPlaying: (v) => set({ playing: v }),
  setTrack: (uri) => set({ currentTrack: uri }),
}));
