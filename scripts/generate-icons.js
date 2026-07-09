const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function encodePNG(width, height, rgba) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 6;
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdr = chunk('IHDR', ihdrData);

  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }

  const idat = chunk('IDAT', zlib.deflateSync(raw, { level: 9 }));
  const iend = chunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function hexToRgb(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function distToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  let t = lenSq === 0 ? 0 : ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const cx = x1 + t * dx;
  const cy = y1 + t * dy;
  return Math.hypot(px - cx, py - cy);
}

function insideRoundedSquare(x, y, size, radius) {
  const cx = Math.min(Math.max(x, radius), size - radius);
  const cy = Math.min(Math.max(y, radius), size - radius);
  const dx = x - cx;
  const dy = y - cy;
  return dx * dx + dy * dy <= radius * radius;
}

function scaleAroundCenter(px, py, scale, size) {
  const c = size / 2;
  return [c + (px - c) * scale, c + (py - c) * scale];
}

function generateIcon({ size, cornerRadius, checkScale }) {
  const colorA = hexToRgb('#2563eb');
  const colorB = hexToRgb('#0f172a');
  const buffer = Buffer.alloc(size * size * 4);
  const strokeWidth = Math.max(2, size * 0.06);

  const [ax, ay] = scaleAroundCenter(size * 0.28, size * 0.52, checkScale, size);
  const [bx, by] = scaleAroundCenter(size * 0.44, size * 0.66, checkScale, size);
  const [cx, cy] = scaleAroundCenter(size * 0.76, size * 0.38, checkScale, size);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const inside = cornerRadius > 0 ? insideRoundedSquare(x + 0.5, y + 0.5, size, cornerRadius) : true;

      if (!inside) {
        buffer[idx] = 0;
        buffer[idx + 1] = 0;
        buffer[idx + 2] = 0;
        buffer[idx + 3] = 0;
        continue;
      }

      const t = (x + y) / (size * 2);
      let r = lerp(colorA[0], colorB[0], t);
      let g = lerp(colorA[1], colorB[1], t);
      let b = lerp(colorA[2], colorB[2], t);

      const d = Math.min(distToSegment(x, y, ax, ay, bx, by), distToSegment(x, y, bx, by, cx, cy));
      if (d < strokeWidth / 2) {
        const edge = strokeWidth / 2 - d;
        const alpha = Math.min(1, edge / 1.5);
        r = lerp(r, 255, alpha);
        g = lerp(g, 255, alpha);
        b = lerp(b, 255, alpha);
      }

      buffer[idx] = Math.round(r);
      buffer[idx + 1] = Math.round(g);
      buffer[idx + 2] = Math.round(b);
      buffer[idx + 3] = 255;
    }
  }

  return encodePNG(size, size, buffer);
}

const outDir = path.join(__dirname, '..', 'public', 'icons');
fs.mkdirSync(outDir, { recursive: true });

const targets = [
  { name: 'icon-192.png', size: 192, cornerRadius: 192 * 0.22, checkScale: 1 },
  { name: 'icon-512.png', size: 512, cornerRadius: 512 * 0.22, checkScale: 1 },
  { name: 'icon-maskable-512.png', size: 512, cornerRadius: 0, checkScale: 0.7 },
  { name: 'apple-touch-icon.png', size: 180, cornerRadius: 180 * 0.22, checkScale: 1 },
  { name: 'favicon-32.png', size: 32, cornerRadius: 32 * 0.22, checkScale: 1 },
];

targets.forEach(({ name, size, cornerRadius, checkScale }) => {
  const png = generateIcon({ size, cornerRadius, checkScale });
  fs.writeFileSync(path.join(outDir, name), png);
  console.log(`Olusturuldu: ${name} (${size}x${size})`);
});
