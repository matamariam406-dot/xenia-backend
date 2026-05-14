import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import fetch from "node-fetch";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const MEMORY_FILE = "./memory.json";

/* =========================
   🧠 MEMORIA SIMPLE
========================= */

function loadMemory() {
  try {
    return JSON.parse(fs.readFileSync(MEMORY_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function saveMemory(data) {
  fs.writeFileSync(MEMORY_FILE, JSON.stringify(data, null, 2));
}

/* =========================
   🧼 LIMPIAR MENSAJES
========================= */

function cleanMessages(messages) {
  return messages
    .filter(m => m?.role && m?.content)
    .map(({ role, content }) => ({ role, content }));
}

/* =========================
   🚀 HEALTH
========================= */

app.get("/", (req, res) => {
  res.json({ status: "Xenia PRO 🚀 activo" });
});

/* =========================
   🧠 CHAT STREAM REAL
========================= */

app.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: "messages inválido" });
    }

    const memory = loadMemory();
    const apiMessages = cleanMessages(messages);

    // guardar último mensaje usuario
    memory.push(apiMessages[apiMessages.length - 1]);

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: apiMessages,
          temperature: 0.7,
          stream: true,
        }),
      }
    );

    if (!response.ok || !response.body) {
      const err = await response.text();
      return res.status(500).json({ error: err });
    }

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");

    const reader = response.body;
    let full = "";

    for await (const chunk of reader) {
      const text = chunk.toString();
      const lines = text.split("\n");

      for (const line of lines) {
        if (!line.startsWith("data:")) continue;

        const json = line.replace("data: ", "").trim();
        if (json === "[DONE]") continue;

        try {
          const parsed = JSON.parse(json);
          const token = parsed.choices?.[0]?.delta?.content;

          if (token) {
            full += token;
            res.write(token);
          }
        } catch {}
      }
    }

    // guardar respuesta IA
    memory.push({ role: "assistant", content: full });

    saveMemory(memory.slice(-50));

    res.end();
  } catch (err) {
    console.error(err);
    res.end("ERROR");
  }
});

/* =========================
   🚀 START SERVER
========================= */

app.listen(process.env.PORT || 3000, "0.0.0.0", () => {
  console.log("🚀 Running");
});
