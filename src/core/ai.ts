import { useChatStore } from "../store/chatStore";

/**
 * Configuración central
 */
const URL = "https://xenia-backend-r8if.onrender.com/chat";
const STREAM_UPDATE_INTERVAL = 50; // ms throttle UI
const MAX_RETRIES = 2;

/**
 * Tipos base
 */
type Msg = {
  id?: string;
  role: "user" | "assistant" | "system";
  content: string;
};

type StreamOptions = {
  onChunk?: (text: string) => void; // opcional (modo UI directo)
  signal?: AbortSignal;             // cancelar request
  assistantId?: string;             // para actualizar store
};

/**
 * Delay helper
 */
const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

/**
 * 🔥 ENGINE PRINCIPAL DE STREAMING (ULTRA PRO)
 */
export const streamAI = async (
  messages: Msg[],
  options: StreamOptions = {}
): Promise<string> => {
  const { updateMessage, setLoading } = useChatStore.getState();

  const {
    onChunk,
    signal,
    assistantId,
  } = options;

  let attempt = 0;
  let finalText = "";

  setLoading(true);

  while (attempt <= MAX_RETRIES) {
    try {
      const controller = new AbortController();

      // Si viene señal externa, la conectamos
      if (signal) {
        signal.addEventListener("abort", () => controller.abort());
      }

      const res = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages }),
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      if (!res.body || typeof res.body.getReader !== "function") {
      const data = await res.json();
      const data = await res.json();

      const text =
       data?.reply ||
       data?.message ||
       data?.content ||
       "Sin respuesta";

       finalText = text;

       if (assistantId) {
         updateMessage(assistantId, finalText);
       }

       if (onChunk) {
        onChunk(finalText);
       }

        return finalText;
       }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      let buffer = "";
      let lastFlush = Date.now();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const now = Date.now();

        // 🔥 THROTTLE PARA NO LAGGEAR UI
        if (now - lastFlush > STREAM_UPDATE_INTERVAL) {
          if (assistantId) updateMessage(assistantId, buffer);
          if (onChunk) onChunk(buffer);

          lastFlush = now;
        }
      }

      // 🔥 flush final
      finalText = buffer;

      if (assistantId) updateMessage(assistantId, finalText);
      if (onChunk) onChunk(finalText);

      return finalText;

    } catch (error: any) {
      console.log("AI ERROR:", error.message);

      if (error.name === "AbortError") {
        console.log("⛔ Request cancelado");
        throw error;
      }

      // retry automático
      if (attempt < MAX_RETRIES) {
        attempt++;
        await wait(500 * attempt); // backoff progresivo
        continue;
      }

      // fallo definitivo
      if (assistantId) {
        updateMessage(assistantId, "❌ Error de conexión con IA");
      }

      throw error;

    } finally {
      setLoading(false);
    }
  }

  return finalText;
};
