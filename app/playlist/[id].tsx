import musicData from '@/assets/data/music.json';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AssetMap } from '@/constants/assets-map';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function PlaylistDetailsScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [playlist, setPlaylist] = useState<any>(null);
    const [songs, setSongs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const allMusicSongs = useMemo(() => musicData.flatMap(category => category.songs), []);

    useEffect(() => {
        fetchPlaylistDetails();
    }, [id]);

    const fetchPlaylistDetails = async () => {
        setIsLoading(true);

        // Fetch playlist metadata
        const { data: playlistData, error: playlistError } = await supabase
            .from('playlists')
            .select('*')
            .eq('id', id)
            .single();

        if (playlistError) {
            console.error('Error fetching playlist metadata:', playlistError);
            setIsLoading(false);
            return;
        }

        setPlaylist(playlistData);

        // Fetch songs in this playlist
        const { data: songLinks, error: linksError } = await supabase
            .from('playlist_songs')
            .select('song_id')
            .eq('playlist_id', id)
            .order('added_at', { ascending: true });

        if (linksError) {
            console.error('Error fetching playlist songs:', linksError);
        } else if (songLinks) {
            // Match song UUIDs from Supabase with our local music.json data
            // Note: In a production app, we'd fetch the song details directly from the 'songs' table,
            // but since we're using music.json as the master source for media playback, we map them back.

            const { data: dbSongs } = await supabase
                .from('songs')
                .select('id, title, artist_data')
                .in('id', songLinks.map(l => l.song_id));

            if (dbSongs) {
                const matchedSongs = dbSongs.map(dbSong => {
                    return allMusicSongs.find(s =>
                        s.title === dbSong.title && s.artistData === dbSong.artist_data
                    );
                }).filter(Boolean);

                setSongs(matchedSongs);
            }
        }

        setIsLoading(false);
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.songItem}
            onPress={() => {
                const songIdx = allMusicSongs.findIndex((s: any) => s.title === item.title && s.artistData === item.artistData);
                if (songIdx !== -1) {
                    router.push(`/?songIndex=${songIdx}`);
                }
            }}
        >
            <Image source={AssetMap[item.artUrl]} style={styles.songArt} />
            <View style={styles.songInfo}>
                <ThemedText style={styles.songTitle} numberOfLines={1}>{item.title}</ThemedText>
                <ThemedText style={styles.songArtist}>{item.artistData}</ThemedText>
            </View>
            <Ionicons name="play-circle" size={24} color="#007AFF" />
        </TouchableOpacity>
    );

    if (isLoading) {
        return (
            <ThemedView style={styles.center}>
                <ActivityIndicator size="large" color="#007AFF" />
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <ThemedText type="title" style={styles.title}>{playlist?.title || 'Playlist'}</ThemedText>
            </View>

            <FlatList
                data={songs}
                keyExtractor={(item, index) => `${item.id}-${index}`}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <ThemedText style={styles.emptyText}>No songs in this playlist yet.</ThemedText>
                    </View>
                }
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 60,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    backButton: {
        marginRight: 16,
        padding: 4,
    },
    title: {
        flex: 1,
    },
    list: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    songItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    songArt: {
        width: 56,
        height: 56,
        borderRadius: 8,
        marginRight: 16,
    },
    songInfo: {
        flex: 1,
    },
    songTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
        color: '#000',
    },
    songArtist: {
        fontSize: 14,
        color: '#666',
    },
    emptyContainer: {
        marginTop: 100,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#888',
    }
});
