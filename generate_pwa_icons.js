const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function crc32(buf) {
  let table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    table[n] = c;
  }
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData), 0);
  return Buffer.concat([len, typeAndData, crc]);
}

function createPng(width, height, pixelFn) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  
  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bits per channel
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0; // compression deflate
  ihdrData[11] = 0; // filter default
  ihdrData[12] = 0; // non-interlaced
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // Scanlines with filter byte 0
  const scanlines = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;
  for (let y = 0; y < height; y++) {
    scanlines[offset++] = 0; // filter: None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = pixelFn(x, y, width, height);
      scanlines[offset++] = r;
      scanlines[offset++] = g;
      scanlines[offset++] = b;
      scanlines[offset++] = a;
    }
  }

  const compressedData = zlib.deflateSync(scanlines);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Draw athletic VECTR chevron & joint nodes with neon glow
function renderVectrIcon(x, y, w, h) {
  const cx = w / 2;
  const cy = h / 2;
  const dx = (x - cx) / (w / 2);
  const dy = (y - cy) / (h / 2);
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Base dark background: #07090E
  let r = 7, g = 9, b = 14, a = 255;

  // Background radial ambient glow
  const glow = Math.max(0, 1 - dist * 1.1);
  r += Math.round(glow * 10);
  g += Math.round(glow * 50);
  b += Math.round(glow * 40);

  // Rounded outer squircle border (0.85 radius)
  const squircle = Math.pow(Math.abs(dx), 3.5) + Math.pow(Math.abs(dy), 3.5);
  if (squircle > 0.65 && squircle < 0.82) {
    // Gradient from emerald (#10B981) to cyan (#06B6D4)
    const t = (dx + 1) / 2;
    r = Math.round(16 * (1 - t) + 6 * t);
    g = Math.round(185 * (1 - t) + 182 * t);
    b = Math.round(129 * (1 - t) + 212 * t);
    a = 255;
  }

  // Draw Central 'V' Chevron representing athletic pose/vector
  // V arms: from (-0.45, -0.35) to (0, 0.4) and (0.45, -0.35) to (0, 0.4)
  const px = dx;
  const py = dy;

  // Check distance to Left arm
  // Line segment: p1=(-0.38, -0.32) to p2=(0, 0.35)
  const dLeft = distToSegment(px, py, -0.38, -0.32, 0, 0.35);
  // Check distance to Right arm
  // Line segment: p1=(0.38, -0.32) to p2=(0, 0.35)
  const dRight = distToSegment(px, py, 0.38, -0.32, 0, 0.35);
  // Horizontal crossbar at top for biomechanical joint grid: (-0.25, -0.1) to (0.25, -0.1)
  const dCross = distToSegment(px, py, -0.22, -0.05, 0.22, -0.05);

  const minD = Math.min(dLeft, dRight);
  const thickness = 0.085;

  if (minD < thickness) {
    const intensity = 1 - minD / thickness;
    // Core neon color: bright cyan-emerald (#34D399 to #22D3EE)
    const t = (px + 0.4) / 0.8;
    const coreR = Math.round(52 * (1 - t) + 34 * t);
    const coreG = Math.round(211 * (1 - t) + 211 * t);
    const coreB = Math.round(153 * (1 - t) + 238 * t);
    r = Math.round(r * (1 - intensity) + coreR * intensity);
    g = Math.round(g * (1 - intensity) + coreG * intensity);
    b = Math.round(b * (1 - intensity) + coreB * intensity);
  } else if (minD < thickness * 2.2) {
    // Neon bloom aura
    const bloom = 1 - (minD - thickness) / (thickness * 1.2);
    r = Math.min(255, r + Math.round(bloom * 16));
    g = Math.min(255, g + Math.round(bloom * 140));
    b = Math.min(255, b + Math.round(bloom * 160));
  }

  // Joint nodes (circular highlights at vertex points)
  const nodes = [
    [-0.38, -0.32],
    [0.38, -0.32],
    [0, 0.35],
    [-0.22, -0.05],
    [0.22, -0.05],
  ];

  for (const [nx, ny] of nodes) {
    const ndist = Math.sqrt((px - nx) * (px - nx) + (py - ny) * (py - ny));
    if (ndist < 0.065) {
      r = 255;
      g = 255;
      b = 255;
      break;
    } else if (ndist < 0.12) {
      const bloom = 1 - (ndist - 0.065) / 0.055;
      g = Math.min(255, g + Math.round(bloom * 180));
      b = Math.min(255, b + Math.round(bloom * 220));
    }
  }

  return [Math.min(255, r), Math.min(255, g), Math.min(255, b), a];
}

function distToSegment(px, py, x1, y1, x2, y2) {
  const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
  if (l2 === 0) return Math.sqrt((px - x1) * (px - x1) + (py - y1) * (py - y1));
  let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
  t = Math.max(0, Math.min(1, t));
  const projX = x1 + t * (x2 - x1);
  const projY = y1 + t * (y2 - y1);
  return Math.sqrt((px - projX) * (px - projX) + (py - projY) * (py - projY));
}

const iconsDir = path.join(__dirname, 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

console.log('Generating 192x192 PNG...');
const png192 = createPng(192, 192, renderVectrIcon);
fs.writeFileSync(path.join(iconsDir, 'icon-192x192.png'), png192);

console.log('Generating 512x512 PNG...');
const png512 = createPng(512, 512, renderVectrIcon);
fs.writeFileSync(path.join(iconsDir, 'icon-512x512.png'), png512);
fs.writeFileSync(path.join(iconsDir, 'maskable-icon-512x512.png'), png512);

console.log('PWA icons successfully generated in public/icons/');
