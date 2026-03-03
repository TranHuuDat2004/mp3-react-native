/**
 * MIGRATION SCRIPT: music.json -> Supabase
 * 
 * TO RUN THIS:
 * 1. Fill in your Supabase URL and Key in c:\Users\huuda\OneDrive\Documents\GitHub\starter-react-native\my-app\lib\supabase.ts
 * 2. Run this command: node scripts/migrate-to-supabase.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// --- CONFIG ---
// Copy these from your Supabase dashboard
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function migrate() {
    console.log('--- Starting Migration ---');

    const musicData = JSON.parse(fs.readFileSync(path.join(__dirname, '../assets/data/music.json'), 'utf8'));

    for (const category of musicData) {
        console.log(`Processing Category: ${category.title}...`);

        // 1. Insert Category
        const { data: catData, error: catError } = await supabase
            .from('categories')
            .upsert({ title: category.title })
            .select()
            .single();

        if (catError) {
            console.error(`Error inserting category ${category.title}:`, catError.message);
            continue;
        }

        const categoryId = catData.id;

        // 2. Insert Songs
        const songsToInsert = category.songs.map(song => ({
            category_id: categoryId,
            title: song.title,
            artist_data: song.artistData,
            art_url: song.artUrl,
            audio_src: song.audioSrc,
            plays: String(song.plays),
            is_favorite: song.isFavorite || false
        }));

        const { error: songsError } = await supabase
            .from('songs')
            .insert(songsToInsert);

        if (songsError) {
            console.error(`Error inserting songs for ${category.title}:`, songsError.message);
        } else {
            console.log(`Successfully migrated ${songsToInsert.length} songs for ${category.title}.`);
        }
    }

    console.log('--- Migration Finished ---');
}

migrate();
