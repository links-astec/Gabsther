#!/usr/bin/env node
/**
 * generate-icons.mjs
 * Generates all required PWA icons and splash screens for Gabsther.
 *
 * Run with: node generate-icons.mjs
 * Requires: npm install canvas
 */

import { createCanvas } from 'canvas';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = join(__dirname, 'public');

// ─── Icon sizes required ──────────────────────────────────────────────────────
const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

// Also need a 32x32 for favicon
const FAVICON_SIZES = [32];

// ─── Splash screen sizes for iOS ──────────────────────────────────────────────
const SPLASH_SCREENS = [
  { width: 2048, height: 2732 }, // iPad Pro 12.9"
  { width: 1668, height: 2388 }, // iPad Pro 11"
  { width: 1536, height: 2048 }, // iPad Mini / Air
  { width: 1125, height: 2436 }, // iPhone X/XS
  { width: 1242, height: 2688 }, // iPhone XS Max
  { width: 828,  height: 1792 }, // iPhone XR
  { width: 1242, height: 2208 }, // iPhone 8 Plus
  { width: 750,  height: 1334 }, // iPhone 8
  { width: 640,  height: 1136 }, // iPhone SE
];

// ─── Brand colors ─────────────────────────────────────────────────────────────
const BRAND_BLUE = '#2563eb';
const BRAND_BLUE_DARK = '#1d4ed8';
const INDIGO = '#4f46e5';
const WHITE = '#ffffff';

// ─── Draw Icon ────────────────────────────────────────────────────────────────
function drawIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  const r = size * 0.22; // corner radius

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, BRAND_BLUE);
  grad.addColorStop(1, INDIGO);

  // Rounded rect background
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(size - r, 0);
  ctx.quadraticCurveTo(size, 0, size, r);
  ctx.lineTo(size, size - r);
  ctx.quadraticCurveTo(size, size, size - r, size);
  ctx.lineTo(r, size);
  ctx.quadraticCurveTo(0, size, 0, size - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Mic icon (simplified SVG path drawn manually)
  const cx = size / 2;
  const cy = size / 2;
  const micW = size * 0.22;
  const micH = size * 0.32;
  const micR = micW / 2;

  ctx.fillStyle = WHITE;
  ctx.strokeStyle = WHITE;
  ctx.lineWidth = size * 0.055;
  ctx.lineCap = 'round';

  // Mic body (rounded rectangle)
  const bodyX = cx - micW / 2;
  const bodyY = cy - micH / 2 - size * 0.04;
  ctx.beginPath();
  ctx.moveTo(bodyX + micR, bodyY);
  ctx.lineTo(bodyX + micW - micR, bodyY);
  ctx.quadraticCurveTo(bodyX + micW, bodyY, bodyX + micW, bodyY + micR);
  ctx.lineTo(bodyX + micW, bodyY + micH - micR);
  ctx.quadraticCurveTo(bodyX + micW, bodyY + micH, bodyX + micW - micR, bodyY + micH);
  ctx.lineTo(bodyX + micR, bodyY + micH);
  ctx.quadraticCurveTo(bodyX, bodyY + micH, bodyX, bodyY + micH - micR);
  ctx.lineTo(bodyX, bodyY + micR);
  ctx.quadraticCurveTo(bodyX, bodyY, bodyX + micR, bodyY);
  ctx.closePath();
  ctx.fill();

  // Arc below mic
  const arcY = bodyY + micH + size * 0.005;
  const arcR = size * 0.2;
  ctx.beginPath();
  ctx.arc(cx, arcY, arcR, Math.PI, 0, false);
  ctx.stroke();

  // Vertical line (stand)
  const lineTop = arcY;
  const lineBottom = arcY + size * 0.12;
  ctx.beginPath();
  ctx.moveTo(cx, lineTop);
  ctx.lineTo(cx, lineBottom);
  ctx.stroke();

  // Horizontal base line
  const baseW = size * 0.24;
  ctx.beginPath();
  ctx.moveTo(cx - baseW / 2, lineBottom);
  ctx.lineTo(cx + baseW / 2, lineBottom);
  ctx.stroke();

  return canvas;
}

// ─── Draw Splash Screen ───────────────────────────────────────────────────────
function drawSplash(width, height) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Background
  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, '#eff6ff');  // blue-50
  grad.addColorStop(1, '#e0e7ff');  // indigo-100
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Center icon
  const iconSize = Math.min(width, height) * 0.22;
  const iconX = (width - iconSize) / 2;
  const iconY = (height - iconSize) / 2 - height * 0.04;

  // Draw the icon centered
  const iconCanvas = drawIcon(iconSize);
  ctx.drawImage(iconCanvas, iconX, iconY, iconSize, iconSize);

  // App name below icon
  const fontSize = Math.min(width, height) * 0.04;
  ctx.fillStyle = '#1e3a8a';
  ctx.font = `900 ${fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('Gabsther', width / 2, iconY + iconSize + height * 0.025);

  // Tagline
  const tagSize = fontSize * 0.55;
  ctx.fillStyle = '#3b82f6';
  ctx.font = `500 ${tagSize}px -apple-system, BlinkMacSystemFont, sans-serif`;
  ctx.fillText('Learn French by Speaking', width / 2, iconY + iconSize + height * 0.025 + fontSize * 1.3);

  return canvas;
}

// ─── Generate Files ───────────────────────────────────────────────────────────
function main() {
  // Create directories
  mkdirSync(join(PUBLIC_DIR, 'icons'), { recursive: true });
  mkdirSync(join(PUBLIC_DIR, 'splash'), { recursive: true });

  console.log('Generating icons...');
  for (const size of [...ICON_SIZES, ...FAVICON_SIZES]) {
    const canvas = drawIcon(size);
    const buffer = canvas.toBuffer('image/png');
    const path = join(PUBLIC_DIR, 'icons', `icon-${size}x${size}.png`);
    writeFileSync(path, buffer);
    console.log(`  ✓ icon-${size}x${size}.png`);
  }

  console.log('\nGenerating splash screens...');
  for (const { width, height } of SPLASH_SCREENS) {
    const canvas = drawSplash(width, height);
    const buffer = canvas.toBuffer('image/png');
    const path = join(PUBLIC_DIR, 'splash', `splash-${width}x${height}.png`);
    writeFileSync(path, buffer);
    console.log(`  ✓ splash-${width}x${height}.png`);
  }

  console.log('\n✅ All assets generated successfully!');
  console.log('Icons saved to: public/icons/');
  console.log('Splashes saved to: public/splash/');
}

main();
