import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const publicDir = join(rootDir, 'public');
const logoIconSvg = join(publicDir, 'logo-icon.svg');

if (!existsSync(logoIconSvg)) {
  console.error(`Error: ${logoIconSvg} not found`);
  process.exit(1);
}

async function generatePNGs() {
  console.log('Generating PNG versions of logo-icon.svg...');
  
  const sizes = [
    { size: 16, name: 'favicon-16x16.png' },
    { size: 32, name: 'favicon-32x32.png' },
    { size: 64, name: 'logo-icon-64x64.png' },
    { size: 128, name: 'logo-icon-128x128.png' },
  ];

  for (const { size, name } of sizes) {
    try {
      await sharp(logoIconSvg)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toFile(join(publicDir, name));
      console.log(`✓ Generated ${name} (${size}x${size})`);
    } catch (error) {
      console.error(`✗ Error generating ${name}:`, error.message);
    }
  }
  
  console.log('Done!');
}

generatePNGs().catch(console.error);

