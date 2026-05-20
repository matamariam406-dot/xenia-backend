import { Audio } from "expo-av";

export const startMic = async () => {
  const permission = await Audio.requestPermissionsAsync();
  if (permission.status !== "granted") throw new Error("No mic");

  const { recording } = await Audio.Recording.createAsync(
    Audio.RecordingOptionsPresets.HIGH_QUALITY
  );

  return recording;
};

export const stopMic = async (recording: Audio.Recording) => {
  await recording.stopAndUnloadAsync();
  return "Texto simulado desde audio"; // aquí luego STT real
};
