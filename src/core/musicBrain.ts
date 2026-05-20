const playlists = {
  relax: [
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  ],
  focus: [
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
  ],
  hype: [
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
  ],
};

export const pickTrack = (type: "relax" | "focus" | "hype") => {
  const list = playlists[type];
  return list[Math.floor(Math.random() * list.length)];
};
