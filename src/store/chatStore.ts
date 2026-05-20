import { create } from "zustand";

/**
 * 🔥 TIPOS
 */
export type Role = "user" | "assistant" | "system";

export type Msg = {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
};

/**
 * 🔥 STATE
 */
type ChatState = {
  messages: Msg[];
  loading: boolean;

  addMessage: (msg: Msg) => void;
  updateMessage: (id: string, content: string) => void;
  setLoading: (v: boolean) => void;
  clear: () => void;

  // 🔥 NUEVO NIVEL PRO
  getLastMessage: () => Msg | null;
  removeMessage: (id: string) => void;
};

/**
 * 🔥 STORE
 */
export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  loading: false,

  /**
   * ➕ Añadir mensaje
   */
  addMessage: (msg) =>
    set((state) => ({
      messages: [...state.messages, msg],
    })),

  /**
   * ✏️ Actualizar mensaje (streaming IA)
   */
  updateMessage: (id, content) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === id ? { ...m, content } : m
      ),
    })),

  /**
   * 🔄 Loading global
   */
  setLoading: (v) => set({ loading: v }),

  /**
   * 🧹 Limpiar chat
   */
  clear: () => set({ messages: [] }),

  /**
   * 🧠 Obtener último mensaje
   */
  getLastMessage: () => {
    const msgs = get().messages;
    return msgs.length ? msgs[msgs.length - 1] : null;
  },

  /**
   * ❌ Eliminar mensaje
   */
  removeMessage: (id) =>
    set((state) => ({
      messages: state.messages.filter((m) => m.id !== id),
    })),
}));
