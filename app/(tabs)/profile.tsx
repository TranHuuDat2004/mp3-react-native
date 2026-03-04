import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            setIsLoading(false);
        };
        fetchUser();
    }, []);

    const handleSignOut = async () => {
        Alert.alert(
            'Sign Out',
            'Are you sure you want to log out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Sign Out',
                    style: 'destructive',
                    onPress: async () => {
                        const { error } = await supabase.auth.signOut();
                        if (error) {
                            Alert.alert('Error', error.message);
                        }
                    }
                },
            ]
        );
    };

    if (isLoading) {
        return (
            <ThemedView style={styles.container}>
                <ActivityIndicator size="large" color="#007AFF" />
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.avatarContainer}>
                    <Ionicons name="person" size={64} color="#007AFF" />
                </View>
                <ThemedText type="title" style={styles.name}>
                    {user?.user_metadata?.full_name || 'User'}
                </ThemedText>
                <ThemedText style={styles.email}>{user?.email}</ThemedText>
            </View>

            <View style={styles.menu}>
                <TouchableOpacity style={styles.menuItem} onPress={() => { }}>
                    <Ionicons name="settings-outline" size={24} color="#333" />
                    <ThemedText style={styles.menuText}>Account Settings</ThemedText>
                    <Ionicons name="chevron-forward" size={20} color="#ccc" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={() => { }}>
                    <Ionicons name="notifications-outline" size={24} color="#333" />
                    <ThemedText style={styles.menuText}>Notifications</ThemedText>
                    <Ionicons name="chevron-forward" size={20} color="#ccc" />
                </TouchableOpacity>

                <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={handleSignOut}>
                    <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
                    <ThemedText style={[styles.menuText, styles.logoutText]}>Sign Out</ThemedText>
                </TouchableOpacity>
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 80,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    avatarContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    email: {
        fontSize: 16,
        color: '#888',
        marginTop: 4,
    },
    menu: {
        paddingHorizontal: 20,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    menuText: {
        flex: 1,
        marginLeft: 16,
        fontSize: 16,
    },
    logoutItem: {
        marginTop: 40,
        borderBottomWidth: 0,
    },
    logoutText: {
        color: '#FF3B30',
        fontWeight: '600',
    },
});
