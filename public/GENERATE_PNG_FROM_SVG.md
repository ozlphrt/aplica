# Generate PNG from SVG Logo

To create crisp raster versions of the logo for small sizes:

1. **Using online converter:**
   - Go to https://svgtopng.com/ or https://convertio.co/svg-png/
   - Upload `logo-icon.svg`
   - Export at these sizes:
     - `favicon-16x16.png` (16x16)
     - `favicon-32x32.png` (32x32)
     - `logo-icon-64x64.png` (64x64)
     - `logo-icon-128x128.png` (128x128)

2. **Using ImageMagick (if installed):**
   ```bash
   magick logo-icon.svg -resize 16x16 favicon-16x16.png
   magick logo-icon.svg -resize 32x32 favicon-32x32.png
   magick logo-icon.svg -resize 64x64 logo-icon-64x64.png
   ```

3. **Using Sharp in Node.js:**
   ```bash
   npm install --save-dev sharp
   node -e "const sharp = require('sharp'); sharp('public/logo-icon.svg').resize(32, 32).png().toFile('public/favicon-32x32.png')"
   ```

Place the PNG files in the `public/` directory and update the navigation/favicon references if needed.

