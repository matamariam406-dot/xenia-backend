import { useEffect, useRef, useCallback } from "react";
import { useChatStore, Msg } from "../store/chatStore";
import { streamAI } from "../core/ai";
import { saveMessages, loadMessages } from "../storage/memory";

export function useChat() {
  const {
    messages,
    loading,
    addMessage,
    updateMessage,
    setLoading,
    clear,
  } = useChatStore();

  // ⛔ control de cancelación real
  const abortRef = useRef<AbortController | null>(null);

  /**
   * =========================
   * 🧠 LOAD MEMORY (solo 1 vez)
   * =========================
   */
  useEffect(() => {
    (async () => {
      const saved = await loadMessages();
      saved.forEach(addMessage);
    })();
  }, []);

  /**
   * =========================
   * 💾 AUTO SAVE GLOBAL
   * =========================
   */
  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  /**
   * =========================
   * 🚀 SEND MESSAGE ULTRA PRO
   * =========================
   */
  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || loading) return;

      // 🔥 comandos internos
      if (text.startsWith("/clear")) {
        clear();
        await saveMessages([]);
        return;
      }

      const now = Date.now();

      const userMsg: Msg = {
        id: `u-${now}`,
        role: "user",
        content: text,
        timestamp: now,
      };

      const assistantId = `a-${now}`;

      const assistantMsg: Msg = {
        id: assistantId,
        role: "assistant",
        content: "",
        timestamp: now,
      };

      // UI inmediata (store)
      addMessage(userMsg);
      addMessage(assistantMsg);

      // ⛔ cancelar anterior
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      setLoading(true);

      try {
        await streamAI(
          [...messages, userMsg], // contexto limpio
          {
            assistantId,
            signal: abortRef.current.signal,
          }
        );
      } catch (e: any) {
        updateMessage(
          assistantId,
          "❌ " + (e?.message || "Error desconocido")
        );
      } finally {
        setLoading(false);
      }
    },
    [messages, loading]
  );

  /**
   * =========================
   * ⛔ STOP STREAM
   * =========================
   */
  const stop = useCallback(() => {
    abortRef.current?.abort();
    setLoading(false);
  }, []);

  /**
   * =========================
   * 🧹 CLEAR CHAT
   * =========================
   */
  const clearChat = useCallback(async () => {
    clear();
    await saveMessages([]);
  }, []);

  /**
   * =========================
   * 📤 API FINAL
   * =========================
   */
  return {
    messages,
    loading,
    sendMessage,
    stop,
    clearChat,
  };
}
