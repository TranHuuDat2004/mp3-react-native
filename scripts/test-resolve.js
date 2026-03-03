const path = require('path');
const fs = require('fs');

const file = path.join(__dirname, '..', 'assets', 'img', 'fullscreen_view.PNG');
console.log('Checking file:', file);
console.log('Exists:', fs.existsSync(file));

try {
    const resolved = require.resolve('../assets/img/fullscreen_view.PNG');
    console.log('Resolved:', resolved);
} catch (e) {
    console.log('Resolve failed:', e.message);
}
