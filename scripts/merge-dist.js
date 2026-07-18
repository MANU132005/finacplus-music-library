import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const musicDist = path.join(rootDir, 'music-library', 'dist');
const hostDist = path.join(rootDir, 'host', 'dist');

function copyDirSync(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

if (fs.existsSync(musicDist) && fs.existsSync(hostDist)) {
  console.log('Merging music-library/dist into host/dist...');
  copyDirSync(musicDist, hostDist);
  console.log('Successfully merged MFE build artifacts into host/dist!');
} else {
  console.error('Error: music-library/dist or host/dist missing before merge.');
  process.exit(1);
}
