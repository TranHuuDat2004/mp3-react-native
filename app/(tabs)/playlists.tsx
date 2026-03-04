import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function PlaylistsScreen() {
    const [playlists, setPlaylists] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const router = useRouter();

    const fetchPlaylists = async () => {
        setIsLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from('playlists')
            .select(`
                id, 
                title, 
                created_at,
                playlist_songs (count)
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching playlists:', error);
        } else {
            setPlaylists(data || []);
        }
        setIsLoading(false);
    };

    useFocusEffect(
        useCallback(() => {
            fetchPlaylists();
        }, [])
    );

    const handleCreatePlaylist = async () => {
        if (!newTitle.trim()) {
            Alert.alert('Error', 'Please enter a playlist name.');
            return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        setIsCreating(true);
        const { error } = await supabase
            .from('playlists')
            .insert({
                title: newTitle.trim(),
                user_id: user.id
            });

        setIsCreating(false);

        if (error) {
            Alert.alert('Error', error.message);
        } else {
            setNewTitle('');
            fetchPlaylists(); // Refresh
        }
    };

    const handleDelete = async (id: string, title: string) => {
        Alert.alert(
            'Delete Playlist',
            `Are you sure you want to delete "${title}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        const { error } = await supabase.from('playlists').delete().eq('id', id);
                        if (error) {
                            Alert.alert('Error', error.message);
                        } else {
                            fetchPlaylists();
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.playlistItem}
            onPress={() => router.push({ pathname: '/playlist/[id]', params: { id: item.id } })}
        >
            <View style={styles.playlistIcon}>
                <Ionicons name="musical-notes" size={24} color="#007AFF" />
            </View>
            <View style={styles.playlistInfo}>
                <ThemedText style={styles.playlistTitle}>{item.title}</ThemedText>
                <ThemedText style={styles.playlistCount}>
                    {item.playlist_songs[0]?.count || 0} songs
                </ThemedText>
            </View>
            <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id, item.title)}>
                <Ionicons name="trash-outline" size={20} color="#FF3B30" />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <ThemedText type="title">Your Playlists</ThemedText>
            </View>

            <View style={styles.createContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="New playlist name..."
                    placeholderTextColor="#888"
                    value={newTitle}
                    onChangeText={setNewTitle}
                />
                <TouchableOpacity
                    style={[styles.createButton, isCreating && { opacity: 0.7 }]}
                    onPress={handleCreatePlaylist}
                    disabled={isCreating}
                >
                    {isCreating ? <ActivityIndicator color="#fff" size="small" /> : <Ionicons name="add" size={24} color="#fff" />}
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#007AFF" />
                </View>
            ) : playlists.length === 0 ? (
                <View style={styles.center}>
                    <ThemedText style={styles.emptyText}>No playlists yet. Create one above!</ThemedText>
                </View>
            ) : (
                <FlatList
                    data={playlists}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                />
            )}
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 60,
    },
    header: {
        paddingHorizontal: 20,
        marginBottom: 20,
        marginTop: 20,
    },
    createContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 20,
        gap: 12,
    },
    input: {
        flex: 1,
        height: 48,
        backgroundColor: '#f0f0f0',
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#000',
    },
    createButton: {
        width: 48,
        height: 48,
        backgroundColor: '#007AFF',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        color: '#888',
        fontSize: 16,
    },
    list: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    playlistItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f8f8',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
    },
    playlistIcon: {
        width: 48,
        height: 48,
        backgroundColor: '#e6f2ff',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    playlistInfo: {
        flex: 1,
    },
    playlistTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
        color: '#000',
    },
    playlistCount: {
        fontSize: 14,
        color: '#666',
    },
    deleteButton: {
        padding: 8,
    }
});
