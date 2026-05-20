import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "xenia_chat_memory_v2";

// =========================
// 🧠 TIPADO BASE (OPCIONAL PRO)
// =========================
export type Msg = {
  id?: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: number;
};

// =========================
// 💾 GUARDADO INTELIGENTE
// =========================
export const saveMessages = async (messages: Msg[]) => {
  try {
    const payload = messages.map((m) => ({
      ...m,
      timestamp: m.timestamp ?? Date.now(),
    }));

    await AsyncStorage.setItem(KEY, JSON.stringify(payload));
  } catch (e) {
    console.log("SAVE_MEMORY_ERROR:", e);
  }
};

// =========================
// 📥 CARGA INTELIGENTE
// =========================
export const loadMessages = async (): Promise<Msg[]> => {
  try {
    const data = await AsyncStorage.getItem(KEY);

    if (!data) return [];

    const parsed = JSON.parse(data);

    // validación defensiva
    if (!Array.isArray(parsed)) return [];

    return parsed;
  } catch (e) {
    console.log("LOAD_MEMORY_ERROR:", e);
    return [];
  }
};

// =========================
// 🧹 LIMPIEZA TOTAL
// =========================
export const clearMessages = async () => {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch (e) {
    console.log("CLEAR_MEMORY_ERROR:", e);
  }
};

// =========================
// ⚡ EXTRA PRO: APPEND SEGURO
// =========================
export const appendMessage = async (msg: Msg) => {
  try {
    const current = await loadMessages();
    const updated = [...current, { ...msg, timestamp: Date.now() }];
    await saveMessages(updated);
    return updated;
  } catch (e) {
    console.log("APPEND_MEMORY_ERROR:", e);
    return [];
  }
};
