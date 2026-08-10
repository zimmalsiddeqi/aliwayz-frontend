// Run: node scripts/generate-favicons.js
// Requires: npm install sharp (dev dependency, already installed)

import sharp from 'sharp';
import { writeFileSync } from 'fs';

const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#5B6EF5"/>
      <stop offset="100%" style="stop-color:#8B5CF6"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="128" fill="url(#bg)"/>
  <text x="256" y="340" font-family="Arial,sans-serif" font-size="320" font-weight="bold" fill="white" text-anchor="middle">A</text>
</svg>
`;

const sizes = [16, 32, 48, 64, 128, 180, 192, 512];

async function generate() {
  const svgBuffer = Buffer.from(svgContent);

  for (const size of sizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(`public/favicon-${size}x${size}.png`);

    console.log(`✅ Generated favicon-${size}x${size}.png`);
  }

  // Also generate as favicon.ico size
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile('public/favicon.png');

  console.log('✅ All favicons generated!');
}

generate().catch(console.error);