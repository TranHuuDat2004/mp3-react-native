import json

with open('your_file_path/music.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

sql = "-- Seed data for categories and songs\n"
sql += "TRUNCATE categories, songs CASCADE;\n\n"

category_inserts = []
song_inserts = []

for category in data:
    cat_id = category['id']
    cat_title = category['title'].replace("'", "''")
    category_inserts.append(f"INSERT INTO categories (id, title) VALUES ('{cat_id}', '{cat_title}') ON CONFLICT (id) DO NOTHING;")
    
    for song in category['songs']:
        song_title = song['title'].replace("'", "''")
        song_artist = song['artistData'].replace("'", "''")
        # Generate a stable UUID-like ID or just let it be random/provided? 
        # The app uses title/artist to look it up, so the ID in DB doesn't have to match json ID perfectly, 
        # but it's better if they are consistent.
        song_inserts.append(f"INSERT INTO songs (title, artist_data, category_id) VALUES ('{song_title}', '{song_artist}', '{cat_id}');")

sql += "\n".join(category_inserts)
sql += "\n\n"
sql += "\n".join(song_inserts)

with open('your_file_path/seed_data.sql', 'w', encoding='utf-8') as f:
    f.write(sql)

print("seed_data.sql generated successfully!")
