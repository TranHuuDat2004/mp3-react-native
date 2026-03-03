import os

audio_dir = r"c:\Users\huuda\OneDrive\Documents\GitHub\starter-react-native\my-app\assets\audio"
img_dir = r"c:\Users\huuda\OneDrive\Documents\GitHub\starter-react-native\my-app\assets\img"
output_file = r"c:\Users\huuda\OneDrive\Documents\GitHub\starter-react-native\my-app\constants\assets-map.ts"

def generate_map():
    lines = ["export const AssetMap: Record<string, any> = {"]
    
    # Process audio
    for entry in os.scandir(audio_dir):
        if entry.is_file():
            name = entry.name
            lines.append(f'  "audio/{name}": require("../assets/audio/{name}"),')
            
    # Process images
    for entry in os.scandir(img_dir):
        if entry.is_file():
            name = entry.name
            lines.append(f'  "img/{name}": require("../assets/img/{name}"),')
            
    lines.append("};")
    
    with open(output_file, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

if __name__ == "__main__":
    generate_map()
