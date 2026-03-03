import { Image } from 'expo-image';
import { StyleSheet, TouchableOpacity, View, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState, useRef } from 'react';
import { Audio } from 'expo-av';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AssetMap } from '@/constants/assets-map';
import musicData from '@/assets/data/music.json';

const { width } = Dimensions.get('window');

// Flatten songs from categories
const allSongs = musicData.flatMap(category => category.songs);

export default function MusicPlayerScreen() {
  const [songIndex, setSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackStatus, setPlaybackStatus] = useState<any>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const currentSong = allSongs[songIndex];

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  async function loadAndPlay(index: number, shouldPlay = true) {
    if (sound) {
      await sound.unloadAsync();
    }

    setIsLoading(true);
    const song = allSongs[index];
    const source = AssetMap[song.audioSrc];

    try {
      const { sound: newSound } = await Audio.Sound.createAsync(
        source,
        { shouldPlay },
        onPlaybackStatusUpdate
      );
      setSound(newSound);
      setIsPlaying(shouldPlay);
    } catch (error) {
      console.error("Error loading sound", error);
    } finally {
      setIsLoading(false);
    }
  }

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setPlaybackStatus(status);
      if (status.didJustFinish) {
        handleNext();
      }
    }
  };

  const handlePlayPause = async () => {
    if (!sound) {
      await loadAndPlay(songIndex);
      return;
    }

    if (isPlaying) {
      await sound.pauseAsync();
      setIsPlaying(false);
    } else {
      await sound.playAsync();
      setIsPlaying(true);
    }
  };

  const handleNext = async () => {
    const nextIndex = (songIndex + 1) % allSongs.length;
    setSongIndex(nextIndex);
    await loadAndPlay(nextIndex);
  };

  const handleBack = async () => {
    const prevIndex = (songIndex - 1 + allSongs.length) % allSongs.length;
    setSongIndex(prevIndex);
    await loadAndPlay(prevIndex);
  };

  const getProgress = () => {
    if (playbackStatus?.durationMillis > 0) {
      return (playbackStatus.positionMillis / playbackStatus.durationMillis) * 100;
    }
    return 0;
  };

  const formatTime = (millis: number) => {
    if (!millis) return "0:00";
    const totalSeconds = millis / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

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
          source={AssetMap[currentSong.artUrl] || "https://picsum.photos/seed/music/600/600"}
          style={styles.albumArt}
        />
      </View>

      <View style={styles.songInfo}>
        <ThemedText type="title" numberOfLines={1}>{currentSong.title}</ThemedText>
        <ThemedText style={styles.artist}>{currentSong.artistData}</ThemedText>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${getProgress()}%` }]} />
          <View style={[styles.progressMarker, { left: `${getProgress()}%` }]} />
        </View>
        <View style={styles.timeInfo}>
          <ThemedText style={styles.timeText}>{formatTime(playbackStatus?.positionMillis)}</ThemedText>
          <ThemedText style={styles.timeText}>{formatTime(playbackStatus?.durationMillis)}</ThemedText>
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity>
          <Ionicons name="shuffle" size={28} color="#888" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleBack}>
          <Ionicons name="play-back" size={36} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.playButton} onPress={handlePlayPause}>
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Ionicons name={isPlaying ? "pause" : "play"} size={40} color="#fff" />
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={handleNext}>
          <Ionicons name="play-forward" size={36} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="repeat" size={28} color="#888" />
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <ThemedText type="defaultSemiBold" style={styles.footerTitle}>Up Next</ThemedText>
        {[allSongs[(songIndex + 1) % allSongs.length], allSongs[(songIndex + 2) % allSongs.length]].map((item, i) => (
          <TouchableOpacity
            key={item.id + i}
            style={styles.nextSongItem}
            onPress={() => {
              const idx = allSongs.findIndex(s => s.id === item.id);
              if (idx !== -1) {
                setSongIndex(idx);
                loadAndPlay(idx);
              }
            }}
          >
            <Image
              source={AssetMap[item.artUrl]}
              style={styles.nextSongArt}
            />
            <View style={styles.nextSongInfo}>
              <ThemedText type="defaultSemiBold" numberOfLines={1}>{item.title}</ThemedText>
              <ThemedText style={styles.nextSongArtist}>{item.artistData}</ThemedText>
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
    textAlign: 'center',
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
    position: 'relative',
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
    position: 'absolute',
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
