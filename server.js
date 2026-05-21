import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import fetch from "node-fetch";
import youtubeSr from "youtube-sr"; 
import ytdl from "@distube/ytdl-core";

// 🔥 Extractor seguro para evitar el error "is not a function" causado por módulos ES6/CommonJS
const searchYouTube = youtubeSr.search || youtubeSr.default?.search || youtubeSr;

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
• Si César te pide información que requiera datos en tiempo real, noticias del día, clima actual, eventos recientes o verificación de hechos reales, DEBES responder ÚNICAMENTE con este formato JSON exacto:
{"tool": "web_search", "query": "tu término de búsqueda aquí"}

• Si César te pide abrir una aplicación móvil en su dispositivo (ej: whatsapp, spotify, facebook, youtube), DEBES responder ÚNICAMENTE con este bloque JSON exacto:
{"tool": "open_app", "appName": "nombre_de_la_app"}

No agregues saludos ni explicaciones previas ni posteriores si vas a invocar una herramienta JSON. Sé directo.`
};

/* ==========================================================================
🚀 HEALTH ENDPOINTS
========================================================================== */
app.get("/health", (req, res) => res.status(200).send("Xenia Server Active"));

app.get("/", (req, res) => {
  res.json({ status: "Xenia AGENTIC PRO 🚀 activo" });
});

/* ==========================================================================
🧠 CHAT ORQUESTADOR DE AGENTES (INTEGRACIÓN IA REAL PARA PRODUCCIÓN)
========================================================================== */
app.post("/chat", async (req, res) => {
  try {
    const { messages, message, prompt } = req.body;

    // Normalización de entrada para soportar cualquier formato del frontend
    let cleanHistory = [];
    if (Array.isArray(messages)) {
      cleanHistory = messages
        .filter(m => m?.role && m?.content)
        .map(({ role, content }) => ({ role, content }));
    } else if (message || prompt) {
      cleanHistory = [{ role: "user", content: message || prompt }];
    } else {
      return res.status(400).json({ error: "Formato de mensaje inválido" });
    }

    const mxDate = new Date().toLocaleString("es-MX", { timeZone: "America/Monterrey" });

    const ENHANCED_SYSTEM_PROMPT = {
      role: "system",
      content: `${SYSTEM_PROMPT.content}

[CONTEXTO TEMPORAL CRÍTICO]:
• La fecha y hora actual real en el entorno del usuario es: ${mxDate}.
• Si César te pregunta la hora o el día, respóndele DIRECTAMENTE usando estos datos. No uses la herramienta web_search para el tiempo actual.

[REGLA DE VERIFICACIÓN]:
• Si te pregunta por autores de canciones, datos históricos o eventos donde dudes un 1% de la respuesta, estás OBLIGADO a usar la herramienta {"tool": "web_search", "query": "..."} para no alucinar.`
    };

    const finalMessages = [ENHANCED_SYSTEM_PROMPT, ...cleanHistory];

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

    if (!responseIA.ok) {
      const errText = await responseIA.text();
      throw new Error(`Groq_API_Error: ${errText}`);
    }

    const aiData = await responseIA.json();
    const replyText = aiData.choices[0]?.message?.content || "No se pudo generar una sinapsis limpia.";

    if (replyText.includes("web_search")) {
       try {
         const jsonCmd = JSON.parse(replyText.trim());
         const searchData = await performWebSearch(jsonCmd.query);

         const finalContextFetch = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              model: "llama-3.3-70b-versatile",
              messages: [...finalMessages, { role: "system", content: `[DATOS EN TIEMPO REAL RECOLECTADOS]: ${JSON.stringify(searchData)}` }]
            })
         });
         const finalJsonData = await finalContextFetch.json();
         return res.status(200).json({ reply: finalJsonData.choices[0].message.content });
       } catch (e) {
         return res.status(200).json({ reply: replyText });
       }
    }

    res.status(200).json({ reply: replyText });

  } catch (err) {
    console.error("Fallo crítico en el enrutador /chat:", err);
    res.status(500).json({ error: "Fallo crítico en el núcleo cognitivo", details: err.message });
  }
});

/* ==========================================================================
🔍 MOTOR DE BÚSQUEDA ANTI-BLOQUEO (Red de Proxies Piped)
========================================================================== */
app.get('/search', async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: 'Falta parámetro q' });

  try {
    console.log(`🎵 [SONIC HD] Bypassing YouTube para: "${query}"...`);

    // Red de servidores proxy antibloqueo (Redundancia táctica)
    const proxyNodes = [
      "https://pipedapi.kavin.rocks",
      "https://pipedapi.smnz.de",
      "https://de-api-piped.mint.lgbt",
      "https://pipedapi.moomoo.me"
    ];

    let results = null;

    // Intentamos golpear cada nodo hasta que uno nos dé la música al instante
    for (const node of proxyNodes) {
      try {
        console.log(`Intentando penetrar vía: ${node}...`);
        const response = await fetch(`${node}/search?q=${encodeURIComponent(query)}&filter=all`, {
            headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
            timeout: 4000 // Si un nodo tarda más de 4s, saltamos al siguiente
        });

        if (response.ok) {
          const data = await response.json();
          if (data.items && data.items.length > 0) {
            results = data.items;
            console.log(`✅ ¡Conexión exitosa en ${node}!`);
            break; // Rompemos el ciclo, ya tenemos los datos
          }
        }
      } catch (err) {
        console.warn(`⚠️ Nodo ${node} no respondió. Cambiando de ruta...`);
      }
    }

    if (!results) {
      throw new Error("Todos los nodos proxy fueron rechazados.");
    }

    // Filtramos solo los que sean videos/canciones y armamos el JSON perfecto para tu App
    const videos = results
      .filter(v => v.url && v.url.includes('/watch?v='))
      .slice(0, 15)
      .map(v => {
        const videoId = v.url.split('v=')[1].split('&')[0]; // Extracción quirúrgica del ID
        return {
          id: videoId,
          title: v.title,
          artist: v.uploaderName || "Desconocido",
          cover: v.thumbnail || `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
        };
      });

    return res.json({ videos: videos });

  } catch (error) {
    console.error("❌ Fallo crítico en el motor proxy:", error.message);
    res.json({ videos: [], error: "No se pudo saltar la seguridad de YouTube." });
  }
});


/* ==========================================================================
📥 MOTOR DE DESCARGA DE AUDIO
========================================================================== */
app.get('/download', async (req, res) => {
  const videoId = req.query.id;
  if (!videoId) return res.status(400).send('Falta ID');

  try {
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    const info = await ytdl.getInfo(url);
    const format = ytdl.chooseFormat(info.formats, { filter: 'audioonly', quality: 'highestaudio' });

    res.redirect(format.url);
  } catch (err) {
    console.error('Error de descarga:', err);
    res.status(500).send('Error al procesar audio');
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

