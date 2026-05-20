import React, { useState } from 'react';
import { Image } from 'expo-image';
import { Platform, StyleSheet, TextInput } from 'react-native'; // 👈 Importamos TextInput

import { Collapsible } from '@/components/ui/collapsible';
import { ExternalLink } from '@/components/external-link';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';

export default function TabTwoScreen() {
  // 🟢 ESTADO PARA CONTROLAR EL TEXTO DE BÚSQUEDA
  const [searchQuery, setSearchQuery] = useState('');

  // 🟢 FUNCIÓN QUE CONECTA CON TU BACKEND DE PYTHON EN TERMUX (PUERTO 5000)
  const handleSearchSubmit = async (query: string) => {
    console.log(`[AuroraXenia] Enviando petición al servidor para: ${query}`);
    try {
      const response = await fetch(`http://192.168.0.54:5000/search?q=${encodeURIComponent(query)}`);

      const data = await response.json();
      console.log("[AuroraXenia] Resultado del servidor:", data);
      
      // Aquí meteremos después la lógica para mandar el data.audio_url al reproductor global
    } catch (error) {
      console.log("[AuroraXenia] Error de conexión con el servidor local:", error);
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#1A1A1A' }} // Ajustado a tono oscuro premium
      headerImage={
        <IconSymbol
          size={310}
          color="#FF5500" // Cambiado al naranja sónico de tu interfaz
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText
          type="title"
          style={{
            fontFamily: Fonts.rounded,
          }}>
          Explore
        </ThemedText>
      </ThemedView>

      {/* 🔘 INYECCIÓN QUIRÚRGICA DE TU BUSCADOR INTELIGENTE */}
      <ThemedView style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar música, artistas, géneros..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
          
          // Activa la lupa/botón de buscar en el teclado de tu Samsung
          returnKeyType="search" 
          onSubmitEditing={() => {
            if (searchQuery && searchQuery.trim().length > 0) {
              handleSearchSubmit(searchQuery); 
            }
          }}
        />
      </ThemedView>

      <ThemedText>Escribe el nombre de un track o artista y presiona Enter en tu teclado para rastrear la red.</ThemedText>
      
      <Collapsible title="File-based routing">
        <ThemedText>
          This app has two screens:{' '}
          <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> and{' '}
          <ThemedText type="defaultSemiBold">app/(tabs)/explore.tsx</ThemedText>
        </ThemedText>
        <ThemedText>
          The layout file in <ThemedText type="defaultSemiBold">app/(tabs)/_layout.tsx</ThemedText>{' '}
          sets up the tab navigator.
        </ThemedText>
        <ExternalLink href="https://docs.expo.dev/router/introduction">
          <ThemedText type="link">Learn more</ThemedText>
        </ExternalLink>
      </Collapsible>
      <Collapsible title="Android, iOS, and web support">
        <ThemedText>
          You can open this project on Android, iOS, and the web. To open the web version, press{' '}
          <ThemedText type="defaultSemiBold">w</ThemedText> in the terminal running this project.
        </ThemedText>
      </Collapsible>
      <Collapsible title="Images">
        <ThemedText>
          For static images, you can use the <ThemedText type="defaultSemiBold">@2x</ThemedText> and{' '}
          <ThemedText type="defaultSemiBold">@3x</ThemedText> suffixes to provide files for
          different screen densities
        </ThemedText>
        <Image
          source={require('@/assets/images/react-logo.png')}
          style={{ width: 100, height: 100, alignSelf: 'center' }}
        />
        <ExternalLink href="https://reactnative.dev/docs/images">
          <ThemedText type="link">Learn more</ThemedText>
        </ExternalLink>
      </Collapsible>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#333333',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  // ✨ ESTILOS PREMIUM PARA LA BARRA DE BÚSQUEDA OBSCURA
  searchContainer: {
    marginVertical: 12,
  },
  searchInput: {
    backgroundColor: '#1E1E1E',
    color: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
});

