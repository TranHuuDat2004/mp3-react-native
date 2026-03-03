-- RUN THIS IN SUPABASE SQL EDITOR --

-- 1. Create Categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Songs table
CREATE TABLE songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  artist_data TEXT,
  art_url TEXT,
  audio_src TEXT,
  plays TEXT, -- keeping text as per your music.json plays format "40.789.123"
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE categories ENABLE CONTROL ROW LEVEL SECURITY;
ALTER TABLE songs ENABLE CONTROL ROW LEVEL SECURITY;

-- 4. Create policies to allow public read (for testing)
CREATE POLICY "Public Read Access" ON categories FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON songs FOR SELECT USING (true);
