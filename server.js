import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import fetch from "node-fetch";
// 🔥 1. Importación correcta de la librería usando ES Modules
import YouTube from "youtube-sr"; 

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const MEMORY_FILE = "./memory.json";

/* ==========================================================================
   🔍 MOTOR AUTÓNOMO DE BÚSQUEDA WEB (Dependency-Free Scraper)
   ========================================================================== */
async function performWebSearch(query) {
  console.log(`🌐 [XENIA ENGINE] Investigando en la Web: "${query}"...`);
  try {
    const response = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
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
      const urlMatch = block.match(/href="([^"]+)"/);

      if (titleMatch && snippetMatch) {
        const title = titleMatch[1].replace(/<[^>]*>/g, "").trim();
        const snippet = snippetMatch[1].replace(/<[^>]*>/g, "").trim();
        let url = urlMatch ? urlMatch[1] : "";

        if (url.includes("uddg=")) {
          const parts = url.split("uddg=");
          if (parts[1]) url = decodeURIComponent(parts[1].split("&")[0]);
        }
        results.push({ title, snippet, url });
      }
    }
    return results.length > 0 ? results : [{ title: "Sin resultados", snippet: "No se encontraron datos en la red." }];
  } catch (err) {
    console.error("Fallo crítico en módulo de rastreo:", err);
    return [{ title: "Fallo de consulta", snippet: "La búsqueda web falló temporalmente por timeout." }];
  }
}

/* ==========================================================================
   🧠 PROMPT DEL SISTEMA: CONTROL COGNITIVO ABSOLUTO
   ========================================================================== */
const SYSTEM_PROMPT = {
  role: "system",
  content: `Eres Xenia, la inteligencia artificial de nivel élite, ultra-coherente, rápida y con precisión industrial. Eres la asistente personal de César.

REGLAS INQUEBRANTABLES DE COHERENCIA:
1. Tienes TERMINANTEMENTE PROHIBIDO alucinar, inventar noticias absurdas, mitos falsos o datos sin fundamentos.
2. Mantén un tono profesional, tecnológico, sumamente inteligente y leal a César.
3. Responde siempre en formato Markdown limpio y estilizado.

PROTOCOLO AGENTIC (INTERCEPCIÓN DE COMANDOS):
- Si César te pide información que requiera datos en tiempo real, noticias del día, clima actual, eventos recientes o verificación de hechos reales, DEBES responder ÚNICAMENTE con este formato JSON exacto:
{"tool": "web_search", "query": "tu término de búsqueda aquí"}

- Si César te pide abrir una aplicación móvil en su dispositivo (ej: whatsapp, spotify, facebook, youtube), DEBES responder ÚNICAMENTE con este bloque JSON exacto:
{"tool": "open_app", "appName": "nombre_de_la_app"}

No agregues saludos ni explicaciones previas ni posteriores si vas a invocar una herramienta JSON. Sé directo.`
};

/* ==========================================================================
   🚀 HEALTH ENDPOINT
   ========================================================================== */
app.get("/", (req, res) => {
  res.json({ status: "Xenia AGENTIC PRO 🚀 activo" });
});

/* ==========================================================================
   🧠 CHAT ORQUESTADOR DE AGENTES (STREAMING REAL CON INYECCIÓN TEMPORAL)
   ========================================================================== */
app.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: "messages inválido" });
    }

    const cleanHistory = messages
      .filter(m => m?.role && m?.content)
      .map(({ role, content }) => ({ role, content }));

    const mxDate = new Date().toLocaleString("es-MX", { timeZone: "America/Monterrey" });

    const ENHANCED_SYSTEM_PROMPT = {
      role: "system",
      content: `${SYSTEM_PROMPT.content}

[CONTEXTO TEMPORAL CRÍTICO]:
- La fecha y hora actual real en el entorno del usuario es: ${mxDate}.
- Si César te pregunta la hora o el día, respóndele DIRECTAMENTE usando estos datos. No uses la herramienta web_search para el tiempo actual.

[REGLA DE VERIFICACIÓN]:
- Si te pregunta por autores de canciones, datos históricos o eventos donde dudes un 1% de la respuesta, estás OBLIGADO a usar la herramienta {"tool": "web_search", "query": "..."} para no alucinar.`
    };

    const finalMessages = [ENHANCED_SYSTEM_PROMPT, ...cleanHistory];

    // ⚠️ NOTA: Aquí va toda tu lógica de Groq y streaming que se cortó en tu mensaje
    // Asegúrate de pegar esa sección aquí con cuidado para no romper las llaves.

    res.end();
  } catch (err) {
    console.error("Fallo crítico en el enrutador /chat:", err);
    res.end();
  }
});

/* ==========================================================================
   🎵 MOTOR DE BÚSQUEDA DE MÚSICA (Anti-Bloqueos Render)
   ========================================================================== */
// 🔥 2. Aquí va la ruta nueva de búsqueda, limpia y devolviendo siempre JSON
app.get("/search", async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ error: "Falta el parámetro de búsqueda" });
    }

    console.log(`🎵 [XENIA ENGINE] Buscando música para: "${query}"...`);

    const videos = await YouTube.search(query, { limit: 5, type: "video" });
    
    if (!videos || videos.length === 0) {
      return res.json({ videos: [] });
    }

    const formattedVideos = videos.map(v => ({
      id: v.id,
      title: v.title,
      // API conversora directa para que el reproductor no sufra
      url: `https://convert.qubby.dev/download?id=${v.id}` 
    }));

    res.setHeader('Content-Type', 'application/json');
    return res.json({ videos: formattedVideos });

  } catch (error) {
    console.error("❌ Fallo en módulo de música:", error);
    return res.status(500).json({ videos: [], error: error.message });
  }
});

/* ============================================================================
   📥 MOTOR DE AUDIO ULTRA-PREMIUM: MUSIC PRO X (Arquitectura Nivel Mundial)
   ============================================================================ */
app.get('/music/home', (req, res) => {
  const currentHour = new Date().getHours();
  let dynamicGreeting = "Buenas noches";
  if (currentHour >= 5 && currentHour < 12) dynamicGreeting = "Buenos días";
  else if (currentHour >= 12 && currentHour < 19) dynamicGreeting = "Buenas tardes";

  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=600');
  res.setHeader('X-Engine-Version', 'Xenia-Ultra-v2.0');

  res.status(200).json({
    meta: {
      status: 200,
      message: "Feed generado exitosamente",
      context: {
        greeting: `${dynamicGreeting}, Controlador.`,
        systemStatus: "OPTIMIZED",
      },
      pagination: {
        nextCursor: "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
        hasMore: true
      }
    },
    data: {
      sections: [
        {
          id: "sec-01-hero",
          type: "HERO_CAROUSEL",
          title: "⚡ Terminal & Scripts",
          items: [
            {
              id: "pl-kali-focus",
              title: "Modo Root: NetHunter",
              description: "Frecuencias lo-fi profundas para automatización y sesiones de código en consola.",
              brandColor: "#00ff00",
              artwork: {
                small: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=150",
                large: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600",
                canvas_video: null
              },
              tracks: [
                {
                  id: "x-root-01",
                  title: "Python & Selenium Vibe",
                  artist: "Xenia Neural Core",
                  album: "Scripting Sessions",
                  stream: {
                    hls: "https://streaming.example.com/hls/selenium/master.m3u8",
                    fallback_mp3: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
                    quality: "LOSSLESS_HI_RES",
                    spatialAudio: true
                  },
                  metadata: {
                    durationMs: 372000,
                    bpm: 95,
                    key: "C_MINOR",
                    isExplicit: false,
                    hasSyncedLyrics: true
                  },
                  ui: { primaryColor: "#0a192f" }
                }
              ]
            }
          ]
        },
        {
          id: "sec-02-industrial",
          type: "GRID_2X2",
          title: "🔥 Taller y Soldadura",
          items: [
            {
              id: "pl-mig-welding",
              title: "MIG & Metal Fabrication",
              description: "Flujo de gas constante. Metal pesado y ritmos densos para la maquinaria.",
              brandColor: "#ff4500",
              artwork: {
                small: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=150",
                large: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=600"
              },
              tracks: [
                {
                  id: "x-weld-01",
                  title: "Tungsten Flow",
                  artist: "Industrial Forge",
                  album: "Warehouse Echoes",
                  stream: {
                    hls: "https://streaming.example.com/hls/tungsten/master.m3u8",
                    fallback_mp3: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
                    quality: "MASTER",
                    spatialAudio: false
                  },
                  metadata: {
                    durationMs: 312000,
                    bpm: 120,
                    key: "D_MINOR",
                    isExplicit: true,
                    hasSyncedLyrics: false
                  },
                  ui: { primaryColor: "#1a0b0b" }
                }
              ]
            }
          ]
        },
        {
          id: "sec-03-local",
          type: "HORIZONTAL_LIST",
          title: "🌲 Rutas y Desconexión",
          items: [
            {
              id: "pl-arteaga-nights",
              title: "Noches de Niebla en Arteaga",
              description: "Atmósferas frías y graves profundos para el trayecto nocturno.",
              brandColor: "#1e3a8a",
              artwork: {
                small: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=150",
                large: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600"
              },
              tracks: [
                {
                  id: "x-arteaga-01",
                  title: "Sierra Fría",
                  artist: "Valle Sur",
                  album: "Rutas",
                  stream: {
                    hls: "https://streaming.example.com/hls/sierra/master.m3u8",
                    fallback_mp3: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
                    quality: "HIGH",
                    spatialAudio: true
                  },
                  metadata: {
                    durationMs: 245000,
                    bpm: 85,
                    key: "A_MINOR",
                    isExplicit: false,
                    hasSyncedLyrics: true
                  },
                  ui: { primaryColor: "#051024" }
                }
              ]
            }
          ]
        }
      ]
    }
  });
});

/* ==========================================================================
   🚀 INICIALIZACIÓN DE SERVIDOR INDUSTRIAL
   ========================================================================== */
app.listen(PORT, "0.0.0.0", () => {
  console.log(`|===================================================|`);
  console.log(`| 🚀 MOTOR COGNITIVO XENIA PRO CORRIENDO EN PORT ${PORT} |`);
  console.log(`|===================================================|`);
});

