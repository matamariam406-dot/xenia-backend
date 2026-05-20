// services/musicApi.ts

const BASE_URL = "https://xenia-backend-r8if.onrender.com";

// ==========================================
// 1. TIPADOS SUPREMOS (Nivel Spotify/YT Music)
// ==========================================
export type StreamQuality = "LOW" | "NORMAL" | "HIGH" | "MASTER";

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  url: string;
  artwork: string;
  durationMs: number; // Duración exacta para la barra de progreso
  isExplicit: boolean; // Tag [E] estilo Spotify
  quality: StreamQuality;
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  tracks: Track[];
}

export interface HomeFeed {
  sections: {
    title: string;
    items: Playlist[];
  }[];
}

// ==========================================
// 2. SISTEMA DE CACHÉ EN MEMORIA
// ==========================================
// Evita peticiones repetidas si el usuario navega entre pantallas
const memoryCache: { [endpoint: string]: { data: any; timestamp: number } } = {};
const CACHE_TTL = 1000 * 60 * 5; // 5 minutos de vida para el caché

// ==========================================
// 3. NÚCLEO DEL MOTOR API (Xenia Music Engine)
// ==========================================
class XeniaMusicEngine {
  /**
   * Petición blindada con Timeout. Evita que la app se congele si el server no responde.
   */
  private async fetchWithTimeout(endpoint: string, options: RequestInit = {}, timeout = 8000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(id);
      return response;
    } catch (error: any) {
      clearTimeout(id);
      if (error.name === "AbortError") throw new Error("Timeout: El servidor tardó demasiado.");
      throw error;
    }
  }

  /**
   * Obtiene la estructura principal para la pantalla de inicio (Categorías)
   */
  async getHomeFeed(): Promise<HomeFeed> {
    const endpoint = "/music/home";
    
    // 1. Revisar Caché
    if (memoryCache[endpoint] && Date.now() - memoryCache[endpoint].timestamp < CACHE_TTL) {
      return memoryCache[endpoint].data;
    }

    try {
      const res = await this.fetchWithTimeout(endpoint);
      if (!res.ok) throw new Error("Error en el stream neural");
      
      const data = await res.json();
      
      // Guardar en caché
      memoryCache[endpoint] = { data, timestamp: Date.now() };
      return data;
      
    } catch (error) {
      console.warn("⚠️ Fallback activado: Cargando matriz musical de seguridad...");
      return this.getFallbackFeed();
    }
  }

  /**
   * Motor de Búsqueda de alta velocidad
   */
  async searchTracks(query: string): Promise<Track[]> {
    if (!query.trim()) return [];
    try {
      const res = await this.fetchWithTimeout(`/music/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      return data.results || [];
    } catch {
      return []; // Si falla, retorna vacío para no romper la UI
    }
  }

  // ==========================================
  // 4. DATOS DE RESPALDO (Diseño Offline)
  // ==========================================
  private getFallbackFeed(): HomeFeed {
    const trackMock1: Track = {
      id: "trk-01",
      title: "Terminal Hacking Lofi",
      artist: "Xenia Neural Core",
      album: "Cyber Scripts",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      artwork: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5",
      durationMs: 245000,
      isExplicit: false,
      quality: "MASTER"
    };

    const trackMock2: Track = {
      id: "trk-02",
      title: "Industrial Metal & Flow",
      artist: "Warehouse Engine",
      album: "Heavy Fabrication Vol. 1",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
      artwork: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122",
      durationMs: 312000,
      isExplicit: true,
      quality: "HIGH"
    };

    const trackMock3: Track = {
      id: "trk-03",
      title: "Noches en Arteaga",
      artist: "Sierra Sierra",
      album: "Atmósferas",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      artwork: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b",
      durationMs: 198000,
      isExplicit: false,
      quality: "HIGH"
    };

    return {
      sections: [
        {
          title: "Generado para ti",
          items: [
            {
              id: "pl-1",
              title: "Focus Mode: Root Access",
              description: "Ritmos profundos para escribir código y automatizar sistemas.",
              coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe",
              tracks: [trackMock1, trackMock3]
            }
          ]
        },
        {
          title: "Alta Energía",
          items: [
            {
              id: "pl-2",
              title: "Taller y Maquinaria pesada",
              description: "Metal y ritmos contundentes para turnos intensos.",
              coverImage: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
              tracks: [trackMock2]
            }
          ]
        }
      ]
    };
  }
}

// Exportamos una única instancia (Patrón Singleton) para usar en toda la app
export const musicApi = new XeniaMusicEngine();

