import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

const SIZES = [16, 32, 64, 128, 256, 512, 1024];
const ICON_PATH = 'icon.png';
const PUBLIC_DIR = 'public';

async function generateIcons() {
  console.log('>> GENERATING_ICON_ARRAY...');
  
  try {
    await fs.mkdir(PUBLIC_DIR, { recursive: true });
    
    for (const size of SIZES) {
      const fileName = `icon-${size}.png`;
      await sharp(ICON_PATH)
        .resize(size, size)
        .toFile(path.join(PUBLIC_DIR, fileName));
      console.log(`[READY]: ${fileName}`);
    }
    
    // Also update main icon.png in public
    await sharp(ICON_PATH)
      .resize(1024, 1024)
      .toFile(path.join(PUBLIC_DIR, 'icon.png'));
      
    console.log('<< ICON_ARRAY_SUCCESS');
  } catch (error) {
    console.error('!! ICON_FAILURE:', error);
  }
}

generateIcons();
