import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
import ytSearch from "yt-search"; 

// 🔥 HEMOS ELIMINADO YTDL-CORE POR COMPLETO PARA EVITAR BLOQUEOS DE YOUTUBE 🔥

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

/* ==========================================================================
🔍 MOTOR AUTÓNOMO DE BÚSQUEDA WEB (Dependency-Free Scraper)
========================================================================== */
async function performWebSearch(query) {
  console.log(`🌐 [XENIA ENGINE] Investigando en la Web: "${query}"...`);
  try {
    const response = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
    });

    if (!response.ok) return [{ title: "Error", snippet: "No se pudo conectar a los servidores de búsqueda." }];

    const html = await response.text();
    const results = [];
    const blocks = html.split('class="result__body"');

    for (let i = 1; i < Math.min(blocks.length, 5); i++) {
      const block = blocks[i];
      const titleMatch = block.match(/class="result__title"[^>]*>([\s\S]*?)<\/a>/);
      const snippetMatch = block.match(/class="result__snippet"[^>]*>([\s\S]*?)<\/a>/);
      
      if (titleMatch && snippetMatch) {
        const title = titleMatch[1].replace(/<[^>]*>/g, "").trim();
        const snippet = snippetMatch[1].replace(/<[^>]*>/g, "").trim();
        results.push({ title, snippet });
      }
    }
    return results.length > 0 ? results : [{ title: "Sin resultados", snippet: "No se encontraron datos en la red." }];
  } catch (err) {
    console.error("Fallo crítico en módulo de rastreo:", err);
    return [{ title: "Fallo de consulta", snippet: "La búsqueda web falló temporalmente." }];
  }
}

/* ==========================================================================
🧠 PROMPT DEL SISTEMA: CONTROL COGNITIVO
========================================================================== */
const SYSTEM_PROMPT = {
  role: "system",
  content: `Eres Xenia, la inteligencia artificial de nivel élite, ultra-coherente, rápida y con precisión industrial. Eres la asistente personal de César.
REGLAS:
1. NO alucinar ni inventar datos.
2. Mantén un tono profesional, tecnológico y leal a César.
3. Responde siempre en formato Markdown.
Si César pide abrir una app, responde SOLO: {"tool": "open_app", "appName": "nombre"}`
};

/* ==========================================================================
🚀 HEALTH ENDPOINTS
========================================================================== */
app.get("/health", (req, res) => res.status(200).send("Xenia Server Active"));
app.get("/", (req, res) => res.json({ status: "Xenia AGENTIC PRO 🚀 activo" }));

/* ==========================================================================
🧠 CHAT ORQUESTADOR DE AGENTES (IA)
========================================================================== */
app.post("/chat", async (req, res) => {
  try {
    const { messages, message, prompt } = req.body;
    let cleanHistory = [];
    
    if (Array.isArray(messages)) {
      cleanHistory = messages.filter(m => m?.role && m?.content).map(({ role, content }) => ({ role, content }));
    } else if (message || prompt) {
      cleanHistory = [{ role: "user", content: message || prompt }];
    } else {
      return res.status(400).json({ error: "Formato de mensaje inválido" });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ reply: "Error crítico: API Key de Groq no configurada en el servidor." });
    }

    const finalMessages = [SYSTEM_PROMPT, ...cleanHistory];

    const responseIA = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: finalMessages,
        temperature: 0.3
      })
    });

    if (!responseIA.ok) throw new Error(`Groq falló con estado: ${responseIA.status}`);

    const aiData = await responseIA.json();
    res.status(200).json({ reply: aiData.choices[0]?.message?.content || "No se generó respuesta." });

  } catch (err) {
    console.error("Fallo crítico en /chat:", err);
    res.status(500).json({ reply: "Fallo de conexión con el núcleo cognitivo de Xenia. Intenta de nuevo." });
  }
});

/* ==========================================================================
🔍 MOTOR DE BÚSQUEDA BLINDADO (MÚSICA)
========================================================================== */
app.get('/search', async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: 'Falta parámetro q' });

  try {
    console.log(`🎵 [SONIC HD] Buscando: "${query}"...`);
    const r = await ytSearch(query);
    const videos = r.videos.slice(0, 15).map(v => ({
      id: v.videoId,
      title: v.title,
      artist: v.author ? v.author.name : "Desconocido",
      cover: v.thumbnail
    }));

    res.json({ videos: videos });
  } catch (error) {
    console.error("❌ Fallo en búsqueda:", error.message);
    res.json({ videos: [] });
  }
});

/* ==========================================================================
📥 MOTOR DE AUDIO BLINDADO CONTRA BOTS (PIPED PROXY)
========================================================================== */
app.get('/download', async (req, res) => {
  const videoId = req.query.id;
  if (!videoId) return res.status(400).send("Falta ID");

  const instances = [
    "https://pipedapi.kavin.rocks",
    "https://pipedapi.smnz.de",
    "https://api.piped.yt",
    "https://piped-api.garudalinux.org"
  ];

  for (const instance of instances) {
    try {
      console.log(`📡 Intentando enlace de audio en: ${instance}`);
      const response = await fetch(`${instance}/streams/${videoId}`);
      
      if (!response.ok) continue;

      const data = await response.json();
      const audioStream = data.audioStreams?.find(s => s.mimeType?.includes('audio/webm')) || data.audioStreams?.[0];

      if (audioStream && audioStream.url) {
        console.log("✅ ¡Música desencriptada con éxito!");
        return res.redirect(audioStream.url);
      }
    } catch (err) {
      console.warn(`⚠️ Espejo ${instance} saturado. Cambiando...`);
    }
  }

  res.status(500).send("Todos los servidores de audio están ocupados. Intenta de nuevo.");
});

/* ==========================================================================
🚀 INICIALIZACIÓN
========================================================================== */
app.listen(PORT, "0.0.0.0", () => {
  console.log(`|===================================================|`);
  console.log(`| 🚀 MOTOR XENIA PRO CORRIENDO EN PORT ${PORT} |`);
  console.log(`|===================================================|`);
});

