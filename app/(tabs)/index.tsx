import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Modal, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import musicData from '@/assets/data/music.json';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AssetMap } from '@/constants/assets-map';
import { supabase } from '@/lib/supabase';

const { width } = Dimensions.get('window');

// Flatten songs from categories
const allSongs = musicData.flatMap(category => category.songs);

export default function MusicPlayerScreen() {
  const params = useLocalSearchParams();
  const [songIndex, setSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackStatus, setPlaybackStatus] = useState<any>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);

  // We use a ref to always have the latest sound object in our effect
  const soundRef = useRef(sound);
  useEffect(() => {
    soundRef.current = sound;
  }, [sound]);

  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [isPlaylistModalVisible, setIsPlaylistModalVisible] = useState(false);
  const [userPlaylists, setUserPlaylists] = useState<any[]>([]);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isCreatingInModal, setIsCreatingInModal] = useState(false);

  const fetchUserPlaylists = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('playlists').select('id, title').eq('user_id', user.id).order('created_at', { ascending: false });
    setUserPlaylists(data || []);
  };

  const currentSong = allSongs[songIndex];

  const handleAddToPlaylistClick = () => {
    fetchUserPlaylists();
    setIsPlaylistModalVisible(true);
  };

  const handleSelectPlaylist = async (playlistId: string) => {
    setIsPlaylistModalVisible(false);

    // 1. Lookup song UUID in Supabase by title and artist
    const { data: dbSongs, error: searchError } = await supabase
      .from('songs')
      .select('id')
      .eq('title', currentSong.title)
      .eq('artist_data', currentSong.artistData)
      .limit(1);

    if (searchError || !dbSongs || dbSongs.length === 0) {
      alert('Could not find this song in the database. Did you run the SQL seed script?');
      return;
    }

    const songId = dbSongs[0].id;

    // 2. Add to playlist_songs
    const { error: insertError } = await supabase
      .from('playlist_songs')
      .insert({
        playlist_id: playlistId,
        song_id: songId
      });

    if (insertError) {
      if (insertError.code === '23505') {
        alert('Song is already in this playlist!');
      } else {
        alert('Error adding song to playlist.');
      }
    } else {
      showToast('Added to Playlist 🎵');
    }
  };

  const handleCreateAndAddPlaylist = async () => {
    if (!newPlaylistName.trim()) {
      alert('Please enter a playlist name.');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setIsCreatingInModal(true);

    // 1. Create the playlist
    const { data: playlist, error: createError } = await supabase
      .from('playlists')
      .insert({
        title: newPlaylistName.trim(),
        user_id: user.id
      })
      .select('id')
      .single();

    if (createError) {
      alert('Error creating playlist: ' + createError.message);
      setIsCreatingInModal(false);
      return;
    }

    setIsCreatingInModal(false);
    setNewPlaylistName('');

    // 2. Add current song to the new playlist
    await handleSelectPlaylist(playlist.id);
  };

  const stateRef = useRef({
    songIndex,
    isShuffle,
    isRepeat,
    isSeeking,
  });

  useEffect(() => {
    stateRef.current = { songIndex, isShuffle, isRepeat, isSeeking };
  }, [songIndex, isShuffle, isRepeat, isSeeking]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2000);
  };

  useEffect(() => {
    if (params.songIndex !== undefined && !Array.isArray(params.songIndex)) {
      const idx = Number(params.songIndex);
      if (!isNaN(idx) && idx >= 0 && idx < allSongs.length) {
        setSongIndex(idx);
        playSong(idx, true);
      }
    }
  }, [params.songIndex]);

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      if (!stateRef.current.isSeeking) {
        setPlaybackStatus(status);
      }
      if (status.didJustFinish) {
        if (stateRef.current.isRepeat) {
          soundRef.current?.replayAsync();
        } else {
          handleNextAction();
        }
      }
    }
  };

  async function playSong(index: number, shouldPlay = true) {
    if (soundRef.current) {
      try {
        await soundRef.current.unloadAsync();
      } catch (e) { }
    }

    setIsLoading(true);
    const song = allSongs[index];
    const source = AssetMap[song.audioSrc];

    if (!source) {
      console.warn(`Asset not found for ${song.title}: ${song.audioSrc}`);
      setIsLoading(false);
      return;
    }

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

  useEffect(() => {
    // Configure background audio mode
    Audio.setAudioModeAsync({
      staysActiveInBackground: true,
      interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
      interruptionModeIOS: InterruptionModeIOS.DoNotMix,
      playsInSilentModeIOS: true,
    });

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const handleNextAction = async () => {
    const { songIndex: currentIdx, isShuffle: shuffle } = stateRef.current;
    let nextIndex;
    if (shuffle) {
      nextIndex = Math.floor(Math.random() * allSongs.length);
    } else {
      nextIndex = (currentIdx + 1) % allSongs.length;
    }
    setSongIndex(nextIndex);
    await playSong(nextIndex);
  };

  const handlePlayPause = async () => {
    if (!soundRef.current) {
      await playSong(songIndex);
      return;
    }

    if (isPlaying) {
      await soundRef.current.pauseAsync();
      setIsPlaying(false);
    } else {
      await soundRef.current.playAsync();
      setIsPlaying(true);
    }
  };

  const handleNext = async () => {
    await handleNextAction();
  };

  const handleBack = async () => {
    const prevIndex = (songIndex - 1 + allSongs.length) % allSongs.length;
    setSongIndex(prevIndex);
    await playSong(prevIndex);
  };

  const toggleShuffle = () => {
    const newShuffle = !isShuffle;
    setIsShuffle(newShuffle);
    showToast(newShuffle ? "Shuffle On" : "Shuffle Off");
  };

  const toggleRepeat = () => {
    const newRepeat = !isRepeat;
    setIsRepeat(newRepeat);
    showToast(newRepeat ? "Repeat On" : "Repeat Off");
  };

  const onSlidingComplete = async (value: number) => {
    if (soundRef.current) {
      await soundRef.current.setPositionAsync(value);
    }
    setIsSeeking(false);
  };

  const onSlidingStart = () => {
    setIsSeeking(true);
  };

  const formatTime = (millis: number) => {
    if (!millis) return "0:00";
    const totalSeconds = millis / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <ThemedView style={styles.header}>
          <ThemedText type="subtitle">Now Playing</ThemedText>
          <TouchableOpacity onPress={handleAddToPlaylistClick}>
            <Ionicons name="add-circle-outline" size={28} color="#007AFF" />
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
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={playbackStatus?.durationMillis || 1}
            value={playbackStatus?.positionMillis || 0}
            minimumTrackTintColor="#007AFF"
            maximumTrackTintColor="#eee"
            thumbTintColor="#007AFF"
            onSlidingStart={onSlidingStart}
            onSlidingComplete={onSlidingComplete}
          />
          <View style={styles.timeInfo}>
            <ThemedText style={styles.timeText}>{formatTime(playbackStatus?.positionMillis)}</ThemedText>
            <ThemedText style={styles.timeText}>{formatTime(playbackStatus?.durationMillis)}</ThemedText>
          </View>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity onPress={toggleShuffle}>
            <Ionicons name="shuffle" size={28} color={isShuffle ? "#007AFF" : "#888"} />
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
          <TouchableOpacity onPress={toggleRepeat}>
            <Ionicons name="repeat" size={28} color={isRepeat ? "#007AFF" : "#888"} />
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
                  playSong(idx);
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

      <Modal
        visible={isPlaylistModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsPlaylistModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsPlaylistModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle">Add to Playlist</ThemedText>
              <TouchableOpacity onPress={() => setIsPlaylistModalVisible(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalCreateSection}>
              <TextInput
                style={styles.modalInput}
                placeholder="Create new playlist..."
                placeholderTextColor="#888"
                value={newPlaylistName}
                onChangeText={setNewPlaylistName}
              />
              <TouchableOpacity
                style={[styles.modalCreateButton, isCreatingInModal && { opacity: 0.7 }]}
                onPress={handleCreateAndAddPlaylist}
                disabled={isCreatingInModal}
              >
                {isCreatingInModal ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Ionicons name="add" size={24} color="#fff" />
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.modalDivider} />

            {userPlaylists.length === 0 ? (
              <ThemedText style={styles.emptyModalText}>No existing playlists. Create one above!</ThemedText>
            ) : (
              <FlatList
                data={userPlaylists}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalPlaylistItem}
                    onPress={() => handleSelectPlaylist(item.id)}
                  >
                    <Ionicons name="list" size={24} color="#007AFF" style={{ marginRight: 12 }} />
                    <ThemedText style={styles.modalPlaylistTitle}>{item.title}</ThemedText>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      {toastMessage && (
        <View style={styles.toastContainer}>
          <ThemedText style={styles.toastText}>{toastMessage}</ThemedText>
        </View>
      )}
    </>
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
  slider: {
    width: '100%',
    height: 40,
  },
  timeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -8,
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
  toastContainer: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    zIndex: 1000,
  },
  toastText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalPlaylistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalPlaylistTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  emptyModalText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
    marginBottom: 40,
  },
  modalCreateSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  modalInput: {
    flex: 1,
    height: 48,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#000',
  },
  modalCreateButton: {
    width: 48,
    height: 48,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#eee',
    marginBottom: 10,
  },
});
