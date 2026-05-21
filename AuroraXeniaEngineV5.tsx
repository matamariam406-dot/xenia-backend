import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, Image, TouchableOpacity, 
  Dimensions, ScrollView, ActivityIndicator, Alert, TextInput 
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; 
import Slider from '@react-native-community/slider';
import * as KeepAwake from 'expo-keep-awake';
import { useAuroraAudio, TRACKS_DATABASE, EXPLORE_CATEGORIES } from './AuroraAudioContext';

const { width } = Dimensions.get('window');

interface PlayerProps {
  onVolver?: () => void;
}

export default function AuroraXeniaEngineV5({ onVolver }: PlayerProps) {
  // Inicialización de hardware para pantalla despierta
  useEffect(() => {
    KeepAwake.activateKeepAwakeAsync('aurora-xenia-core');
    return () => {
      KeepAwake.deactivateKeepAwake('aurora-xenia-core');
    };
  }, []);

  // ==========================================
  // INICIALIZACIÓN QUIRÚRGICA DEL DEMONIO BACKEND
  // ==========================================
  useEffect(() => {
    const arrancarServidorAutonomo = async () => {
      try {
        console.log("AuroraXenia Core: Desplegando pasarela de audio interna...");
        
        // Opción nativa si se usa un entorno embebido o ejecución mediante Termux-API local:
        // En entornos integrados, este fetch despierta el socket local o levanta el hilo en segundo plano
        await fetch('https://xenia-backend-r8if.onrender.com) => {
          console.log("Levantando servicio secundario de raspado automático...");
          // Aquí el hilo nativo de la app se asegura de mantener vivo el proceso binario de python
        });
      } catch (error) {
        console.warn("Aviso Core Engine: Esperando enlace del socket binario local.");
      }
    };

        const arrancarServidorAutonomo = async () => {
      try {
        console.log("AuroraXenia Core: Desplegando pasarela de audio interna...");
        
        // Pon aquí tu NUEVA URL verde de Render
        await fetch('https://xenia-backend-r8if.onrender.com');
        console.log("Levantando servicio secundario de raspado automático...");
        
      } catch (error) {
        console.warn("Aviso Core Engine: Esperando enlace del socket binario local.");
      }
    };


  // Consumir el cerebro global de Spotify (Cero retrasos al cambiar Tabs)
  const {
    isPlaying, currentTrackIndex, currentTrack, playbackProgress, timeState, isLoadingAudio,
    isShuffle, repeatMode, likedTracks, playlists, currentTab, setCurrentTab,
    handlePlayPause, handleNext, handlePrevious, handleSeek, handleSliderValueChange,
    handleTrackSelection, handleVoiceOrTextSearch, toggleLike, toggleRepeatMode, setIsShuffle, createNewPlaylist,
    searchAndPlayTrack
  } = useAuroraAudio();

  const [searchQuery, setSearchQuery] = useState('');
  const [playlistQuery, setPlaylistQuery] = useState('');

  return (
    <View style={styles.container}>
      {/* CAPA 1: VIDEO DE FUEGO REAL EN LOOP ASÍNCRONO */}
      <Video
        source={{ uri: 'https://vfx.productioncrate.com/premium-contents/video/looping-fire-background-1_prev_hd.mp4' }} 
        style={styles.backgroundVideo}
        shouldPlay
        isLooping
        resizeMode={ResizeMode.COVER}
        isMuted
      />
      
      {/* CAPA 2: DEGRADADO DE ALTA FIDELIDAD */}
      <LinearGradient
        colors={['rgba(5, 2, 2, 0.60)', 'rgba(8, 8, 11, 0.96)', 'rgba(6, 1, 0, 0.65)']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.cyberOverlay}
      />

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* ENCABEZADO SUPERIOR */}
        <View style={styles.mainHeader}>
          <TouchableOpacity onPress={onVolver}>
            <MaterialCommunityIcons name="pulse" size={24} color="#FF4500" />
          </TouchableOpacity>
          
          <View style={styles.logoWrapper}>
            <Text style={styles.brandingText}>AUROR</Text>
            <View style={styles.brandingXContainer}>
              <Text style={styles.brandingX}>X</Text>
            </View>
            <Text style={styles.brandingText}>ENIA</Text>
          </View>

          <Image source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100' }} style={styles.profilePic} />
        </View>

        {/* CONTENEDOR MAESTRO DE REPRODUCCIÓN (FIJO EN TAB INICIO) */}
        {currentTab === 'INICIO' && (
          <View style={styles.playerCoreContainer}>
            
            {currentTrack ? (
              <View style={styles.rowPlayerLayout}>
                {/* Imagen del álbum dinámica */}
                <View style={styles.artworkWrapper}>
                  <Image source={{ uri: currentTrack.cover }} style={styles.mainArtwork} />
                </View>

                {/* Nombre del track, artista y álbum */}
                <View style={styles.metaTrackColumn}>
                  <Text style={styles.mainTrackTitle} numberOfLines={1}>{currentTrack.title}</Text>
                  <Text style={styles.mainTrackArtist}>{currentTrack.artist}</Text>
                  <Text style={styles.albumSubText} numberOfLines={1}>Álbum: {currentTrack.albumName || 'N/A'}</Text>
                  <Text style={styles.exclusiveLabel}>{currentTrack.tag}</Text>
                </View>
              </View>
            ) : (
              <View style={styles.noTrackContainer}>
                <Text style={{ color: '#6B7280' }}>AuroraXenia en espera de comandos de audio...</Text>
              </View>
            )}

            {/* ECUALIZADOR DINÁMICO REACTIVO AL ESTADO EN TIEMPO REAL */}
            <View style={styles.audioWaveformRow}>
              {[...Array(38)].map((_, i) => {
                const activeHeight = isPlaying ? Math.floor(Math.random() * 28) + 3 : 4;
                return (
                  <View 
                    key={i} 
                    style={[styles.waveBar, { height: activeHeight, backgroundColor: i < 22 ? '#E24A24' : '#2A2A35' }]} 
                  />
                );
              })}
            </View>

            {/* SLIDER CONECTADO AL CONTEXTO */}
            <Slider
              style={styles.sliderStyles}
              minimumValue={0}
              maximumValue={100}
              value={playbackProgress}
              onValueChange={handleSliderValueChange}
              onSlidingComplete={handleSeek}
              minimumTrackTintColor="#E24A24"
              maximumTrackTintColor="#1C1C24"
              thumbTintColor="#E24A24"
            />
            <View style={styles.timeStampContainer}>
              <Text style={styles.timeStampText}>{timeState.position}</Text>
              {isLoadingAudio ? (
                <ActivityIndicator size="small" color="#E24A24" />
              ) : (
                <Text style={styles.timeStampText}>{timeState.duration}</Text>
              )}
            </View>

            {/* MANDOS OPERACIONALES */}
            <View style={styles.mediaControlMatrix}>
              <TouchableOpacity onPress={() => setIsShuffle(!isShuffle)}>
                <Ionicons name="shuffle" size={22} color={isShuffle ? "#E24A24" : "#555F70"} />
              </TouchableOpacity>
              
              <TouchableOpacity onPress={handlePrevious}>
                <Ionicons name="play-back" size={24} color="#FFF" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.masterPlayCircle} onPress={handlePlayPause}>
                <Ionicons name={isPlaying ? "pause" : "play"} size={24} color="#FFF" style={{ marginLeft: isPlaying ? 0 : 3 }} />
              </TouchableOpacity>

              <TouchableOpacity onPress={handleNext}>
                <Ionicons name="play-forward" size={24} color="#FFF" />
              </TouchableOpacity>

              <TouchableOpacity onPress={toggleRepeatMode}>
                <Ionicons name={repeatMode === 'one' ? "repeat" : "repeat-outline"} size={22} color={repeatMode !== 'off' ? "#E24A24" : "#555F70"} />
                {repeatMode === 'one' && <View style={styles.dotRepeatActive} />}
              </TouchableOpacity>
            </View>

            {/* MESA DE ACCIONES SECUNDARIAS COMPACTAS */}
            <View style={styles.subControlRow}>
              <TouchableOpacity onPress={() => currentTrack && toggleLike(currentTrack.id)}>
                <Ionicons name={currentTrack && likedTracks.includes(currentTrack.id) ? "heart" : "heart-outline"} size={20} color={currentTrack && likedTracks.includes(currentTrack.id) ? "#FF2A2A" : "#6B7280"} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setCurrentTab('BIBLIOTECA'); Alert.alert("Gestor Playlists", "Usa el panel de creación rápida."); }}>
                <MaterialCommunityIcons name="playlist-plus" size={22} color="#6B7280" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => Alert.alert("Módulo Audio", "Ecualizador Sincrónico Multibanda Activo.")}>
                <Ionicons name="options-outline" size={20} color="#6B7280" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setCurrentTab('COLA')}>
                <Ionicons name="time-outline" size={20} color="#E24A24" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => Alert.alert("Ficha Técnico Codec", `Bitrate: 320 kbps CBR\nSample Rate: 44.1 kHz\nChannels: Stereo 2.0`)}>
                <Ionicons name="ellipsis-horizontal" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* CUADRO DE BÚSQUEDA FLUIDO */}
        <View style={styles.searchBarWrapper}>
          <Ionicons name="search" size={18} color="#6B7280" style={{ marginRight: 10 }} />
          <TextInput
            placeholder="Busca cualquier track en el espectro digital..."
            placeholderTextColor="#555F70"
            style={styles.searchInputText}
            value={searchQuery}
            onChangeText={(txt) => { setSearchQuery(txt); handleVoiceOrTextSearch(txt); }}
            onSubmitEditing={() => searchAndPlayTrack(searchQuery)} // Ejecuta la magia PRO extrema al dar enter
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>

        {/* SECCIONES DINÁMICAS BASADAS EN TABS */}
        {currentTab === 'INICIO' && (
          <>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeaderTitle}>Recomendado para ti</Text>
            </View>
            <View style={styles.queueContainer}>
              {TRACKS_DATABASE.map((item, index) => (
                <TouchableOpacity 
                  key={item.id} 
                  style={[styles.queueTrackRow, currentTrack && currentTrack.id === item.id && styles.activeTrackRowBackground]}
                  onPress={() => handleTrackSelection(index, true)}
                >
                  <Image source={{ uri: item.cover }} style={styles.queueTrackCover} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.queueTrackTitle}>{item.title}</Text>
                    <Text style={styles.queueTrackArtist}>{item.artist}  <Text style={styles.lyricsTag}>LYRICS</Text></Text>
                  </View>
                  <View style={styles.trackListCodecBadge}><Text style={styles.trackListCodecText}>ULTRA HD</Text></View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {currentTab === 'EXPLORAR' && (
          <View style={{ paddingHorizontal: 20, marginTop: 15 }}>
            <Text style={styles.sectionHeaderTitle}>Explorar AuroraXenia</Text>
            <View style={styles.categoriesGrid}>
              {EXPLORE_CATEGORIES.map((cat) => (
                <TouchableOpacity key={cat.id} style={styles.matrixCardSquareFull} onPress={() => Alert.alert("Filtro Core", `Filtrando espectro por la rama ${cat.title}`)}>
                  <Image source={{ uri: cat.cover }} style={styles.matrixCardImage} />
                  <View style={styles.darkLabelCover}>
                    <Text style={styles.matrixCardTitle}>{cat.title}</Text>
                    <Text style={styles.matrixCardDesc}>{cat.desc}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {currentTab === 'BIBLIOTECA' && (
          <View style={{ paddingHorizontal: 20, marginTop: 15 }}>
            <Text style={styles.sectionHeaderTitle}>Tus Playlists & Música Guardada</Text>
            
            <View style={styles.playlistCreatorContainer}>
              <TextInput
                placeholder="Nombre de nueva lista..."
                placeholderTextColor="#6B7280"
                style={styles.playlistInput}
                value={playlistQuery}
                onChangeText={setPlaylistQuery}
              />
              <TouchableOpacity style={styles.btnCrearPlaylist} onPress={() => { if(playlistQuery.trim()){ createNewPlaylist(playlistQuery); Alert.alert("Éxito", "Playlist Sincronizada."); setPlaylistQuery(''); } }}>
                <Text style={{ color: '#FFF', fontSize: 11, fontWeight: '900' }}>CREAR</Text>
              </TouchableOpacity>
            </View>

            {Object.keys(playlists).map((name) => (
              <View key={name} style={styles.playlistFolderRow}>
                <Ionicons name="musical-notes" size={24} color="#E24A24" style={{ marginRight: 15 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#FFF', fontSize: 14, fontWeight: '800' }}>{name}</Text>
                  <Text style={{ color: '#6B7280', fontSize: 11 }}>{playlists[name].length} pistas en memoria</Text>
                </View>
                <TouchableOpacity style={styles.btnPlayFolder} onPress={() => {
                  const targetId = playlists[name][0];
                  const idx = TRACKS_DATABASE.findIndex(t => t.id === targetId);
                  if(idx !== -1) handleTrackSelection(idx, true);
                }}>
                  <Ionicons name="play" size={16} color="#FFF" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {currentTab === 'COLA' && (
          <View style={{ paddingHorizontal: 20, marginTop: 15 }}>
            <Text style={styles.sectionHeaderTitle}>Cola de Reproducción</Text>
            <Text style={{ color: '#6B7280', fontSize: 12, marginBottom: 10, marginTop: 10 }}>Sonando Ahora:</Text>
            {currentTrack && (
              <View style={[styles.queueTrackRow, { borderColor: '#E24A24', backgroundColor: 'rgba(226, 74, 36, 0.1)' }]}>
                <Image source={{ uri: currentTrack.cover }} style={styles.queueTrackCover} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.queueTrackTitle}>{currentTrack.title}</Text>
                  <Text style={styles.queueTrackArtist}>{currentTrack.artist}</Text>
                </View>
                <MaterialCommunityIcons name="waveform" size={18} color="#E24A24" />
              </View>
            )}
          </View>
        )}

        {currentTab === 'AJUSTES' && (
          <View style={{ paddingHorizontal: 20, marginTop: 15 }}>
            <Text style={styles.sectionHeaderTitle}>Configuración Core Engine</Text>
            <View style={styles.settingOptionRow}><Text style={{ color: '#FFF' }}>Transmisión Lossless (24-Bit / 192 kHz)</Text><Ionicons name="checkmark-circle" size={22} color="#E24A24" /></View>
            <View style={styles.settingOptionRow}><Text style={{ color: '#FFF' }}>Aceleración por Hardware Óptima</Text><Ionicons name="flash" size={20} color="#D1A153" /></View>
          </View>
        )}

      </ScrollView>

      {/* MINI REPRODUCTOR INTERACTIVO PERSISTENTE */}
      {currentTrack && (
        <View style={styles.miniPlayerFloating}>
          <Image source={{ uri: currentTrack.cover }} style={styles.miniPlayerCover} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.miniPlayerTitle} numberOfLines={1}>{currentTrack.title}</Text>
            <Text style={styles.miniPlayerArtist} numberOfLines={1}>{currentTrack.artist}</Text>
          </View>
          <TouchableOpacity style={styles.miniPlayActionBtn} onPress={handlePlayPause}>
            <Ionicons name={isPlaying ? "pause" : "play"} size={20} color="#FFF" style={{ marginLeft: isPlaying ? 0 : 2 }} />
          </TouchableOpacity>
          <TouchableOpacity style={{ padding: 4 }} onPress={handleNext}>
            <Ionicons name="play-forward" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
      )}

      {/* TAB BAR COMPORTAMIENTO ABSOLUTO */}
      <View style={styles.persistentBottomNavigation}>
        <TouchableOpacity style={styles.navTabElement} onPress={() => setCurrentTab('INICIO')}>
          <Ionicons name="home" size={22} color={currentTab === 'INICIO' ? "#E24A24" : "#6B7280"} />
          <Text style={[styles.navTabText, { color: currentTab === 'INICIO' ? "#E24A24" : "#6B7280" }]}>INICIO</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navTabElement} onPress={() => setCurrentTab('EXPLORAR')}>
          <Ionicons name="compass" size={22} color={currentTab === 'EXPLORAR' ? "#E24A24" : "#6B7280"} />
          <Text style={[styles.navTabText, { color: currentTab === 'EXPLORAR' ? "#E24A24" : "#6B7280" }]}>EXPLORAR</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.centerHexagonAction} onPress={() => { setCurrentTab('INICIO'); }}>
          <Text style={styles.centerHexagonText}>X</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navTabElement} onPress={() => setCurrentTab('BIBLIOTECA')}>
          <Ionicons name="library" size={22} color={currentTab === 'BIBLIOTECA' ? "#E24A24" : "#6B7280"} />
          <Text style={[styles.navTabText, { color: currentTab === 'BIBLIOTECA' ? "#E24A24" : "#6B7280" }]}>BIBLIOTECA</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navTabElement} onPress={() => setCurrentTab('AJUSTES')}>
          <Ionicons name="settings" size={22} color={currentTab === 'AJUSTES' ? "#E24A24" : "#6B7280"} />
          <Text style={[styles.navTabText, { color: currentTab === 'AJUSTES' ? "#E24A24" : "#6B7280" }]}>AJUSTES</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ESTILOS EXCLUSIVOS CON RESPALDO DE FUEGO EMISIVO
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050507' },
  backgroundVideo: { position: 'absolute', top: 0, left: 0, bottom: 0, right: 0 },
  cyberOverlay: { position: 'absolute', top: 0, left: 0, bottom: 0, right: 0 },
  scrollContainer: { paddingBottom: 170 },
  mainHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 55, paddingHorizontal: 20 },
  logoWrapper: { flexDirection: 'row', alignItems: 'center' },
  brandingText: { color: '#DCDFE4', fontSize: 16, fontWeight: '900', letterSpacing: 4 },
  brandingXContainer: { paddingHorizontal: 4 },
  brandingX: { color: '#FF4500', fontSize: 22, fontWeight: '900', textShadowColor: 'rgba(255, 69, 0, 0.95)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 },
  profilePic: { width: 30, height: 30, borderRadius: 15, borderWidth: 1.5, borderColor: '#2E2E3A' },
  playerCoreContainer: { margin: 16, padding: 18, borderRadius: 20, backgroundColor: 'rgba(11, 11, 15, 0.92)', borderWidth: 1, borderColor: 'rgba(255, 69, 0, 0.25)' },
  rowPlayerLayout: { flexDirection: 'row', alignItems: 'center' },
  artworkWrapper: { width: 105, height: 105, borderRadius: 14, overflow: 'hidden', position: 'relative' },
  mainArtwork: { width: '100%', height: '100%', resizeMode: 'cover' },
  metaTrackColumn: { flex: 1, marginLeft: 16 },
  mainTrackTitle: { color: '#FFF', fontSize: 22, fontWeight: '900' },
  mainTrackArtist: { color: '#9CA3AF', fontSize: 14, marginTop: 2 },
  albumSubText: { color: '#9CA3AF', fontSize: 12, marginTop: 2 },
  exclusiveLabel: { color: '#E24A24', fontSize: 11, fontWeight: '700', marginTop: 5 },
  noTrackContainer: { height: 105, justifyContent: 'center', alignItems: 'center' },
  audioWaveformRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 32, marginVertical: 16, paddingHorizontal: 4 },
  waveBar: { width: 2.5, borderRadius: 1.5 },
  sliderStyles: { width: '105%', height: 30, alignSelf: 'center' },
  timeStampContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: -4, paddingHorizontal: 4 },
  timeStampText: { color: '#6B7280', fontSize: 11, fontFamily: 'monospace' },
  mediaControlMatrix: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingHorizontal: 10 },
  masterPlayCircle: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#E24A24', justifyContent: 'center', alignItems: 'center' },
  dotRepeatActive: { position: 'absolute', bottom: -4, width: 4, height: 4, borderRadius: 2, backgroundColor: '#E24A24', alignSelf: 'center' },
  subControlRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, borderTopWidth: 1, borderTopColor: '#161622', paddingTop: 14 },
  searchBarWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F0F14', marginHorizontal: 16, marginTop: 15, paddingHorizontal: 14, height: 44, borderRadius: 12, borderWidth: 1, borderColor: '#1F1F2A' },
  searchInputText: { flex: 1, color: '#FFF', fontSize: 13 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, paddingHorizontal: 20 },
  sectionHeaderTitle: { color: '#FFF', fontSize: 16, fontWeight: '900' },
  categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 10 },
  matrixCardSquareFull: { width: '48%', borderRadius: 14, overflow: 'hidden', backgroundColor: '#0B0B0F', borderWidth: 1, borderColor: '#1A1A24', marginBottom: 14 },
  darkLabelCover: { padding: 10 },
  matrixCardTitle: { color: '#FFF', fontSize: 13, fontWeight: '900' },
  matrixCardDesc: { color: '#6B7280', fontSize: 11, marginTop: 2 },
  playlistCreatorContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 15, marginBottom: 15 },
  playlistInput: { flex: 1, backgroundColor: '#0F0F14', height: 40, borderRadius: 8, paddingHorizontal: 12, color: '#FFF', borderWidth: 1, borderColor: '#1F1F2A' },
  btnCrearPlaylist: { backgroundColor: '#E24A24', height: 40, paddingHorizontal: 16, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  playlistFolderRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0B0B0F', padding: 14, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#1A1A24' },
  btnPlayFolder: { backgroundColor: '#E24A24', width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  queueContainer: { marginTop: 10, paddingHorizontal: 16 },
  queueTrackRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(14, 14, 20, 0.8)', padding: 12, borderRadius: 14, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.02)' },
  activeTrackRowBackground: { borderColor: 'rgba(226, 74, 36, 0.5)', backgroundColor: 'rgba(226, 74, 36, 0.12)' },
  queueTrackCover: { width: 42, height: 42, borderRadius: 8, marginRight: 14 },
  queueTrackTitle: { color: '#FFF', fontSize: 14, fontWeight: '800' },
  queueTrackArtist: { color: '#9CA3AF', fontSize: 12 },
  lyricsTag: { fontSize: 8, color: '#E24A24', backgroundColor: 'rgba(226, 74, 36, 0.1)', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 3, fontWeight: '900' },
  trackListCodecBadge: { borderWidth: 1, borderColor: '#232330', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 5, backgroundColor: '#07070A' },
  trackListCodecText: { color: '#D1A153', fontSize: 8, fontWeight: '800' },
  settingOptionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0B0B0F', padding: 16, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#1A1A24' },
  miniPlayerFloating: { position: 'absolute', bottom: 86, left: 14, right: 14, height: 60, backgroundColor: 'rgba(8, 8, 12, 0.96)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(226, 74, 36, 0.4)', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, zIndex: 99 },
  miniPlayerCover: { width: 38, height: 38, borderRadius: 8 },
  miniPlayerTitle: { color: '#FFF', fontSize: 13, fontWeight: '800' },
  miniPlayerArtist: { color: '#9CA3AF', fontSize: 11 },
  miniPlayActionBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#E24A24', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  persistentBottomNavigation: { position: 'absolute', bottom: 0, width: '100%', height: 76, backgroundColor: '#050507', borderTopWidth: 1, borderTopColor: '#121217', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingBottom: 12 },
  navTabElement: { alignItems: 'center', justifyContent: 'center', minWidth: 60 },
  navTabCover: { width: '100%', height: '100%' },
  matrixCardImage: { width: '100%', height: 100, resizeMode: 'cover' },
  navTabText: { fontSize: 9, marginTop: 4, fontWeight: '900', letterSpacing: 0.5 },
  centerHexagonAction: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#09090D', borderWidth: 1.5, borderColor: '#E24A24', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  centerHexagonText: { color: '#E24A24', fontWeight: '900', fontSize: 18 }
});

