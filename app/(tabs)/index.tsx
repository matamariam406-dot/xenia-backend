import React, { useState } from 'react';
import { 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions, 
  ActivityIndicator 
} from 'react-native';
import { Image } from 'expo-image';
import { Audio } from 'expo-av';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';

const { width } = Dimensions.get('window');

// 📊 CATÁLOGO GLOBAL DINÁMICO DE ALTA GAMA (Música Actual y Real)
const SPOTIFY_STYLE_DATABASE = [
  {
    id: "1",
    title: "Ambiente (Estreno Mundial)",
    artist: "J Balvin",
    album: "Rayo",
    category: "Novedades",
    bannerUrl: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17", 
    streamQuery: "J Balvin - Ambiente Rayo Oficial",
    isHero: true
  },
  {
    id: "2",
    title: "Un Preview",
    artist: "Bad Bunny",
    album: "Nadie sabe lo que va a pasar mañana",
    category: "Tendencias",
    bannerUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4",
    streamQuery: "Bad Bunny - Un Preview Oficial",
    isHero: false
  },
  {
    id: "3",
    title: "Ella Baila Sola",
    artist: "Eslabón Armado x Peso Pluma",
    album: "Desvelado",
    category: "Tendencias",
    bannerUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819",
    streamQuery: "Eslabon Armado Peso Pluma Ella Baila Sola",
    isHero: false
  },
  {
    id: "4",
    title: "Madonna",
    artist: "Natanael Cano x Oscar Maydon",
    album: "Nata Montana",
    category: "Novedades",
    bannerUrl: "https://images.unsplash.com/photo-1511735111819-9a3f7709049c",
    streamQuery: "Natanael Cano Oscar Maydon Madonna",
    isHero: false
  }
];

export default function HomeScreen() {
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loadingTrackId, setLoadingTrackId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('Todos');

  // 🛰️ DISPARADOR NATIVO DEL REPRODUCTOR (Puente directo al raspador en Termux Puerto 5000)
  const handlePlayTrack = async (track: any) => {
    try {
      if (currentTrack?.id === track.id) {
        // Lógica simple de pausa/play si es el mismo track
        setIsPlaying(!isPlaying);
        return;
      }

      setLoadingTrackId(track.id);
      console.log(`[AuroraXenia Reproductor] Localizando stream para: ${track.title}`);

      // Fetch directo a tu script de Python en segundo plano
      const response = await fetch(`http://192.168.0.54:5000/search?q=${encodeURIComponent(track.streamQuery)}`);

      const data = await response.json();

      if (data && data.audio_url) {
        console.log("[AuroraXenia Reproductor] Stream enrutado con éxito:", data.audio_url);
        setCurrentTrack(track);
        setIsPlaying(true);
        
        // Aquí se inyecta el stream directo al núcleo de Audio ya protegido
        // await Audio.Sound.createAsync({ uri: data.audio_url }, { shouldPlay: true });
      } else {
        // Respaldo visual si estás probando con el servidor de Python offline
        console.log("[AuroraXenia] Modo simulación activado para pruebas de interfaz.");
        setCurrentTrack(track);
        setIsPlaying(true);
      }
    } catch (error) {
      console.log("[AuroraXenia] Error al enlazar stream, corriendo simulación premium:", error);
      setCurrentTrack(track);
      setIsPlaying(true);
    } finally {
      setLoadingTrackId(null);
    }
  };

  // Filtrar el Hero Banner de J Balvin de manera exclusiva
  const heroTrack = SPOTIFY_STYLE_DATABASE.find(t => t.isHero);
  // Filtrar las secciones
  const novedadesTracks = SPOTIFY_STYLE_DATABASE.filter(t => t.category === "Novedades" && !t.isHero);
  const tendenciasTracks = SPOTIFY_STYLE_DATABASE.filter(t => t.category === "Tendencias");

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* HEADER SUPERIOR */}
        <ThemedView style={styles.headerRow}>
          <ThemedText style={styles.brandText}>AURORA<ThemedText style={styles.brandAccent}>XENIA</ThemedText></ThemedText>
          <TouchableOpacity style={styles.profileButton}>
            <IconSymbol name="person.crop.circle.fill" size={26} color="#FF5500" />
          </TouchableOpacity>
        </ThemedView>

        {/* FILTROS RÁPIDOS DE ESTILO */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
          {['Todos', 'Urbano', 'Corridos', 'Estrenos'].map((filter) => (
            <TouchableOpacity 
              key={filter} 
              style={[styles.filterTab, activeFilter === filter && styles.filterTabActive]}
              onPress={() => setActiveFilter(filter)}
            >
              <ThemedText style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>{filter}</ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 🌟 HERO BANNER: ESTRENO MUNDIAL J BALVIN */}
        {heroTrack && (
          <TouchableOpacity 
            style={styles.heroCard} 
            activeOpacity={0.9}
            onPress={() => handlePlayTrack(heroTrack)}
          >
            <Image source={{ uri: heroTrack.bannerUrl }} style={styles.heroImage} />
            <ThemedView style={styles.heroOverlay}>
              <ThemedView style={styles.badgeEstreno}>
                <ThemedText style={styles.badgeText}>ESTRENO MUNDIAL</ThemedText>
              </ThemedView>
              <ThemedText style={styles.heroTitle}>{heroTrack.title}</ThemedText>
              <ThemedText style={styles.heroArtist}>{heroTrack.artist} • {heroTrack.album}</ThemedText>
              
              <ThemedView style={styles.heroActionRow}>
                <ThemedView style={styles.playButtonBig}>
                  {loadingTrackId === heroTrack.id ? (
                    <ActivityIndicator size="small" color="#000" />
                  ) : (
                    <IconSymbol name={(currentTrack?.id === heroTrack.id && isPlaying) ? "pause.fill" : "play.fill"} size={20} color="#000" />
                  )}
                </ThemedView>
                <ThemedText style={styles.actionPlayText}>
                  {(currentTrack?.id === heroTrack.id && isPlaying) ? "Pausar Reproducción" : "Escuchar Ahora"}
                </ThemedText>
              </ThemedView>
            </ThemedView>
          </TouchableOpacity>
        )}

        {/* SECCIÓN 1: LANZAMIENTOS MÁS NUEVOS */}
        <ThemedView style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Lanzamientos más nuevos</ThemedText>
        </ThemedView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {novedadesTracks.map((track) => (
            <TouchableOpacity key={track.id} style={styles.musicCardSquare} activeOpacity={0.8} onPress={() => handlePlayTrack(track)}>
              <Image source={{ uri: track.bannerUrl }} style={styles.cardSquareImage} />
              {loadingTrackId === track.id && (
                <ThemedView style={styles.cardLoaderBackground}>
                  <ActivityIndicator size="small" color="#FF5500" />
                </ThemedView>
              )}
              <ThemedText style={styles.cardSquareTitle} numberOfLines={1}>{track.title}</ThemedText>
              <ThemedText style={styles.cardSquareArtist} numberOfLines={1}>{track.artist}</ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* SECCIÓN 2: TENDENCIAS MUNDIALES */}
        <ThemedView style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Tendencias de la semana</ThemedText>
        </ThemedView>
        <ThemedView style={styles.verticalList}>
          {tendenciasTracks.map((track) => (
            <TouchableOpacity key={track.id} style={styles.trackRowListItem} activeOpacity={0.7} onPress={() => handlePlayTrack(track)}>
              <Image source={{ uri: track.bannerUrl }} style={styles.rowListImage} />
              <ThemedView style={styles.rowListInfo}>
                <ThemedText style={styles.rowListTitle} numberOfLines={1}>{track.title}</ThemedText>
                <ThemedText style={styles.rowListArtist} numberOfLines={1}>{track.artist}</ThemedText>
              </ThemedView>
              <ThemedView style={styles.rowActionZone}>
                {loadingTrackId === track.id ? (
                  <ActivityIndicator size="small" color="#FF5500" />
                ) : (
                  <IconSymbol 
                    name={(currentTrack?.id === track.id && isPlaying) ? "pause.fill" : "play.fill"} 
                    size={18} 
                    color={(currentTrack?.id === track.id && isPlaying) ? "#FF5500" : "#888"} 
                  />
                )}
              </ThemedView>
            </TouchableOpacity>
          ))}
        </ThemedView>

      </ScrollView>

      {/* 🎛️ CONTROL FLOTANTE MINIMALISTA (Aparece solo cuando hay música seleccionada) */}
      {currentTrack && (
        <ThemedView style={styles.floatingPlayer}>
          <Image source={{ uri: currentTrack.bannerUrl }} style={styles.floatingTrackImage} />
          <ThemedView style={styles.floatingTrackInfo}>
            <ThemedText style={styles.floatingTrackTitle} numberOfLines={1}>{currentTrack.title}</ThemedText>
            <ThemedText style={styles.floatingTrackArtist} numberOfLines={1}>{currentTrack.artist}</ThemedText>
          </ThemedView>
          <TouchableOpacity style={styles.floatingControlBtn} onPress={() => setIsPlaying(!isPlaying)}>
            <IconSymbol name={isPlaying ? "pause.fill" : "play.fill"} size={22} color="#FFF" />
          </TouchableOpacity>
        </ThemedView>
      )}

    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  scrollContent: {
    paddingBottom: 110,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'between',
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  brandText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 2,
    fontFamily: Fonts.mono,
  },
  brandAccent: {
    color: '#FF5500',
  },
  profileButton: {
    padding: 4,
  },
  // Filtros
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    backgroundColor: 'transparent',
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#161616',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#222',
  },
  filterTabActive: {
    backgroundColor: '#FF550020',
    borderColor: '#FF550060',
  },
  filterText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#FF5500',
  },
  // 🔥 ESTILOS DEL HERO CARD (J BALVIN)
  heroCard: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 30,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#111',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.65)',
    padding: 20,
    justifyContent: 'end',
  },
  badgeEstreno: {
    backgroundColor: '#FF5500',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#000',
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  heroArtist: {
    fontSize: 14,
    color: '#CCC',
    marginTop: 4,
  },
  heroActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    backgroundColor: 'transparent',
  },
  playButtonBig: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF5500',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionPlayText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 12,
  },
  // Secciones Generales
  sectionHeader: {
    marginBottom: 14,
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#FFF',
    letterSpacing: 0.3,
  },
  horizontalScroll: {
    marginBottom: 28,
    backgroundColor: 'transparent',
  },
  // Tarjetas Cuadradas
  musicCardSquare: {
    width: 140,
    marginRight: 16,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  cardSquareImage: {
    width: 140,
    height: 140,
    borderRadius: 12,
    backgroundColor: '#161616',
  },
  cardLoaderBackground: {
    ...StyleSheet.absoluteFillObject,
    height: 140,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardSquareTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    marginTop: 8,
  },
  cardSquareArtist: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  // Listas Verticales
  verticalList: {
    gap: 12,
    backgroundColor: 'transparent',
  },
  trackRowListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111111',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1C1C1C',
  },
  rowListImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  rowListInfo: {
    flex: 1,
    marginLeft: 14,
    backgroundColor: 'transparent',
  },
  rowListTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },
  rowListArtist: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  rowActionZone: {
    paddingHorizontal: 8,
    backgroundColor: 'transparent',
  },
  // 🎛️ FLOATING PLAYER BOTTOM
  floatingPlayer: {
    position: 'absolute',
    bottom: 15,
    left: 16,
    right: 16,
    height: 64,
    backgroundColor: '#161616',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FF550030',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 8,
  },
  floatingTrackImage: {
    width: 44,
    height: 44,
    borderRadius: 8,
  },
  floatingTrackInfo: {
    flex: 1,
    marginLeft: 12,
    backgroundColor: 'transparent',
  },
  floatingTrackTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
  floatingTrackArtist: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  floatingControlBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  }
});

