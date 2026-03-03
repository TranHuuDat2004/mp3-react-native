import { Image } from 'expo-image';
import { StyleSheet, TouchableOpacity, View, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useMemo } from 'react';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AssetMap } from '@/constants/assets-map';
import musicData from '@/assets/data/music.json';

export default function LibraryScreen() {
  const [activeFilter, setActiveFilter] = useState<'Playlists' | 'Artists' | 'Albums'>('Playlists');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const categories = useMemo(() => musicData.map(category => ({
    id: category.id,
    title: category.title,
    art: category.songs[0]?.artUrl,
    count: category.songs.length,
    songs: category.songs
  })), []);

  const uniqueArtists = useMemo(() => {
    const artistMap = new Map();
    musicData.forEach(cat => {
      cat.songs.forEach(song => {
        if (!artistMap.has(song.artistData)) {
          artistMap.set(song.artistData, {
            name: song.artistData,
            art: song.artUrl,
            count: 1
          });
        } else {
          artistMap.get(song.artistData).count++;
        }
      });
    });
    return Array.from(artistMap.values()).sort((a, b) => b.count - a.count);
  }, []);

  const activeCategory = useMemo(() =>
    categories.find(c => c.id === selectedCategoryId),
    [categories, selectedCategoryId]
  );

  const renderFilterChips = () => (
    <View style={styles.filterSection}>
      {(['Playlists', 'Artists', 'Albums'] as const).map(filter => (
        <TouchableOpacity
          key={filter}
          style={activeFilter === filter ? styles.filterChipActive : styles.filterChip}
          onPress={() => {
            setActiveFilter(filter);
            setSelectedCategoryId(null);
          }}
        >
          <ThemedText style={activeFilter === filter ? styles.filterTextActive : styles.filterText}>
            {filter}
          </ThemedText>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderContent = () => {
    if (selectedCategoryId && activeCategory) {
      return (
        <View style={styles.section}>
          <TouchableOpacity style={styles.backButton} onPress={() => setSelectedCategoryId(null)}>
            <Ionicons name="arrow-back" size={20} color="#007AFF" />
            <ThemedText style={styles.backText}>Back to {activeFilter}</ThemedText>
          </TouchableOpacity>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>{activeCategory.title}</ThemedText>
          {activeCategory.songs.map((item: any) => (
            <TouchableOpacity key={item.id} style={styles.libraryItem}>
              <Image source={AssetMap[item.artUrl]} style={styles.libraryArt} />
              <View style={styles.libraryItemInfo}>
                <ThemedText type="defaultSemiBold" numberOfLines={1}>{item.title}</ThemedText>
                <ThemedText style={styles.librarySubtitle}>{item.artistData} • {item.plays} plays</ThemedText>
              </View>
              <Ionicons name="play-circle" size={24} color="#007AFF" />
            </TouchableOpacity>
          ))}
        </View>
      );
    }

    if (activeFilter === 'Playlists' || activeFilter === 'Albums') {
      return (
        <View style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            {activeFilter === 'Playlists' ? 'Your Playlists' : 'Albums'}
          </ThemedText>
          <View style={styles.grid}>
            {categories.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.gridItem}
                onPress={() => setSelectedCategoryId(item.id)}
              >
                <Image source={AssetMap[item.art]} style={styles.gridArt} />
                <ThemedText numberOfLines={1} style={styles.gridTitle}>{item.title}</ThemedText>
                <ThemedText style={styles.gridSubtitle}>{item.count} songs</ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );
    }

    if (activeFilter === 'Artists') {
      return (
        <View style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Artists</ThemedText>
          {uniqueArtists.map((item, idx) => (
            <TouchableOpacity key={idx} style={styles.libraryItem}>
              <Image source={AssetMap[item.art]} style={[styles.libraryArt, { borderRadius: 32 }]} />
              <View style={styles.libraryItemInfo}>
                <ThemedText type="defaultSemiBold" numberOfLines={1}>{item.name}</ThemedText>
                <ThemedText style={styles.librarySubtitle}>{item.count} songs in library</ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
          ))}
        </View>
      );
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Your Library</ThemedText>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="search" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="add" size={30} color="#000" />
          </TouchableOpacity>
        </View>
      </ThemedView>

      {renderFilterChips()}
      {renderContent()}
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
    marginBottom: 24,
    backgroundColor: 'transparent',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    padding: 4,
  },
  filterSection: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 32,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  filterChipActive: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#007AFF',
  },
  filterText: {
    fontSize: 14,
    color: '#000',
  },
  filterTextActive: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '47%',
    marginBottom: 24,
  },
  gridArt: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    marginBottom: 8,
  },
  gridTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  gridSubtitle: {
    fontSize: 13,
    color: '#888',
  },
  libraryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 16,
  },
  libraryArt: {
    width: 64,
    height: 64,
    borderRadius: 8,
  },
  libraryItemInfo: {
    flex: 1,
  },
  librarySubtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 16,
  },
  backText: {
    color: '#007AFF',
    fontSize: 16,
  },
});
