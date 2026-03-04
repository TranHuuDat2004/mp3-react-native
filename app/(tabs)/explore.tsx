import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import musicData from '@/assets/data/music.json';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AssetMap } from '@/constants/assets-map';

export default function LibraryScreen() {
  const [activeFilter, setActiveFilter] = useState<'Recommended for you' | 'Artists' | 'All Songs'>('Recommended for you');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedArtistName, setSelectedArtistName] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const categories = useMemo(() => musicData.map(category => ({
    id: category.id,
    title: category.title,
    art: category.songs[0]?.artUrl,
    count: category.songs.length,
    songs: category.songs
  })), []);

  const allSongs = useMemo(() => musicData.flatMap(category => category.songs), []);

  const uniqueArtists = useMemo(() => {
    const artistMap = new Map();
    allSongs.forEach(song => {
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
    return Array.from(artistMap.values()).sort((a, b) => b.count - a.count);
  }, [allSongs]);

  const activeCategory = useMemo(() =>
    categories.find(c => c.id === selectedCategoryId),
    [categories, selectedCategoryId]
  );

  const renderHeader = () => {
    return (
      <>
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

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search songs, artists..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#888" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.filterSection}>
          {(['Recommended for you', 'Artists', 'All Songs'] as const).map(filter => (
            <TouchableOpacity
              key={filter}
              style={activeFilter === filter ? styles.filterChipActive : styles.filterChip}
              onPress={() => {
                setActiveFilter(filter);
                setSelectedCategoryId(null);
                setSelectedArtistName(null);
              }}
            >
              <ThemedText style={activeFilter === filter ? styles.filterTextActive : styles.filterText}>
                {filter}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
        {renderSectionHeader()}
      </>
    );
  };

  const renderSectionHeader = () => {
    if (searchQuery.trim().length > 0) {
      return <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Search Results</ThemedText>;
    }

    if (selectedArtistName) {
      return (
        <View style={styles.sectionHeaderContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => setSelectedArtistName(null)}>
            <Ionicons name="arrow-back" size={20} color="#007AFF" />
            <ThemedText style={styles.backText}>Back to {activeFilter}</ThemedText>
          </TouchableOpacity>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>{selectedArtistName}</ThemedText>
        </View>
      );
    }

    if (selectedCategoryId && activeCategory) {
      return (
        <View style={styles.sectionHeaderContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => setSelectedCategoryId(null)}>
            <Ionicons name="arrow-back" size={20} color="#007AFF" />
            <ThemedText style={styles.backText}>Back to {activeFilter}</ThemedText>
          </TouchableOpacity>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>{activeCategory.title}</ThemedText>
        </View>
      );
    }

    if (activeFilter === 'Recommended for you' || activeFilter === 'All Songs' || activeFilter === 'Artists') {
      return <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>{activeFilter === 'Recommended for you' ? 'Recommended for you' : activeFilter === 'All Songs' ? 'All Songs' : 'Artists'}</ThemedText>;
    }

    return null;
  };

  // Determine list data and layout based on state
  let listData: any[] = [];
  let numColumns = 1;
  let renderItemFunc: ({ item }: { item: any }) => React.ReactElement | null;

  const renderSongItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.libraryItem}
      onPress={() => {
        const songIdx = allSongs.findIndex((s: any) => s.id === item.id);
        if (songIdx !== -1) {
          router.push(`/?songIndex=${songIdx}`);
        }
      }}
    >
      <Image source={AssetMap[item.artUrl]} style={styles.libraryArt} />
      <View style={styles.libraryItemInfo}>
        <ThemedText type="defaultSemiBold" numberOfLines={1}>{item.title}</ThemedText>
        <ThemedText style={styles.librarySubtitle}>{item.artistData} • {item.plays} plays</ThemedText>
      </View>
      <Ionicons name="play-circle" size={24} color="#007AFF" />
    </TouchableOpacity>
  );

  const renderCategoryItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.gridItem}
      onPress={() => setSelectedCategoryId(item.id)}
    >
      <Image source={AssetMap[item.art]} style={styles.gridArt} />
      <ThemedText numberOfLines={1} style={styles.gridTitle}>{item.title}</ThemedText>
      <ThemedText style={styles.gridSubtitle}>{item.count} songs</ThemedText>
    </TouchableOpacity>
  );

  const renderArtistItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.libraryItem}
      onPress={() => setSelectedArtistName(item.name)}
    >
      <Image source={AssetMap[item.art]} style={[styles.libraryArt, { borderRadius: 32 }]} />
      <View style={styles.libraryItemInfo}>
        <ThemedText type="defaultSemiBold" numberOfLines={1}>{item.name}</ThemedText>
        <ThemedText style={styles.librarySubtitle}>{item.count} songs in library</ThemedText>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  if (searchQuery.trim().length > 0) {
    const query = searchQuery.toLowerCase();
    listData = allSongs.filter(song =>
      song.title.toLowerCase().includes(query) ||
      song.artistData.toLowerCase().includes(query)
    );
    renderItemFunc = renderSongItem;
  } else if (selectedArtistName) {
    listData = allSongs.filter(song => song.artistData === selectedArtistName);
    renderItemFunc = renderSongItem;
  } else if (selectedCategoryId && activeCategory) {
    listData = activeCategory.songs;
    renderItemFunc = renderSongItem;
  } else if (activeFilter === 'All Songs') {
    listData = allSongs;
    renderItemFunc = renderSongItem;
  } else if (activeFilter === 'Artists') {
    listData = uniqueArtists;
    renderItemFunc = renderArtistItem;
  } else if (activeFilter === 'Recommended for you') {
    listData = categories;
    numColumns = 2;
    renderItemFunc = renderCategoryItem;
  } else {
    // Default fallback
    renderItemFunc = renderSongItem;
  }

  return (
    <View style={styles.container}>
      <FlatList
        key={numColumns} // Force re-render when switching between list and grid
        data={listData}
        keyExtractor={(item, idx) => item.id ? `${item.id}-${idx}` : `idx-${idx}`}
        renderItem={renderItemFunc}
        numColumns={numColumns}
        columnWrapperStyle={numColumns === 2 ? styles.gridRow : undefined}
        contentContainerStyle={styles.content}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={styles.center}>
            <ThemedText style={styles.emptyText}>No results found.</ThemedText>
          </View>
        }
        removeClippedSubviews={true}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
      />
    </View>
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
    paddingBottom: 100, // Add padding to bottom for tab bar
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
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
  sectionHeaderContainer: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  gridRow: {
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
  center: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
  }
});
