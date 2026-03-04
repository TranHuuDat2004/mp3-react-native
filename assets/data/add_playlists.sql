-- RUN THIS IN SUPABASE SQL EDITOR --

-- 1. Create Playlists Table
CREATE TABLE playlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Playlist_Songs Junction Table
CREATE TABLE playlist_songs (
    playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
    song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (playlist_id, song_id) -- Prevent duplicate songs in the same playlist
);

-- 3. Row Level Security Setup
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_songs ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for Playlists
-- Users can only see their own playlists
CREATE POLICY "Users can view own playlists" ON playlists 
    FOR SELECT USING (auth.uid() = user_id);

-- Users can only create their own playlists
CREATE POLICY "Users can insert own playlists" ON playlists 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own playlists (e.g., change title)
CREATE POLICY "Users can update own playlists" ON playlists 
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can only delete their own playlists
CREATE POLICY "Users can delete own playlists" ON playlists 
    FOR DELETE USING (auth.uid() = user_id);

-- 5. RLS Policies for Playlist_Songs
-- Users can view songs in their own playlists
CREATE POLICY "Users can view their playlist songs" ON playlist_songs 
    FOR SELECT USING (
        playlist_id IN (SELECT id FROM playlists WHERE user_id = auth.uid())
    );

-- Users can add songs to their own playlists
CREATE POLICY "Users can add songs to their playlists" ON playlist_songs 
    FOR INSERT WITH CHECK (
        playlist_id IN (SELECT id FROM playlists WHERE user_id = auth.uid())
    );

-- Users can remove songs from their own playlists
CREATE POLICY "Users can remove songs from their playlists" ON playlist_songs 
    FOR DELETE USING (
        playlist_id IN (SELECT id FROM playlists WHERE user_id = auth.uid())
    );
