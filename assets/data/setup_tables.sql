-- === RUN THIS IN SUPABASE SQL EDITOR FIRST ===
-- This script (re)builds the database structure to match the app's music.json data.
-- WARNING: This will delete existing Data in those specific tables.

-- 1. CLEANUP (Drop in order of dependencies)
DROP TABLE IF EXISTS playlist_songs CASCADE;
DROP TABLE IF EXISTS songs CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS playlists CASCADE;

-- 2. CREATE CATEGORIES
-- We use TEXT for ID because music.json uses strings like 'Vpop', 'ElectronicEDM'
CREATE TABLE categories (
    id TEXT PRIMARY KEY, 
    title TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CREATE SONGS
CREATE TABLE songs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    artist_data TEXT NOT NULL,
    category_id TEXT REFERENCES categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CREATE PLAYLISTS
CREATE TABLE playlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. CREATE JUNCTION TABLE
CREATE TABLE playlist_songs (
    playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
    song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (playlist_id, song_id)
);

-- 6. SECURITY (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_songs ENABLE ROW LEVEL SECURITY;

-- Read policies (Everyone can read library)
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read songs" ON songs FOR SELECT USING (true);

-- Playlist policies (User specific)
CREATE POLICY "Users can view own playlists" ON playlists 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own playlists" ON playlists 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own playlists" ON playlists 
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own playlists" ON playlists 
    FOR DELETE USING (auth.uid() = user_id);

-- Playlist Songs policies
CREATE POLICY "Users can view their playlist songs" ON playlist_songs 
    FOR SELECT USING (
        playlist_id IN (SELECT id FROM playlists WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can add songs to their playlists" ON playlist_songs 
    FOR INSERT WITH CHECK (
        playlist_id IN (SELECT id FROM playlists WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can remove songs from their playlists" ON playlist_songs 
    FOR DELETE USING (
        playlist_id IN (SELECT id FROM playlists WHERE user_id = auth.uid())
    );
