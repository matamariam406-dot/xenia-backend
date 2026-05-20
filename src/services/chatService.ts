const URL = "https://xenia-backend-r8if.onrender.com/chat";

export type Msg = {
  role: "user" | "assistant";
  content: string;
};

export type OnUpdate = (id: string, text: string) => void;

type Options = {
  messages: Msg[];
  id: string;
  onUpdate: OnUpdate;
  signal?: AbortSignal;
};

// 🚀 STREAM ENGINE ULTRA (OPENAI STYLE + FALLBACK + ROBUSTO + CLEAN)
export const streamChatUltra = async ({
  messages,
  id,
  onUpdate,
  signal,
}: Options) => {
  try {
    const res = await fetch(URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body: JSON.stringify({ messages }),
      signal,
    });

    // =========================
    // ⚠️ FALLBACK (SIN STREAM)
    // =========================
    if (!res.body) {
      const data = await res.json().catch(() => null);

      const reply =
        data?.reply ||
        data?.content ||
        data?.message ||
        "";

      if (reply) {
        onUpdate(id, reply);
      }

      return reply;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    let buffer = "";
    let full = "";

    // =========================
    // 🔥 STREAM LOOP PRINCIPAL
    // =========================
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const clean = line.replace(/^data:\s*/, "").trim();

        if (!clean || clean === "[DONE]") continue;

        // =========================
        // 🧠 JSON STREAM (OPENAI STYLE)
        // =========================
        try {
          const json = JSON.parse(clean);

          const token =
            json.token ||
            json.content ||
            json.delta ||
            json.text ||
            "";

          if (!token) continue;

          full += token;
          onUpdate(id, full);
        } catch {
          // =========================
          // 🧨 RAW STREAM FALLBACK
          // =========================
          if (!clean.startsWith("{")) {
            full += clean;
            onUpdate(id, full);
          }
        }
      }
    }

    return full;
  } catch (e: any) {
    console.log("STREAM_ULTRA_ERROR:", e?.message || e);
    return "Error conectando con Xenia.";
  }
};
