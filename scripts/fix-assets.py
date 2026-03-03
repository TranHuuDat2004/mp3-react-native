import json
import os

root_dir = r"c:\Users\huuda\OneDrive\Documents\GitHub\starter-react-native\my-app"
music_json_path = os.path.join(root_dir, "assets", "data", "music.json")
assets_dir = os.path.join(root_dir, "assets")
output_map_path = os.path.join(root_dir, "constants", "assets-map.ts")

def fix_assets():
    with open(music_json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    used_assets = set()
    for category in data:
        for song in category['songs']:
            used_assets.add(song['artUrl'])
            used_assets.add(song['audioSrc'])
    
    mapping = {}
    updated_paths = {}

    for asset_rel_path in used_assets:
        full_path = os.path.join(assets_dir, asset_rel_path.replace('/', os.sep))
        
        # Check if file exists. If not, look case-insensitively.
        if not os.path.exists(full_path):
            dir_path = os.path.dirname(full_path)
            if os.path.exists(dir_path):
                files = os.listdir(dir_path)
                target = os.path.basename(full_path).lower()
                for f in files:
                    if f.lower() == target:
                        old_full_path = os.path.join(dir_path, f)
                        # Rename to lowercase extension or match what we expect
                        new_name = f.lower().replace(' ', '_')
                        new_full_path = os.path.join(dir_path, new_name)
                        os.rename(old_full_path, new_full_path)
                        full_path = new_full_path
                        updated_paths[asset_rel_path] = asset_rel_path.split('/')[0] + '/' + new_name
                        break
        
        # Even if it exists, let's normalize the name for bundling stability
        if os.path.exists(full_path):
            dir_path = os.path.dirname(full_path)
            old_name = os.path.basename(full_path)
            new_name = old_name.replace(' ', '_').lower()
            if old_name != new_name:
                new_full_path = os.path.join(dir_path, new_name)
                # Handle case where new_full_path already exists (e.g. on case-insensitive OS)
                if old_name.lower() == new_name.lower():
                    # Just rename on Windows
                    os.rename(full_path, new_full_path)
                else:
                    os.rename(full_path, new_full_path)
                
                new_rel_path = asset_rel_path.split('/')[0] + '/' + new_name
                updated_paths[asset_rel_path] = new_rel_path
                asset_rel_path = new_rel_path

            mapping[asset_rel_path] = f'require("../assets/{asset_rel_path}")'

    # Update music.json
    if updated_paths:
        for category in data:
            for song in category['songs']:
                if song['artUrl'] in updated_paths:
                    song['artUrl'] = updated_paths[song['artUrl']]
                if song['audioSrc'] in updated_paths:
                    song['audioSrc'] = updated_paths[song['audioSrc']]
        
        with open(music_json_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=4, ensure_ascii=False)

    # Generate AssetMap
    lines = ["export const AssetMap: Record<string, any> = {"]
    for rel_path, req in sorted(mapping.items()):
        lines.append(f'  "{rel_path}": {req},')
    lines.append("};")
    
    with open(output_map_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))

    print(f"Processed {len(mapping)} assets. Updated {len(updated_paths)} paths.")

if __name__ == "__main__":
    fix_assets()
