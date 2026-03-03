import { Image } from 'expo-image';
import { StyleSheet, TouchableOpacity, View, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const { width } = Dimensions.get('window');

export default function MusicPlayerScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ThemedView style={styles.header}>
        <ThemedText type="subtitle">Now Playing</ThemedText>
        <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal" size={24} color="#888" />
        </TouchableOpacity>
      </ThemedView>

      <View style={styles.albumArtContainer}>
        <Image
          source="https://picsum.photos/seed/music/600/600"
          style={styles.albumArt}
        />
      </View>

      <View style={styles.songInfo}>
        <ThemedText type="title">Midnight City</ThemedText>
        <ThemedText style={styles.artist}>M83 - Hurry Up, We're Dreaming</ThemedText>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: '45%' }]} />
          <View style={styles.progressMarker} />
        </View>
        <View style={styles.timeInfo}>
          <ThemedText style={styles.timeText}>1:45</ThemedText>
          <ThemedText style={styles.timeText}>4:03</ThemedText>
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity>
          <Ionicons name="shuffle" size={28} color="#888" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="play-back" size={36} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.playButton}>
          <Ionicons name="play" size={40} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="play-forward" size={36} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="repeat" size={28} color="#888" />
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <ThemedText type="defaultSemiBold" style={styles.footerTitle}>Up Next</ThemedText>
        {[1, 2, 3].map((item) => (
          <TouchableOpacity key={item} style={styles.nextSongItem}>
            <Image
              source={`https://picsum.photos/seed/${item + 10}/100/100`}
              style={styles.nextSongArt}
            />
            <View style={styles.nextSongInfo}>
              <ThemedText type="defaultSemiBold">Future Focus {item}</ThemedText>
              <ThemedText style={styles.nextSongArtist}>Artist {item}</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 24,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
    backgroundColor: 'transparent',
  },
  albumArtContainer: {
    width: width - 48,
    height: width - 48,
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    marginBottom: 40,
  },
  albumArt: {
    width: '100%',
    height: '100%',
  },
  songInfo: {
    alignItems: 'center',
    marginBottom: 32,
  },
  artist: {
    fontSize: 16,
    color: '#888',
    marginTop: 8,
  },
  progressSection: {
    marginBottom: 40,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: '#eee',
    borderRadius: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  progressMarker: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#007AFF',
    marginLeft: -6,
  },
  timeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  timeText: {
    fontSize: 12,
    color: '#888',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 48,
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    marginTop: 20,
  },
  footerTitle: {
    fontSize: 20,
    marginBottom: 16,
  },
  nextSongItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  nextSongArt: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  nextSongInfo: {
    flex: 1,
  },
  nextSongArtist: {
    fontSize: 14,
    color: '#888',
  },
});
