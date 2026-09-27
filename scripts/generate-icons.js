import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function crc32(buf) {
  let table = new Int32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ -1) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcInput = Buffer.concat([typeBuf, data]);
  const crcVal = Buffer.alloc(4);
  crcVal.writeUInt32BE(crc32(crcInput), 0);
  return Buffer.concat([len, typeBuf, data, crcVal]);
}

function createPng(width, height, drawPixel) {
  const sig = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  
  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // Raw image data with 1 filter byte per line
  const rawLineLen = 1 + width * 4;
  const rawData = Buffer.alloc(height * rawLineLen);

  for (let y = 0; y < height; y++) {
    const lineOffset = y * rawLineLen;
    rawData[lineOffset] = 0; // None filter
    for (let x = 0; x < width; x++) {
      const pxOffset = lineOffset + 1 + x * 4;
      const [r, g, b, a] = drawPixel(x, y, width, height);
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

// Ensure public dir exists
const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Echo Chatbot icon artwork renderer (Amber / Gold rounded badge with sparkle chatbot emblem)
function drawChatbotIcon(x, y, width, height) {
  const cx = width / 2;
  const cy = height / 2;
  const rCorner = width * 0.22;
  const minX = width * 0.06;
  const maxX = width * 0.94;
  const minY = height * 0.06;
  const maxY = height * 0.94;

  // Check if inside rounded rectangle
  const inRectX = x >= minX + rCorner && x <= maxX - rCorner;
  const inRectY = y >= minY + rCorner && y <= maxY - rCorner;
  let insideCard = inRectX || inRectY;

  if (!insideCard) {
    const checkCorner = (cxCorner, cyCorner) => {
      const dx = x - cxCorner;
      const dy = y - cyCorner;
      return dx * dx + dy * dy <= rCorner * rCorner;
    };
    insideCard =
      checkCorner(minX + rCorner, minY + rCorner) ||
      checkCorner(maxX - rCorner, minY + rCorner) ||
      checkCorner(minX + rCorner, maxY - rCorner) ||
      checkCorner(maxX - rCorner, maxY - rCorner);
  }

  if (!insideCard) {
    return [0, 0, 0, 0]; // Transparent
  }

  // Gradient background: Deep warm stone/slate to dark amber/bronze
  const gradT = (y / height) * 0.8 + (x / width) * 0.2;
  let bgR = Math.round(28 + gradT * 25);
  let bgG = Math.round(25 + gradT * 15);
  let bgB = Math.round(23 + gradT * 10);

  // Subtle border highlight
  const distFromCenter = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
  const maxR = width * 0.44;

  // Sparkle / Chatbot star emblem in center
  // Center 4-point curved star
  const nx = (x - cx) / (width * 0.3);
  const ny = (y - cy) / (height * 0.3);
  const starDist = Math.sqrt(Math.abs(nx)) + Math.sqrt(Math.abs(ny));

  if (starDist <= 1.0) {
    // Inside central AI sparkle (Vibrant Amber/Gold gradient #f59e0b to #fbbf24)
    const starGlow = 1.0 - starDist;
    const sR = Math.round(245 + starGlow * 10);
    const sG = Math.round(158 + starGlow * 35);
    const sB = Math.round(11 + starGlow * 50);
    return [sR, sG, sB, 255];
  }

  // Small satellite sparkle (top right)
  const sx = (x - (cx + width * 0.22)) / (width * 0.12);
  const sy = (y - (cy - height * 0.22)) / (height * 0.12);
  const satDist = Math.sqrt(Math.abs(sx)) + Math.sqrt(Math.abs(sy));
  if (satDist <= 1.0) {
    return [251, 191, 36, 255];
  }

  // Soft glow around center
  if (distFromCenter < width * 0.38) {
    const glow = (1 - distFromCenter / (width * 0.38)) * 0.25;
    bgR = Math.min(255, Math.round(bgR + 245 * glow));
    bgG = Math.min(255, Math.round(bgG + 158 * glow));
    bgB = Math.min(255, Math.round(bgB + 11 * glow));
  }

  return [bgR, bgG, bgB, 255];
}

// Generate 192x192 PNG
const png192 = createPng(192, 192, drawChatbotIcon);
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), png192);

// Generate 512x512 PNG
const png512 = createPng(512, 512, drawChatbotIcon);
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), png512);

// Generate apple-touch-icon 180x180
const png180 = createPng(180, 180, drawChatbotIcon);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), png180);

// Generate maskable 512x512 PNG with extra padding (central 80% safe zone)
function drawMaskableIcon(x, y, width, height) {
  // Scale down coordinate into center 75%
  const scale = 0.75;
  const cx = width / 2;
  const cy = height / 2;
  const scaledX = (x - cx) / scale + cx;
  const scaledY = (y - cy) / scale + cy;

  if (scaledX >= 0 && scaledX < width && scaledY >= 0 && scaledY < height) {
    const px = drawChatbotIcon(scaledX, scaledY, width, height);
    if (px[3] > 0) return px;
  }
  // Safe zone background
  return [28, 25, 23, 255];
}
const pngMaskable = createPng(512, 512, drawMaskableIcon);
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), pngMaskable);

// Also write crisp SVG icon
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1c1917"/>
      <stop offset="100%" stop-color="#292524"/>
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24"/>
      <stop offset="100%" stop-color="#d97706"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="16" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
  <!-- Background Card -->
  <rect x="24" y="24" width="464" height="464" rx="112" fill="url(#bgGrad)" stroke="#d97706" stroke-width="6" stroke-opacity="0.3"/>
  <!-- Subtle Glow -->
  <circle cx="256" cy="256" r="140" fill="#f59e0b" fill-opacity="0.12" filter="url(#glow)"/>
  <!-- Primary Sparkle / Chatbot AI Emblem -->
  <path d="M256 96 C256 184 184 256 96 256 C184 256 256 328 256 416 C256 328 328 256 416 256 C328 256 256 184 256 96 Z" fill="url(#goldGrad)" filter="url(#glow)"/>
  <!-- Secondary Sparkle -->
  <path d="M374 116 C374 146 348 170 318 170 C348 170 374 194 374 224 C374 194 398 170 428 170 C398 170 374 146 374 116 Z" fill="#fef3c7"/>
</svg>`;
fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent);

console.log('Successfully generated all PWA icons!');
